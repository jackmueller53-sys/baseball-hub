#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Baseball Hub — MiLB 2026 Data Fetcher (AAA rollout slice)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Runs in GitHub Actions (daily cron, offset 30 min from the MLB job). Pulls
 * AAA leaderboard data from FanGraphs and Baseball Savant, writes JSON files
 * into /data/milb/aaa/. Site loads them client-side on /pages/milb-aaa.html.
 *
 * Coverage (this slice):
 *   AAA — FanGraphs (bat, pit, disc-bat, disc-pit) + Savant Statcast (bat, pit, sprint)
 *
 * AA / A+ / FSL will be added in subsequent PRs.
 *
 * Design:
 *   - Independent of the MLB fetcher (scripts/fetch-2026.js). A crash here
 *     cannot affect MLB data.
 *   - Per-fetch try/catch. One source failing doesn't kill the whole run.
 *   - Empty/HTML responses SKIP the write — prior JSON is preserved, so the
 *     live MiLB pages never display a blank leaderboard due to a transient
 *     upstream failure.
 *   - Writes data/milb/meta-milb.json with counts + errors. The site uses this
 *     as a feature flag: if enabled=false (no successful fetches ever), the
 *     MiLB nav tab is not rendered.
 *
 * Usage:
 *   node scripts/fetch-milb-2026.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SEASON = 2026;
const ROOT_DATA_DIR = path.join(__dirname, '..', 'data');
const MILB_DIR = path.join(ROOT_DATA_DIR, 'milb');
const TIMEOUT = 30000;

// Ensure directory tree exists
['aaa'].forEach(lvl => {
  const dir = path.join(MILB_DIR, lvl);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// HTTP FETCH — shared helper pattern from scripts/fetch-2026.js
// ═══════════════════════════════════════════════════════════════════════════

function fetchURL(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) BaseballHub/1.0',
        'Accept': 'application/json, text/csv, text/plain, */*'
      }
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const parsed = new URL(url);
          redirectUrl = parsed.origin + redirectUrl;
        }
        return resolve(fetchURL(redirectUrl, maxRedirects - 1));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url.slice(0, 90)}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url.slice(0, 90)}`)); });
    req.on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CSV PARSER
// ═══════════════════════════════════════════════════════════════════════════

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length === 0 || (vals.length === 1 && vals[0] === '')) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let v = (vals[j] || '').trim();
      if (v !== '' && !isNaN(v)) v = parseFloat(v);
      obj[headers[j].trim()] = v;
    }
    rows.push(obj);
  }
  return rows;
}
function parseCSVLine(line) {
  const result = [];
  let current = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { result.push(current); current = ''; }
      else current += ch;
    }
  }
  result.push(current);
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEASON THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════

function getSeasonThresholds() {
  const miLBOpeningDay = new Date(SEASON, 2, 28); // approx Mar 28 for AAA
  const now = new Date();
  const daysIn = Math.max(0, Math.floor((now - miLBOpeningDay) / 86400000));
  let fgQualBat, fgQualPit, svMin;
  if (daysIn < 4)        { fgQualBat = 0;  fgQualPit = 0;  svMin = 1;  }
  else if (daysIn < 7)   { fgQualBat = 1;  fgQualPit = 0;  svMin = 1;  }
  else if (daysIn < 30)  { fgQualBat = 10; fgQualPit = 0;  svMin = 1;  }
  else if (daysIn < 60)  { fgQualBat = 30; fgQualPit = 10; svMin = 10; }
  else                   { fgQualBat = 75; fgQualPit = 30; svMin = 20; }
  console.log(` Day ${daysIn} → FG qual bat=${fgQualBat}, pit=${fgQualPit}, SV min=${svMin}`);
  return { fgQualBat, fgQualPit, svMin, daysIn };
}

// ═══════════════════════════════════════════════════════════════════════════
// FANGRAPHS AAA — tries `levels=` keyword first, falls back to `lg=` codes
// ═══════════════════════════════════════════════════════════════════════════

// AAA: International League + Pacific Coast League (`levels=1,2` / `lg=11,12`)
const FG_LEVELS = {
  aaa: { levels: '1,2', lgCodes: '11,12' }
};

async function fetchFGMiLB(statType, qual, fgType, levelKey) {
  const lvl = FG_LEVELS[levelKey];
  if (!lvl) throw new Error(`Unknown level: ${levelKey}`);

  const base = `https://www.fangraphs.com/api/leaders/minor-league/data`
    + `?pos=all&stats=${statType}&qual=${qual}&type=${fgType}`
    + `&season=${SEASON}&season1=${SEASON}&ind=0&team=0&pageitems=2000&pagenum=1`;

  // Probe 1: `levels=` keyword
  const urlA = `${base}&levels=${lvl.levels}&lg=all`;
  // Probe 2: `lg=` league-code list
  const urlB = `${base}&lg=${lvl.lgCodes}&levels=all`;

  for (const url of [urlA, urlB]) {
    try {
      console.log(`  FG probe: ${url.slice(60, 160)}...`);
      const text = await fetchURL(url);
      let parsed;
      try { parsed = JSON.parse(text); } catch { continue; }
      const rows = Array.isArray(parsed) ? parsed : (parsed.data || []);
      if (Array.isArray(rows) && rows.length > 0) {
        console.log(`   → ${rows.length} rows`);
        return rows;
      }
    } catch (e) {
      console.log(`   probe failed: ${e.message}`);
    }
  }
  console.log(`   → 0 rows from both probes`);
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════
// SAVANT AAA — probes `level=` then `sportId=` fallback
// ═══════════════════════════════════════════════════════════════════════════

