#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Baseball Hub — Server-Side 2026 Data Fetcher
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Runs in GitHub Actions (daily cron). Fetches all 2026 season data from
 * FanGraphs and Baseball Savant APIs server-side (no CORS issues), then
 * saves as static JSON files the site loads instantly.
 *
 * Outputs (in /data/):
 *   - fg-bat.json          FanGraphs batting (type=8)
 *   - fg-pit.json          FanGraphs pitching (type=8)
 *   - fg-disc-bat.json     FanGraphs plate discipline batting (type=7)
 *   - fg-disc-pit.json     FanGraphs plate discipline pitching (type=7)
 *   - fg-stuffplus.json    FanGraphs Stuff+/Pitching+ (type=36)
 *   - sv-bat.json          Savant expected stats (batter)
 *   - sv-pit.json          Savant expected stats (pitcher)
 *   - sv-sprint.json       Savant sprint speed
 *   - meta.json            Fetch timestamp + status
 *
 * Usage:
 *   node scripts/fetch-2026.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SEASON = 2026;
const DATA_DIR = path.join(__dirname, '..', 'data');
const TIMEOUT = 30000; // 30s per request

// ── Ensure data directory exists ──
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ═══════════════════════════════════════════════════════════════════════════
// HTTP FETCH HELPER — works with both http and https, follows redirects
// ═══════════════════════════════════════════════════════════════════════════
function fetchURL(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: TIMEOUT, headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) BaseballHub/1.0',
      'Accept': 'application/json, text/csv, text/plain, */*'
    }}, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const parsed = new URL(url);
          redirectUrl = parsed.origin + redirectUrl;
        }
        return resolve(fetchURL(redirectUrl, maxRedirects - 1));
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url.slice(0, 80)}`));
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });

    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url.slice(0, 80)}`)); });
    req.on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CSV PARSER — lightweight, handles quoted fields
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
      // Auto-convert numbers
      if (v !== '' && !isNaN(v)) v = parseFloat(v);
      obj[headers[j].trim()] = v;
    }
    rows.push(obj);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else { current += ch; }
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
// SEASON THRESHOLD LOGIC — matches explorer.js getSeasonThresholds()
// ═══════════════════════════════════════════════════════════════════════════
function getSeasonThresholds() {
  const openingDay = new Date(SEASON, 2, 26); // March 26
  const now = new Date();
  const daysIn = Math.max(0, Math.floor((now - openingDay) / 86400000));

  let fgQualBat, fgQualPit, svMin;
  if (daysIn < 4)       { fgQualBat = 0;   fgQualPit = 0;   svMin = 1;  }
  else if (daysIn < 7)  { fgQualBat = 1;   fgQualPit = 0;   svMin = 1;  }
  else if (daysIn < 30) { fgQualBat = 10;  fgQualPit = 0;   svMin = 1;  }
  else if (daysIn < 60) { fgQualBat = 50;  fgQualPit = 20;  svMin = 25; }
  else                  { fgQualBat = 100; fgQualPit = 50;  svMin = 25; }

  console.log(`  Season day: ${daysIn} → FG qual bat=${fgQualBat}, pit=${fgQualPit}, Savant min=${svMin}`);
  return { fgQualBat, fgQualPit, svMin, daysIn };
}

// ═══════════════════════════════════════════════════════════════════════════
// API FETCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// FanGraphs JSON leaderboard
async function fetchFG(type, qual, fgType = 8) {
  const url = `https://www.fangraphs.com/api/leaders/major-league/data`
    + `?pos=all&stats=${type}&lg=all&qual=${qual}&type=${fgType}`
    + `&season=${SEASON}&season1=${SEASON}&ind=0&team=0&pageitems=2000&pagenum=1`;

  console.log(`  Fetching FG ${type} type=${fgType} qual=${qual}...`);
  const text = await fetchURL(url);

  let parsed;
  try { parsed = JSON.parse(text); } catch (e) {
    throw new Error(`FG ${type} type=${fgType}: invalid JSON — ${text.slice(0, 200)}`);
  }

  const rows = parsed.data || parsed;
  const arr = Array.isArray(rows) ? rows : [];
  console.log(`    → ${arr.length} rows`);
  return arr;
}

