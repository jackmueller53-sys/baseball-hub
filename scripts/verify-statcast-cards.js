#!/usr/bin/env node
/**
 * Pre-push verification harness for the Statcast-panel update to MiLB cards.
 *
 * Run with:  npm install jsdom  (one-time)  &&  node scripts/verify-statcast-cards.js
 *
 * Loads js/milb-cards.js into a jsdom window and renders four scenarios:
 *   1. Hitter WITH full Statcast (xwOBA, EV, hard-hit%, barrel%)
 *   2. Hitter WITHOUT Statcast (FSL fallback)
 *   3. Pitcher WITH pitchArsenal + xStats-against
 *   4. Pitcher WITHOUT either (FSL fallback)
 * For each, asserts:
 *   - Card opens (overlay visible)
 *   - Replaced panels appear with their new titles
 *   - Old panel titles are gone
 *   - Empty-state message renders for the no-Statcast cases
 *   - Pitch arsenal table renders the right number of rows when present
 *   - vs-Avg footer absorbs the new metrics
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const cardJS = fs.readFileSync(path.join(ROOT, 'js/milb-cards.js'), 'utf8');

function makeWindow() {
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    runScripts: 'outside-only'
  });
  dom.window.eval(cardJS);
  return dom.window;
}

function assert(cond, msg) {
  if (!cond) {
    console.error('  FAIL: ' + msg);
    process.exitCode = 1;
    return false;
  }
  console.log('  ok  ' + msg);
  return true;
}

// ─── Fixture players ────────────────────────────────────────────────────────
const hitterFull = {
  player_id: 1, name: 'Test Slugger', team: 'Toledo Mud Hens', team_abbrev: 'TOL',
  league: 'INT', sport: 'AAA', age: 24, pos: 'RF',
  g: 18, pa: 80, ab: 70, h: 22, d: 5, t: 0, hr: 4, r: 14, rbi: 16, bb: 8, ibb: 0, hbp: 1, k: 18, sb: 2, cs: 0, sf: 1,
  singles: 13, avg: 0.314, obp: 0.388, slg: 0.557, ops: 0.945, babip: 0.36,
  iso: 0.243, bb_pct: 10.0, k_pct: 22.5, hr_pct: 5.0, bb_k: 0.444, whiff_pct: 24.5, contact_pct: 75.5, woba: 0.402,
  // Hawk-Eye xStats
  xba: 0.298, xslg: 0.524, xwoba: 0.391, ev: 91.2, hard_hit_pct: 47.5, barrel_pct: 11.8
};
const hitterNoStatcast = Object.assign({}, hitterFull, {
  player_id: 2, name: 'No Statcast Sam', xba: null, xslg: null, xwoba: null,
  ev: null, hard_hit_pct: null, barrel_pct: null
});

const pitcherFull = {
  player_id: 100, name: 'Test Ace', team: 'Las Vegas Aviators', team_abbrev: 'LV',
  league: 'PCL', sport: 'AAA', age: 26, pos: 'P',
  g: 5, gs: 5, ip: 28.0, w: 3, l: 1, sv: 0, bf: 110, h_a: 22, r_a: 8, er: 7, hr_a: 2,
  bb: 7, ibb: 0, hbp: 1, k: 32, avg_a: 0.215, obp_a: 0.275, slg_a: 0.330, ops_a: 0.605,
  era: 2.25, whip: 1.04, babip: 0.290, role: 'SP',
  k9: 10.3, bb9: 2.3, hr9: 0.6, k_pct: 29.1, bb_pct: 6.4, kbb_pct: 22.7, whiff_pct: 32.5,
  total_swings: 180, strike_pct: 65, fip: 2.95,
  // Hawk-Eye xStats-against
  xba_a: 0.225, xslg_a: 0.355, xwoba_a: 0.282, ev_a: 88.4, hard_hit_pct_a: 35.2,
  // Pitch arsenal
  pitch_arsenal: [
    { type: '4-Seam Fastball', code: 'FF', pct: 48.5, velo: 95.8, whiff_pct: 25.4, put_away_pct: 20.1 },
    { type: 'Slider', code: 'SL', pct: 28.2, velo: 86.5, whiff_pct: 38.7, put_away_pct: 28.5 },
    { type: 'Changeup', code: 'CH', pct: 18.0, velo: 84.3, whiff_pct: 31.2, put_away_pct: 22.0 },
    { type: 'Curveball', code: 'CU', pct: 5.3, velo: 78.8, whiff_pct: 22.0, put_away_pct: 12.5 }
  ]
};
const pitcherNoStatcast = Object.assign({}, pitcherFull, {
  player_id: 101, name: 'No Hawk-Eye Hank',
  xba_a: null, xslg_a: null, xwoba_a: null, ev_a: null, hard_hit_pct_a: null,
  pitch_arsenal: null
});

// Build a small "qualified" peer set so league avgs aren't null
function makeHitterDb(extra) {
  const peers = [];
  for (let i = 0; i < 12; i++) {
    peers.push({
      player_id: 9000 + i, pa: 100, ab: 90, h: 25, d: 5, t: 0, hr: 3, bb: 9, ibb: 0, hbp: 1, sf: 1,
      singles: 17, avg: 0.278, obp: 0.350, slg: 0.450, ops: 0.800, babip: 0.310,
      iso: 0.172, bb_pct: 9.0, k_pct: 23.0, hr_pct: 3.0, bb_k: 0.400, whiff_pct: 25.0, contact_pct: 75.0, woba: 0.345,
      xba: 0.270, xslg: 0.430, xwoba: 0.335, ev: 88.5, hard_hit_pct: 40.0, barrel_pct: 8.0
    });
  }
  return { hitters: [extra].concat(peers), pitchers: [] };
}
function makePitcherDb(extra) {
  const peers = [];
  for (let i = 0; i < 12; i++) {
    peers.push({
      player_id: 9100 + i, ip: 30, er: 12, h_a: 28, bb: 9, hr_a: 3, k: 30, bf: 130, hbp: 2,
      avg_a: 0.245, obp_a: 0.310, slg_a: 0.395, ops_a: 0.705, era: 3.60, whip: 1.23, babip: 0.300,
      k9: 9.0, bb9: 2.7, hr9: 0.9, k_pct: 23.0, bb_pct: 7.0, kbb_pct: 16.0, whiff_pct: 27.0,
      strike_pct: 63.0, fip: 3.50,
      xba_a: 0.250, xslg_a: 0.400, xwoba_a: 0.310, ev_a: 89.0, hard_hit_pct_a: 38.0
    });
  }
  return { hitters: [], pitchers: [extra].concat(peers) };
}

// ─── Run tests ──────────────────────────────────────────────────────────────
let total = 0, fail = 0;
function runScenario(name, fn) {
  console.log('\n── ' + name + ' ──');
  const before = process.exitCode || 0;
  fn();
  if ((process.exitCode || 0) !== before) fail++;
  total++;
}

runScenario('Hitter WITH full Statcast', () => {
  const win = makeWindow();
  win.MiLBCards.open(hitterFull, 'hitters', makeHitterDb(hitterFull), 'AAA');
  const html = win.document.getElementById('pc-overlay').innerHTML;
  assert(html.indexOf('Test Slugger') > -1, 'header shows player name');
  assert(html.indexOf('Batted-Ball Profile') > -1, 'new Batted-Ball Profile panel renders');
  assert(html.indexOf('Power Profile') === -1, 'old Power Profile panel is gone');
  // gauge values present
  assert(html.indexOf('xwOBA') > -1, 'xwOBA gauge label present');
  assert(html.indexOf('Avg EV') > -1, 'Avg EV gauge label present');
  assert(html.indexOf('Hard-Hit%') > -1, 'Hard-Hit% appears in gauges/footer');
  assert(html.indexOf('Barrel%') > -1, 'Barrel% gauge label present');
  // empty-state msg should NOT appear for full-data hitter
  assert(html.indexOf('Statcast batted-ball metrics unavailable') === -1, 'no empty-state when data present');
  // vs-Avg footer absorbed xwOBA + Hard-Hit%
  const vsTable = html.split('vs-avg-tbl')[1] || '';
  assert(vsTable.indexOf('xwOBA') > -1, 'vs-Avg footer has xwOBA row');
});

runScenario('Hitter WITHOUT Statcast (FSL fallback)', () => {
  const win = makeWindow();
  win.MiLBCards.open(hitterNoStatcast, 'hitters', makeHitterDb(hitterNoStatcast), 'FSL');
  const html = win.document.getElementById('pc-overlay').innerHTML;
  assert(html.indexOf('Batted-Ball Profile') > -1, 'panel title still renders');
  assert(html.indexOf('Statcast batted-ball metrics unavailable') > -1, 'empty-state message renders');
  assert(html.indexOf('full at AAA') > -1, 'sub-message references AAA/FSL coverage difference');
  // Card body should still render slash line
  assert(html.indexOf('Slash Line Profile') > -1, 'slash-line panel still renders');
  assert(html.indexOf('Plate Discipline') > -1, 'plate-discipline panel still renders');
});

runScenario('Pitcher WITH full Statcast + Arsenal', () => {
  const win = makeWindow();
  win.MiLBCards.open(pitcherFull, 'pitchers', makePitcherDb(pitcherFull), 'AAA');
  const html = win.document.getElementById('pc-overlay').innerHTML;
  assert(html.indexOf('Test Ace') > -1, 'header shows player name');
  assert(html.indexOf('Pitch Arsenal') > -1, 'new Pitch Arsenal panel renders');
  assert(html.indexOf('Run Prevention') === -1, 'old Run Prevention panel is gone');
  assert(html.indexOf('Batted-Ball Against') > -1, 'new Batted-Ball Against panel renders');
  assert(html.indexOf('Quality vs Hitters') === -1, 'old Quality vs Hitters panel is gone');
  // Arsenal rows: 4 pitches → 4 rows
  const rowCount = (html.match(/<tr>/g) || []).length;
  assert(rowCount >= 4, 'arsenal table has at least 4 pitch rows (got ' + rowCount + ')');
  assert(html.indexOf('4-Seam Fastball') > -1, 'fastball row renders');
  assert(html.indexOf('Slider') > -1, 'slider row renders');
  assert(html.indexOf('xwOBA-A') > -1, 'xwOBA-A label appears');
  assert(html.indexOf('xBA-A') > -1, 'xBA-A label appears');
  // vs-Avg footer absorbed HR/9, AVG-A, OPS-A, xwOBA-A, Hard-Hit%-A
  const vsTable = html.split('vs-avg-tbl')[1] || '';
  assert(vsTable.indexOf('HR/9') > -1, 'vs-Avg has HR/9 row');
  assert(vsTable.indexOf('AVG-A') > -1, 'vs-Avg has AVG-A row');
  assert(vsTable.indexOf('OPS-A') > -1, 'vs-Avg has OPS-A row');
  assert(vsTable.indexOf('xwOBA-A') > -1, 'vs-Avg has xwOBA-A row');
});

runScenario('Pitcher WITHOUT Statcast (FSL fallback)', () => {
  const win = makeWindow();
  win.MiLBCards.open(pitcherNoStatcast, 'pitchers', makePitcherDb(pitcherNoStatcast), 'FSL');
  const html = win.document.getElementById('pc-overlay').innerHTML;
  assert(html.indexOf('Pitch Arsenal') > -1, 'pitch arsenal panel title renders');
  assert(html.indexOf('Pitch-by-pitch tracking unavailable') > -1, 'arsenal empty-state renders');
  assert(html.indexOf('Statcast batted-ball metrics unavailable') > -1, 'batted-ball-against empty-state renders');
  // Card body should still render Plate Discipline + Stat Line
  assert(html.indexOf('Plate Discipline') > -1, 'plate-discipline panel still renders');
  assert(html.indexOf('Stat Line') > -1, 'stat-line panel still renders');
});

console.log('\n══════════════════════════════════════════════════');
if ((process.exitCode || 0) === 0) {
  console.log('✅ All ' + total + ' scenarios passed.');
} else {
  console.log('❌ ' + fail + ' of ' + total + ' scenarios had failing assertions.');
}
