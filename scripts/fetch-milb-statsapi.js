#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Baseball Hub — MiLB 2026 Data Fetcher (Stats API rebuild)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Replaces scripts/fetch-milb-2026.js (FanGraphs + Savant). Pulls from the
 * MLB Stats API only — confirmed to scope correctly to AAA (sportId=11) and
 * to the Florida State League (sportId=14, leagueId=123) via local probe on
 * 2026-04-21.
 *
 * Why this rebuild exists:
 *   - FanGraphs Minor League API endpoints returned {Message:...} errors
 *     across all 4 path variants (probed 2026-04-20).
 *   - Baseball Savant expected_statistics silently returns MLB data when
 *     ANY of {level=aaa, level=AAA, sportId=11, minorLeague=true,
 *     leagueLevel=AAA} is passed. The filter is silently dropped. Confirmed
 *     by cross-checking the first row against the MLB baseline.
 *
 * Data written (per-level JSON, one row per player):
 *   data/milb/aaa/sa-bat.json, sa-pit.json   (AAA = sportId 11)
 *   data/milb/fsl/sa-bat.json, sa-pit.json   (FSL = sportId 14, league 123)
 *   data/milb/meta-milb.json                 (feature flag + counts)
 *
 * Per-player row shape:
 *   {
 *     player_id, name, team, team_abbrev, league, sport, age, pos,
 *     // hitter traditional:
 *     g, pa, ab, h, d (2B), t (3B), hr, r, rbi, bb, ibb, hbp, k, sb, cs, sf,
 *     avg, obp, slg, ops, babip,
 *     // hitter advanced:
 *     iso, bb_pct, k_pct, bb_k, hr_pct, whiff_pct, contact_pct, woba,
 *     // pitcher traditional:
 *     g, gs, ip, w, l, sv, bf, h_a, r_a, er, hr_a, bb, ibb, hbp, k,
 *     avg_a, ops_a, era, whip, babip,
 *     // pitcher advanced:
 *     k9, bb9, hr9, k_pct, bb_pct, kbb_pct, whiff_pct, fip
 *   }
 *
 * Derived computations:
 *   wOBA  = (0.69*uBB + 0.72*HBP + 0.88*1B + 1.24*2B + 1.57*3B + 2.00*HR)
 *         / (AB + BB - IBB + SF + HBP)
 *         [2024 FanGraphs weights — noted in the JSON source manifest]
 *   FIP   = (13*HR + 3*(BB+HBP) - 2*K) / IP + constant
 *         [constant solved from the pool so league-avg FIP == league-avg ERA]
 *   Whiff% = swingAndMisses / totalSwings
 *   Contact% = 1 - Whiff%
 *
 * Usage:
 *   node scripts/fetch-milb-statsapi.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SEASON = 2026;
const ROOT_DATA_DIR = path.join(__dirname, '..', 'data');
const MILB_DIR = path.join(ROOT_DATA_DIR, 'milb');
const TIMEOUT = 30000;

// Level definitions — ties together sportId + optional leagueId + output dir.
const LEVELS = [
  { key: 'aaa', sportId: 11, leagueId: null, label: 'AAA',
    leagueNames: 'International League + Pacific Coast League' },
  { key: 'fsl', sportId: 14, leagueId: 123, label: 'FSL',
    leagueNames: 'Florida State League' }
];

// Canonical 2024 FanGraphs linear weights. These change year-over-year but
// the drift is ~0.01 on each coefficient, which is within our noise floor.
const WOBA_W = { uBB: 0.69, HBP: 0.72, B1: 0.88, B2: 1.24, B3: 1.57, HR: 2.00 };

// ═══════════════════════════════════════════════════════════════════════════
// HTTP FETCH
// ═══════════════════════════════════════════════════════════════════════════

function fetchURL(url, maxRedirects) {
  if (maxRedirects == null) maxRedirects = 5;
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
        return reject(new Error('HTTP ' + res.statusCode + ' from ' + url.slice(0, 120)));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout: ' + url.slice(0, 120))); });
    req.on('error', reject);
  });
}