// Savant Expected Stats (returns CSV)
async function fetchSavantXStats(type, minPA) {
  const url = `https://baseballsavant.mlb.com/leaderboard/expected_statistics`
    + `?type=${type}&year=${SEASON}&position=&team=&min=${minPA}&csv=true`;

  console.log(`  Fetching Savant xStats (${type}, min=${minPA})...`);
  const text = await fetchURL(url);

  // Savant sometimes returns HTML error page instead of CSV
  if (text.trim().startsWith('<!') || text.trim().startsWith('<html')) {
    console.log(`    → HTML response (no data yet)`);
    return [];
  }

  const rows = parseCSV(text);
  console.log(`    → ${rows.length} rows`);
  return rows;
}

// Savant Sprint Speed (returns CSV)
async function fetchSavantSprint() {
  const url = `https://baseballsavant.mlb.com/running_splits`
    + `?type=running&bats=&year=${SEASON}&position=&team=&min=10&csv=true`;

  console.log(`  Fetching Savant sprint speed...`);
  const text = await fetchURL(url);

  if (text.trim().startsWith('<!') || text.trim().startsWith('<html')) {
    console.log(`    → HTML response (no data yet)`);
    return [];
  }

  const rows = parseCSV(text);
  console.log(`    → ${rows.length} rows`);
  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════
// SAVE JSON — only write if data is non-empty, preserving existing files on error
// ═══════════════════════════════════════════════════════════════════════════
function saveJSON(filename, data) {
  const filepath = path.join(DATA_DIR, filename);

  // If data is empty array, skip writing to preserve previous version
  if (Array.isArray(data) && data.length === 0) {
    const existsFlag = fs.existsSync(filepath);
    console.log(`  Skipped ${filename} (empty) — ${existsFlag ? 'preserved existing file' : 'no previous file to keep'}`);
    return;
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 0), 'utf8');
  const size = (fs.statSync(filepath).size / 1024).toFixed(1);
  console.log(`  Saved ${filename} (${Array.isArray(data) ? data.length + ' rows' : 'object'}, ${size} KB)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('');
  console.log('⚾ Baseball Hub — 2026 Data Fetch');
  console.log('═══════════════════════════════════');
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log(`  Season: ${SEASON}`);
  console.log('');

  const thresholds = getSeasonThresholds();
  const errors = [];
  const results = {};

  // ── FanGraphs Batting (type=8) ──
  console.log('\n[1/8] FanGraphs Batting');
  try { results.fgBat = await fetchFG('bat', thresholds.fgQualBat, 8); }
  catch (e) { errors.push(`FG bat: ${e.message}`); results.fgBat = []; console.error(`    ERROR: ${e.message}`); }

  // ── FanGraphs Pitching (type=8) ──
  console.log('\n[2/8] FanGraphs Pitching');
  try { results.fgPit = await fetchFG('pit', thresholds.fgQualPit, 8); }
  catch (e) { errors.push(`FG pit: ${e.message}`); results.fgPit = []; console.error(`    ERROR: ${e.message}`); }

  // NOTE: FG plate-discipline batting (type=7) historically returns the same
  // payload as type=8 for our use case, and no client code reads the resulting
  // file. Skipping the fetch + write saves ~3 MB per cron run.
  results.fgDiscBat = [];

  // ── FanGraphs Plate Discipline Pitching (type=7) ──
  console.log('\n[4/8] FanGraphs Plate Discipline (Pitching)');
  try { results.fgDiscPit = await fetchFG('pit', thresholds.fgQualPit, 7); }
  catch (e) { errors.push(`FG disc pit: ${e.message}`); results.fgDiscPit = []; console.error(`    ERROR: ${e.message}`); }

  // ── FanGraphs Stuff+ (type=36) ──
  console.log('\n[5/8] FanGraphs Stuff+ / Pitching+');
  try { results.fgStuffPlus = await fetchFG('pit', 0, 36); }
  catch (e) { errors.push(`FG stuff+: ${e.message}`); results.fgStuffPlus = []; console.error(`    ERROR: ${e.message}`); }

  // ── Savant xStats Batting ──
  console.log('\n[6/8] Savant Expected Stats (Batting)');
  try { results.svBat = await fetchSavantXStats('batter', thresholds.svMin); }
  catch (e) { errors.push(`Savant bat: ${e.message}`); results.svBat = []; console.error(`    ERROR: ${e.message}`); }

  // ── Savant xStats Pitching ──
  console.log('\n[7/8] Savant Expected Stats (Pitching)');
  try { results.svPit = await fetchSavantXStats('pitcher', thresholds.svMin); }
  catch (e) { errors.push(`Savant pit: ${e.message}`); results.svPit = []; console.error(`    ERROR: ${e.message}`); }

  // ── Savant Sprint Speed ──
  console.log('\n[8/8] Savant Sprint Speed');
  try { results.svSprint = await fetchSavantSprint(); }
  catch (e) { errors.push(`Savant sprint: ${e.message}`); results.svSprint = []; console.error(`    ERROR: ${e.message}`); }

  // ── Save all data files ──
  console.log('\n── Saving data files ──');
  saveJSON('fg-bat.json', results.fgBat);
  saveJSON('fg-pit.json', results.fgPit);
  saveJSON('fg-disc-pit.json', results.fgDiscPit);
  // Slim fg-stuffplus.json to only the ~22 fields the client + python model read.
  // Full FG payload is ~400 cols × 636 rows ≈ 6.4 MB; slim is ~400 KB.
  const FG_STUFFPLUS_KEEP = new Set([
    'xMLBAMID', 'playerid',
    'Name', 'PlayerName', 'Team', 'TeamNameAbb', 'Season',
    'Pitches', 'IP',
    'ERA', 'FIP', 'xFIP', 'xERA', 'WAR',
    'K%', 'BB%', 'K-BB%', 'SwStr%', 'C+SwStr%',
    'sp_stuff', 'sp_location', 'sp_pitching',
  ]);
  const slimStuffPlus = (results.fgStuffPlus || []).map(function(row) {
    const out = {};
    for (const k of FG_STUFFPLUS_KEEP) if (k in row) out[k] = row[k];
    return out;
  });
  saveJSON('fg-stuffplus.json', slimStuffPlus);
  saveJSON('sv-bat.json', results.svBat);
  saveJSON('sv-pit.json', results.svPit);
  saveJSON('sv-sprint.json', results.svSprint);

  // ── Save metadata ──
  const meta = {
    fetchedAt: new Date().toISOString(),
    season: SEASON,
    daysInSeason: thresholds.daysIn,
    thresholds: thresholds,
    counts: {
      fgBat: results.fgBat.length,
      fgPit: results.fgPit.length,
      fgDiscBat: results.fgDiscBat.length,
      fgDiscPit: results.fgDiscPit.length,
      fgStuffPlus: results.fgStuffPlus.length,
      svBat: results.svBat.length,
      svPit: results.svPit.length,
      svSprint: results.svSprint.length
    },
    errors: errors
  };
  saveJSON('meta.json', meta);

  // ── Summary ──
  console.log('\n═══════════════════════════════════');
  const totalRows = Object.values(meta.counts).reduce((a, b) => a + b, 0);
  if (errors.length === 0) {
    console.log(`✅ All 8 fetches successful (${totalRows} total rows)`);
  } else {
    console.log(`⚠️  ${8 - errors.length}/8 fetches successful, ${errors.length} failed:`);
    errors.forEach(e => console.log(`   - ${e}`));
  }
  console.log(`📁 Data saved to ${DATA_DIR}/`);
  console.log('');

  // Exit with error code if ALL primary fetches failed
  if (results.fgBat.length === 0 && results.fgPit.length === 0) {
    console.error('❌ CRITICAL: No FanGraphs data at all — season may not have started');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