const SV_LEVELS = {
  aaa: { level: 'aaa', sportId: 11 }
};

async function fetchSavantXStatsMiLB(type, minPA, levelKey) {
  const lvl = SV_LEVELS[levelKey];
  if (!lvl) throw new Error(`No Savant coverage for level: ${levelKey}`);

  const base = `https://baseballsavant.mlb.com/leaderboard/expected_statistics`
    + `?type=${type}&year=${SEASON}&position=&team=&min=${minPA}&csv=true`;

  const urls = [
    `${base}&level=${lvl.level}`,
    `${base}&sportId=${lvl.sportId}`
  ];

  for (const url of urls) {
    try {
      console.log(`  SV probe: ${url.slice(50, 160)}...`);
      const text = await fetchURL(url);
      if (text.trim().startsWith('<!') || text.trim().startsWith('<html')) {
        console.log('   → HTML page (no CSV for this param)');
        continue;
      }
      const rows = parseCSV(text);
      if (rows.length > 0) {
        console.log(`   → ${rows.length} rows`);
        return rows;
      }
    } catch (e) {
      console.log(`   probe failed: ${e.message}`);
    }
  }
  console.log('   → 0 rows from both probes');
  return [];
}

async function fetchSavantSprintMiLB(levelKey) {
  const lvl = SV_LEVELS[levelKey];
  if (!lvl) return [];
  const base = `https://baseballsavant.mlb.com/running_splits`
    + `?type=running&bats=&year=${SEASON}&position=&team=&min=5&csv=true`;
  const urls = [
    `${base}&level=${lvl.level}`,
    `${base}&sportId=${lvl.sportId}`
  ];
  for (const url of urls) {
    try {
      const text = await fetchURL(url);
      if (text.trim().startsWith('<!') || text.trim().startsWith('<html')) continue;
      const rows = parseCSV(text);
      if (rows.length > 0) {
        console.log(`   → ${rows.length} sprint rows`);
        return rows;
      }
    } catch (e) {
      console.log(`   sprint probe failed: ${e.message}`);
    }
  }
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════
// SAVE — skip write on empty, preserve prior file
// ═══════════════════════════════════════════════════════════════════════════

function saveJSON(relPath, data) {
  const filepath = path.join(MILB_DIR, relPath);
  if (Array.isArray(data) && data.length === 0) {
    const exists = fs.existsSync(filepath);
    console.log(` Skipped ${relPath} (empty) — ${exists ? 'preserved existing file' : 'no prior file'}`);
    return { wrote: false, rows: 0, preserved: exists };
  }
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 0), 'utf8');
  const size = (fs.statSync(filepath).size / 1024).toFixed(1);
  const rows = Array.isArray(data) ? data.length : 0;
  console.log(` Saved ${relPath} (${rows} rows, ${size} KB)`);
  return { wrote: true, rows, preserved: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('⚾ Baseball Hub — MiLB 2026 Data Fetch (AAA)');
  console.log('═══════════════════════════════════════════');
  console.log(` Timestamp: ${new Date().toISOString()}`);
  console.log(` Season: ${SEASON}`);
  console.log('');

  const t = getSeasonThresholds();
  const errors = [];
  const counts = {};
  const fgJobs = [
    { key: 'fg-bat.json',       stat: 'bat', qual: t.fgQualBat, type: 8 },
    { key: 'fg-pit.json',       stat: 'pit', qual: t.fgQualPit, type: 8 },
    { key: 'fg-disc-bat.json',  stat: 'bat', qual: t.fgQualBat, type: 7 },
    { key: 'fg-disc-pit.json',  stat: 'pit', qual: t.fgQualPit, type: 7 }
  ];

  // ── FG AAA ──
  console.log(`\n── Fangraphs: AAA ──`);
  for (const job of fgJobs) {
    const tag = `FG aaa ${job.key}`;
    try {
      const rows = await fetchFGMiLB(job.stat, job.qual, job.type, 'aaa');
      saveJSON(path.join('aaa', job.key), rows);
      counts[`aaa.${job.key}`] = rows.length;
    } catch (e) {
      errors.push(`${tag}: ${e.message}`);
      console.error(`  ERROR ${tag}: ${e.message}`);
      counts[`aaa.${job.key}`] = 0;
    }
  }

  // ── Savant AAA Statcast ──
  console.log(`\n── Savant: AAA Statcast ──`);
  for (const [type, outfile] of [['batter', 'sv-bat.json'], ['pitcher', 'sv-pit.json']]) {
    const tag = `SV aaa ${outfile}`;
    try {
      const rows = await fetchSavantXStatsMiLB(type, t.svMin, 'aaa');
      saveJSON(path.join('aaa', outfile), rows);
      counts[`aaa.${outfile}`] = rows.length;
    } catch (e) {
      errors.push(`${tag}: ${e.message}`);
      console.error(`  ERROR ${tag}: ${e.message}`);
      counts[`aaa.${outfile}`] = 0;
    }
  }
  try {
    const sprint = await fetchSavantSprintMiLB('aaa');
    saveJSON(path.join('aaa', 'sv-sprint.json'), sprint);
    counts['aaa.sv-sprint.json'] = sprint.length;
  } catch (e) {
    errors.push(`SV aaa sprint: ${e.message}`);
    counts['aaa.sv-sprint.json'] = 0;
  }

  // ── Feature flag meta ──
  const totalRows = Object.values(counts).reduce((a, b) => a + b, 0);

  let priorFilesCount = 0;
  ['aaa'].forEach(lvl => {
    const dir = path.join(MILB_DIR, lvl);
    if (fs.existsSync(dir)) {
      priorFilesCount += fs.readdirSync(dir).filter(f => f.endsWith('.json')).length;
    }
  });

  const enabled = totalRows > 0 || priorFilesCount > 0;

  const meta = {
    fetchedAt: new Date().toISOString(),
    season: SEASON,
    daysInSeason: t.daysIn,
    thresholds: t,
    enabled,
    counts,
    totalRows,
    priorFilesCount,
    errors,
    sources: {
      fangraphs: 'https://www.fangraphs.com/api/leaders/minor-league/data',
      savantXStats: 'https://baseballsavant.mlb.com/leaderboard/expected_statistics',
      savantSprint: 'https://baseballsavant.mlb.com/running_splits'
    },
    coverage: {
      aaa: { fangraphs: true, statcast: true }
    }
  };
  fs.writeFileSync(path.join(MILB_DIR, 'meta-milb.json'), JSON.stringify(meta, null, 2), 'utf8');
  console.log(`\n Wrote meta-milb.json (enabled=${enabled}, totalRows=${totalRows})`);

  // ── Summary ──
  console.log('\n═══════════════════════════════════════');
  if (errors.length === 0) {
    console.log(`✅ All fetches completed (${totalRows} total rows across ${Object.keys(counts).length} files)`);
  } else {
    console.log(`⚠️ ${errors.length} of ${Object.keys(counts).length} fetches failed:`);
    errors.forEach(e => console.log(`  - ${e}`));
    console.log('(Existing JSON preserved on failure. Site continues using prior data.)');
  }
  console.log(`📁 Data saved to ${MILB_DIR}/`);
  console.log('');

  if (totalRows === 0 && priorFilesCount === 0) {
    console.log('ℹ️  No data fetched and no prior files — MiLB tab will remain hidden.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