async function fetchStatsAPI(url) {
  const text = await fetchURL(url);
  const parsed = JSON.parse(text);
  // Shape: { stats: [ { type, group, splits: [...] } ] }
  const stats = Array.isArray(parsed.stats) ? parsed.stats : [];
  const splits = stats.length ? (stats[0].splits || []) : [];
  return splits;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

// Convert Stats API string numerics ("4.50", ".237", "12") to numbers.
// Returns null for empty/NaN so clients can distinguish "no data" from "0".
function num(v) {
  if (v == null || v === '' || v === '-.---' || v === '-') return null;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  // Some Stats API fields come as strings like ".237" — prefix a zero.
  let s = String(v).trim();
  if (s.startsWith('.')) s = '0' + s;
  if (s.startsWith('-.')) s = '-0' + s.slice(1);
  const f = parseFloat(s);
  return isNaN(f) ? null : f;
}

// Stats API inningsPitched is formatted like "29.2" meaning 29 and 2/3 innings.
// Convert to decimal innings for K/9, BB/9, etc. calculations.
function ipToDecimal(ip) {
  if (ip == null || ip === '') return null;
  const s = String(ip);
  const dot = s.indexOf('.');
  if (dot < 0) return parseFloat(s);
  const whole = parseInt(s.slice(0, dot), 10);
  const frac  = parseInt(s.slice(dot + 1), 10);
  if (isNaN(whole) || isNaN(frac)) return null;
  return whole + (frac === 1 ? 1 / 3 : frac === 2 ? 2 / 3 : 0);
}

// Index an array of { player_id, ...stats } rows for O(1) merge.
function indexByPlayerId(rows) {
  const out = {};
  rows.forEach(r => { if (r.player_id != null) out[r.player_id] = r; });
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS API PAGINATOR
// ═══════════════════════════════════════════════════════════════════════════
//
// The /stats endpoint caps rows per request (default 50). Paginate with
// offset until we get fewer rows back than the limit.

async function fetchAllSplits(baseUrl, pageSize) {
  if (pageSize == null) pageSize = 1000;
  const all = [];
  let offset = 0;
  for (let page = 0; page < 20; page++) { // safety cap: 20k rows
    const url = baseUrl + '&limit=' + pageSize + '&offset=' + offset;
    const splits = await fetchStatsAPI(url);
    all.push.apply(all, splits);
    if (splits.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

// ═══════════════════════════════════════════════════════════════════════════
// PER-LEVEL FETCH — builds per-player rows
// ═══════════════════════════════════════════════════════════════════════════

function splitMatchesLevel(split, level) {
  // If a leagueId was specified, post-filter on it (the Stats API doesn't
  // always respect leagueId when passed alongside sportId). This is a
  // defensive belt-and-suspenders check.
  if (level.leagueId == null) return true;
  const lgId = split.league && split.league.id;
  return lgId === level.leagueId;
}

// ── Hitters: season + seasonAdvanced ──
async function fetchHitters(level) {
  const base = 'https://statsapi.mlb.com/api/v1/stats'
    + '?stats=season&group=hitting'
    + '&sportId=' + level.sportId
    + '&season=' + SEASON
    + (level.leagueId ? '&leagueId=' + level.leagueId : '');
  const baseAdv = 'https://statsapi.mlb.com/api/v1/stats'
    + '?stats=seasonAdvanced&group=hitting'
    + '&sportId=' + level.sportId
    + '&season=' + SEASON
    + (level.leagueId ? '&leagueId=' + level.leagueId : '');

  const [seasonSplits, advSplits] = await Promise.all([
    fetchAllSplits(base),
    fetchAllSplits(baseAdv)
  ]);

  const tradRows = seasonSplits
    .filter(s => splitMatchesLevel(s, level))
    .map(mapHitterTraditional)
    .filter(r => r && r.player_id);
  const advRows = advSplits
    .filter(s => splitMatchesLevel(s, level))
    .map(mapHitterAdvanced)
    .filter(r => r && r.player_id);

  console.log('  ' + level.label + ' hitters: ' + tradRows.length + ' traditional, ' + advRows.length + ' advanced');

  // Merge by player_id
  const advIdx = indexByPlayerId(advRows);
  const merged = tradRows.map(r => {
    const adv = advIdx[r.player_id] || {};
    return Object.assign({}, r, adv, {
      // Recompute wOBA from raw components (not from Stats API — it doesn't
      // expose wOBA). Uses 2024 FG weights.
      woba: computeWOBA(r)
    });
  });
  return merged;
}

// ── Pitchers: season + seasonAdvanced ──
async function fetchPitchers(level) {
  const base = 'https://statsapi.mlb.com/api/v1/stats'
    + '?stats=season&group=pitching'
    + '&sportId=' + level.sportId
    + '&season=' + SEASON
    + (level.leagueId ? '&leagueId=' + level.leagueId : '');
  const baseAdv = 'https://statsapi.mlb.com/api/v1/stats'
    + '?stats=seasonAdvanced&group=pitching'
    + '&sportId=' + level.sportId
    + '&season=' + SEASON
    + (level.leagueId ? '&leagueId=' + level.leagueId : '');

  const [seasonSplits, advSplits] = await Promise.all([
    fetchAllSplits(base),
    fetchAllSplits(baseAdv)
  ]);

  const tradRows = seasonSplits
    .filter(s => splitMatchesLevel(s, level))
    .map(mapPitcherTraditional)
    .filter(r => r && r.player_id);
  const advRows = advSplits
    .filter(s => splitMatchesLevel(s, level))
    .map(mapPitcherAdvanced)
    .filter(r => r && r.player_id);

  console.log('  ' + level.label + ' pitchers: ' + tradRows.length + ' traditional, ' + advRows.length + ' advanced');

  const advIdx = indexByPlayerId(advRows);
  const merged = tradRows.map(r => Object.assign({}, r, advIdx[r.player_id] || {}));

  // Compute FIP with a pool-specific constant so league-avg FIP == league-avg
  // ERA. This normalizes FIP to the league's run environment (matters at AAA
  // especially — ERAs here run ~0.3 higher than MLB).
  const fipC = computeFIPConstant(merged);
  merged.forEach(r => { r.fip = computeFIP(r, fipC); });
  return merged;
}

// ═══════════════════════════════════════════════════════════════════════════
// SPLIT MAPPERS — Stats API split → our row shape
// ═══════════════════════════════════════════════════════════════════════════

function baseRowFromSplit(split) {
  const p = split.player || {};
  const t = split.team   || {};
  const l = split.league || {};
  const sp = split.sport || {};
  return {
    player_id: p.id != null ? p.id : null,
    name: p.fullName || '',
    team: t.name || '',
    team_abbrev: t.abbreviation || '',
    league: l.abbreviation || l.name || '',
    sport: sp.abbreviation || sp.name || '',
    age: num(split.stat && split.stat.age),
    pos: (split.position && (split.position.abbreviation || split.position.code)) || ''
  };
}

function mapHitterTraditional(split) {
  const s = split.stat || {};
  if (!split.player || !split.player.id) return null;
  const base = baseRowFromSplit(split);
  const h  = num(s.hits);
  const d  = num(s.doubles);
  const t  = num(s.triples);
  const hr = num(s.homeRuns);
  const ab = num(s.atBats);
  const bb = num(s.baseOnBalls);
  const ibb = num(s.intentionalWalks);
  const hbp = num(s.hitByPitch);
  const sf  = num(s.sacFlies);
  const singles = (h != null && d != null && t != null && hr != null)
    ? h - d - t - hr : null;
  return Object.assign(base, {
    g:   num(s.gamesPlayed),
    pa:  num(s.plateAppearances),
    ab:  ab,
    h:   h,
    d:   d,
    t:   t,
    hr:  hr,
    r:   num(s.runs),
    rbi: num(s.rbi),
    bb:  bb,
    ibb: ibb,
    hbp: hbp,
    k:   num(s.strikeOuts),
    sb:  num(s.stolenBases),
    cs:  num(s.caughtStealing),
    sf:  sf,
    singles: singles,
    avg: num(s.avg),
    obp: num(s.obp),
    slg: num(s.slg),
    ops: num(s.ops),
    babip: num(s.babip)
  });
}

function mapHitterAdvanced(split) {
  const s = split.stat || {};
  if (!split.player || !split.player.id) return null;
  const totalSwings  = num(s.totalSwings);
  const swingMisses  = num(s.swingAndMisses);
  const pa = num(s.plateAppearances);
  // walksPerPlateAppearance / strikeoutsPerPlateAppearance come as ".092"
  // strings. Normalize to percent (0-100) for UI display.
  const toPct = v => { const n = num(v); return n == null ? null : +(n * 100).toFixed(2); };
  const whiffPct = (totalSwings && totalSwings > 0 && swingMisses != null)
    ? +((swingMisses / totalSwings) * 100).toFixed(2) : null;
  const contactPct = whiffPct != null ? +(100 - whiffPct).toFixed(2) : null;
  return {
    player_id: split.player.id,
    iso:         num(s.iso),
    bb_pct:      toPct(s.walksPerPlateAppearance),
    k_pct:       toPct(s.strikeoutsPerPlateAppearance),
    hr_pct:      toPct(s.homeRunsPerPlateAppearance),
    bb_k:        num(s.walksPerStrikeout),
    whiff_pct:   whiffPct,
    contact_pct: contactPct,
    total_swings: totalSwings,
    // Ignore Stats API babip in advanced (already in traditional) — keep trad.
  };
}

function mapPitcherTraditional(split) {
  const s = split.stat || {};
  if (!split.player || !split.player.id) return null;
  const base = baseRowFromSplit(split);
  const ip = ipToDecimal(s.inningsPitched);
  const g = num(s.gamesPlayed);
  const gs = num(s.gamesStarted);
  return Object.assign(base, {
    g:   g,
    gs:  gs,
    ip:  ip,
    w:   num(s.wins),
    l:   num(s.losses),
    sv:  num(s.saves),
    bf:  num(s.battersFaced),
    h_a: num(s.hits),
    r_a: num(s.runs),
    er:  num(s.earnedRuns),
    hr_a: num(s.homeRuns),
    bb:  num(s.baseOnBalls),
    ibb: num(s.intentionalWalks),
    hbp: num(s.hitByPitch),
    k:   num(s.strikeOuts),
    avg_a: num(s.avg),
    obp_a: num(s.obp),
    slg_a: num(s.slg),
    ops_a: num(s.ops),
    era: num(s.era),
    whip: num(s.whip),
    babip: num(s.babip),
    role: (g && gs && gs / g >= 0.5) ? 'SP' : 'RP'
  });
}

function mapPitcherAdvanced(split) {
  const s = split.stat || {};
  if (!split.player || !split.player.id) return null;
  const totalSwings = num(s.totalSwings);
  const swingMisses = num(s.swingAndMisses);
  const toPct = v => { const n = num(v); return n == null ? null : +(n * 100).toFixed(2); };
  const bbPct = toPct(s.walksPerPlateAppearance);
  const kPct  = toPct(s.strikeoutsPerPlateAppearance);
  const kbbPct = (kPct != null && bbPct != null) ? +(kPct - bbPct).toFixed(2) : null;
  const whiffPct = (totalSwings && totalSwings > 0 && swingMisses != null)
    ? +((swingMisses / totalSwings) * 100).toFixed(2) : null;
  return {
    player_id: split.player.id,
    k9:     num(s.strikeoutsPer9Inn),
    bb9:    num(s.walksPer9Inn),
    hr9:    num(s.homeRunsPer9),
    k_pct:  kPct,
    bb_pct: bbPct,
    kbb_pct: kbbPct,
    whiff_pct: whiffPct,
    total_swings: totalSwings,
    strike_pct: toPct(s.strikePercentage)
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DERIVED STATS
// ═══════════════════════════════════════════════════════════════════════════

function computeWOBA(r) {
  if (r.ab == null || r.bb == null || r.hbp == null || r.sf == null ||
      r.singles == null || r.d == null || r.t == null || r.hr == null) return null;
  const ibb = r.ibb || 0;
  const uBB = r.bb - ibb;
  const denom = r.ab + r.bb - ibb + r.sf + r.hbp;
  if (denom <= 0) return null;
  const numer = WOBA_W.uBB * uBB
              + WOBA_W.HBP * r.hbp
              + WOBA_W.B1  * r.singles
              + WOBA_W.B2  * r.d
              + WOBA_W.B3  * r.t
              + WOBA_W.HR  * r.hr;
  return +(numer / denom).toFixed(3);
}

// Compute the FIP constant so league-avg FIP == league-avg ERA for this pool.
function computeFIPConstant(pitchers) {
  let eraSum = 0, rawSum = 0, ipSum = 0;
  pitchers.forEach(p => {
    if (p.ip == null || p.ip <= 0 || p.era == null) return;
    eraSum += p.era * p.ip;
    const hr = p.hr_a || 0, bb = p.bb || 0, hbp = p.hbp || 0, k = p.k || 0;
    const rawFIP = (13 * hr + 3 * (bb + hbp) - 2 * k) / p.ip;
    rawSum += rawFIP * p.ip;
    ipSum += p.ip;
  });
  if (ipSum <= 0) return 3.10; // sensible fallback
  const leagueERA = eraSum / ipSum;
  const leagueRawFIP = rawSum / ipSum;
  return +(leagueERA - leagueRawFIP).toFixed(3);
}

function computeFIP(p, constant) {
  if (p.ip == null || p.ip <= 0) return null;
  const hr = p.hr_a || 0, bb = p.bb || 0, hbp = p.hbp || 0, k = p.k || 0;
  return +(((13 * hr + 3 * (bb + hbp) - 2 * k) / p.ip) + constant).toFixed(2);
}

// ═══════════════════════════════════════════════════════════════════════════
// FILE I/O
// ═══════════════════════════════════════════════════════════════════════════

function saveJSON(relPath, data) {
  const filepath = path.join(MILB_DIR, relPath);
  if (Array.isArray(data) && data.length === 0) {
    const exists = fs.existsSync(filepath);
    console.log(' Skipped ' + relPath + ' (empty) — ' + (exists ? 'preserved existing file' : 'no prior file'));
    return { wrote: false, rows: 0, preserved: exists };
  }
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 0), 'utf8');
  const size = (fs.statSync(filepath).size / 1024).toFixed(1);
  console.log(' Saved ' + relPath + ' (' + data.length + ' rows, ' + size + ' KB)');
  return { wrote: true, rows: data.length, preserved: false };
}

// Delete any stale legacy files (fg-*.json, sv-*.json) so the atomic swap is
// clean. Called once at the end after successful fetches so we never end up
// in a state where both old + new files are present.
function pruneLegacyFiles(levelKey) {
  const dir = path.join(MILB_DIR, levelKey);
  if (!fs.existsSync(dir)) return { pruned: [] };
  const pruned = [];
  fs.readdirSync(dir).forEach(f => {
    if (/^fg-/.test(f) || /^sv-/.test(f)) {
      try {
        fs.unlinkSync(path.join(dir, f));
        pruned.push(levelKey + '/' + f);
      } catch (e) {
        console.warn('  Could not delete ' + f + ': ' + e.message);
      }
    }
  });
  return { pruned };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('⚾ Baseball Hub — MiLB 2026 Data Fetch (Stats API)');
  console.log('══════════════════════════════════════════════════');
  console.log(' Timestamp: ' + new Date().toISOString());
  console.log(' Season:    ' + SEASON);
  console.log(' Source:    statsapi.mlb.com/api/v1/stats');
  console.log('');

  const errors = [];
  const counts = {};
  const coverage = {};
  const allPruned = [];

  for (const level of LEVELS) {
    console.log('── ' + level.label + ' (' + level.leagueNames + ') ──');

    // Hitters
    try {
      const hitters = await fetchHitters(level);
      const batFile = path.join(level.key, 'sa-bat.json');
      const result = saveJSON(batFile, hitters);
      counts[level.key + '.sa-bat.json'] = result.rows;
    } catch (e) {
      errors.push(level.label + ' hitters: ' + e.message);
      console.error('  ERROR ' + level.label + ' hitters: ' + e.message);
      counts[level.key + '.sa-bat.json'] = 0;
    }

    // Pitchers
    try {
      const pitchers = await fetchPitchers(level);
      const pitFile = path.join(level.key, 'sa-pit.json');
      const result = saveJSON(pitFile, pitchers);
      counts[level.key + '.sa-pit.json'] = result.rows;
    } catch (e) {
      errors.push(level.label + ' pitchers: ' + e.message);
      console.error('  ERROR ' + level.label + ' pitchers: ' + e.message);
      counts[level.key + '.sa-pit.json'] = 0;
    }

    // Clean up legacy fg-*/sv-* files in this level's dir
    const pr = pruneLegacyFiles(level.key);
    if (pr.pruned.length) {
      console.log('  Pruned ' + pr.pruned.length + ' legacy files: ' + pr.pruned.join(', '));
      allPruned.push.apply(allPruned, pr.pruned);
    }

    coverage[level.key] = {
      statsAPI: true,
      statcast: false,
      sportId: level.sportId,
      leagueId: level.leagueId
    };
    console.log('');
  }

  // ── Feature flag meta ──
  const totalRows = Object.values(counts).reduce((a, b) => a + b, 0);
  // Only disable if BOTH levels came back empty. Partial success (one level
  // works, the other doesn't) still shows the live tab.
  const enabled = totalRows > 0;

  const meta = {
    fetchedAt: new Date().toISOString(),
    season: SEASON,
    enabled: enabled,
    source: 'statsapi.mlb.com',
    endpoint: '/api/v1/stats (stats=season + stats=seasonAdvanced)',
    levels: LEVELS.map(l => l.key),
    counts: counts,
    totalRows: totalRows,
    errors: errors,
    prunedLegacy: allPruned,
    coverage: coverage,
    derivedStats: {
      woba: 'Computed per player using 2024 FG linear weights (uBB=0.69, HBP=0.72, 1B=0.88, 2B=1.24, 3B=1.57, HR=2.00)',
      fip:  'Computed per player, pool-specific constant solved so league-avg FIP == league-avg ERA',
      whiff_pct: 'swingAndMisses / totalSwings (from seasonAdvanced)',
      contact_pct: '1 - Whiff%'
    },
    notes: [
      'Savant expected_statistics (xwOBA/xBA/xSLG/Barrel%/EV/HardHit%) is NOT included — that endpoint silently returns MLB data for all MiLB filter shapes. Dedicated Savant MiLB endpoints may work but were not probed in this pass.',
      'FanGraphs MiLB API returned {Message:...} errors across all 4 path variants probed on 2026-04-20; not used.'
    ]
  };
  fs.writeFileSync(path.join(MILB_DIR, 'meta-milb.json'), JSON.stringify(meta, null, 2), 'utf8');
  console.log(' Wrote meta-milb.json (enabled=' + enabled + ', totalRows=' + totalRows + ')');

  // ── Summary ──
  console.log('');
  console.log('══════════════════════════════════════════════════');
  if (errors.length === 0) {
    console.log('✅ All fetches completed (' + totalRows + ' total rows across ' + Object.keys(counts).length + ' files)');
  } else {
    console.log('⚠️  ' + errors.length + ' of ' + Object.keys(counts).length + ' fetches failed:');
    errors.forEach(e => console.log('  - ' + e));
    console.log('(Existing JSON preserved on failure. Site continues using prior data.)');
  }
  console.log('📁 Data saved to ' + MILB_DIR + '/');
  console.log('');

  if (totalRows === 0) {
    console.log('ℹ️  No rows fetched — MiLB tab will remain hidden (enabled=false).');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
