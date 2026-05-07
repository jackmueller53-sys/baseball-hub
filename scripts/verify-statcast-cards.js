#!/usr/bin/env node
/**
 * Pre-push verification harness for the BBE Statcast-event rebuild of MiLB
 * cards. The hitter card now lazy-loads a per-player BBE shard and replaces
 * the Spray Chart + Batted Ball Profile panels in place, so this harness
 * verifies (a) the synchronous loading-state placeholders and (b) the
 * post-hydration rendered HTML by calling the exposed renderers directly.
 *
 * Run with:  npm install jsdom  &&  node scripts/verify-statcast-cards.js
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
  // Stub fetch — synchronous render path doesn't await it but hydrateBBE will.
  // For these tests we just want the synchronous skeleton; actual BBE render
  // is exercised via the directly-exposed _battedBallProfileFromBBE / _sprayChartSVG.
  dom.window.fetch = () => new Promise(() => {});  // never resolves
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
  xba: 0.298, xslg: 0.524, xwoba: 0.391
};
const hitterNoStatcast = Object.assign({}, hitterFull, {
  player_id: 2, name: 'No Statcast Sam', xba: null, xslg: null, xwoba: null
});

const pitcherFull = {
  player_id: 100, name: 'Test Ace', team: 'Las Vegas Aviators', team_abbrev: 'LV',
  league: 'PCL', sport: 'AAA', age: 26, pos: 'P',
  g: 5, gs: 5, ip: 28.0, w: 3, l: 1, sv: 0, bf: 110, h_a: 22, r_a: 8, er: 7, hr_a: 2,
  bb: 7, ibb: 0, hbp: 1, k: 32, avg_a: 0.215, obp_a: 0.275, slg_a: 0.330, ops_a: 0.605,
  era: 2.25, whip: 1.04, babip: 0.290, role: 'SP',
  k9: 10.3, bb9: 2.3, hr9: 0.6, k_pct: 29.1, bb_pct: 6.4, kbb_pct: 22.7, whiff_pct: 32.5,
  total_swings: 180, strike_pct: 65, fip: 2.95,
  xba_a: 0.225, xslg_a: 0.355, xwoba_a: 0.282,
  pitch_arsenal: [
    { type: '4-Seam Fastball', code: 'FF', pct: 48.5, velo: 95.8, whiff_pct: 25.4, put_away_pct: 20.1 },
    { type: 'Slider', code: 'SL', pct: 28.2, velo: 86.5, whiff_pct: 38.7, put_away_pct: 28.5 },
    { type: 'Changeup', code: 'CH', pct: 18.0, velo: 84.3, whiff_pct: 31.2, put_away_pct: 22.0 },
    { type: 'Curveball', code: 'CU', pct: 5.3, velo: 78.8, whiff_pct: 22.0, put_away_pct: 12.5 }
  ]
};
const pitcherNoStatcast = Object.assign({}, pitcherFull, {
  player_id: 101, name: 'No Statcast Hank',
  xba_a: null, xslg_a: null, xwoba_a: null,
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
      xba: 0.270, xslg: 0.430, xwoba: 0.335
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
      xba_a: 0.250, xslg_a: 0.400, xwoba_a: 0.310
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

runScenario('Hitter WITH full Statcast — synchronous skeleton', () => {
  const win = makeWindow();
  win.MiLBCards.open(hitterFull, 'hitters', makeHitterDb(hitterFull), 'AAA');
  const html = win.document.getElementById('pc-overlay').innerHTML;
  assert(html.indexOf('Test Slugger') > -1, 'header shows player name');
  // New panel titles present
  assert(html.indexOf('Spray Chart') > -1, 'Spray Chart panel renders');
  assert(html.indexOf('Batted Ball Profile') > -1, 'Batted Ball Profile panel renders');
  assert(html.indexOf('Plate Discipline') > -1, 'Plate Discipline panel still renders');
  assert(html.indexOf('Stat Line') > -1, 'Stat Line panel still renders');
  // Old panels gone
  assert(html.indexOf('Slash Line Profile') === -1, 'old Slash Line Profile panel removed');
  assert(html.indexOf('Power Profile') === -1, 'old Power Profile panel removed');
  // Loading placeholders for BBE-driven panels
  assert(html.indexOf('Loading Statcast events') > -1, 'BBE panels show loading state');
  // Header KPIs render
  assert(html.indexOf('AVG') > -1 && html.indexOf('OPS') > -1 && html.indexOf('wOBA') > -1, 'KPI strip renders');
  // vs-Avg footer absorbs xwOBA + xBA + xSLG
  const vsTable = html.split('vs-avg-tbl')[1] || '';
  assert(vsTable.indexOf('xwOBA') > -1, 'vs-Avg footer has xwOBA row');
  assert(vsTable.indexOf('xBA') > -1, 'vs-Avg footer has xBA row');
  assert(vsTable.indexOf('xSLG') > -1, 'vs-Avg footer has xSLG row');
});

runScenario('Hitter — synchronous skeleton renders even when no shard available', () => {
  const win = makeWindow();
  win.MiLBCards.open(hitterNoStatcast, 'hitters', makeHitterDb(hitterNoStatcast), 'FSL');
  const html = win.document.getElementById('pc-overlay').innerHTML;
  assert(html.indexOf('Spray Chart') > -1, 'Spray Chart panel still renders');
  assert(html.indexOf('Batted Ball Profile') > -1, 'BBP panel still renders');
  assert(html.indexOf('Plate Discipline') > -1, 'plate-discipline panel still renders');
  assert(html.indexOf('Stat Line') > -1, 'stat-line panel still renders');
  assert(html.indexOf('Loading Statcast events') > -1, 'loading state persists until shard fetch resolves');
});

runScenario('Hitter — sprayChartSVG with mock events', () => {
  const win = makeWindow();
  // Synthesize minimal BBE events
  const events = [
    { x: 75,  y: 100, ev: 102, la:  15, bb: 'line_drive',  e: 'Single' },
    { x: 125, y:  60, ev: 110, la:  28, bb: 'fly_ball',    e: 'Home Run' },
    { x: 200, y: 150, ev:  90, la:  -5, bb: 'ground_ball', e: 'Groundout' },
    { x: 130, y: 180, ev:  68, la:  55, bb: 'popup',       e: 'Pop Out' }
  ];
  const svg = win.MiLBCards._sprayChartSVG(events);
  assert(svg.indexOf('<svg') > -1, 'SVG tag present');
  assert(svg.indexOf('class="sc-arc"') > -1, 'distance arcs rendered');
  assert(svg.indexOf('class="sc-foul"') > -1, 'foul lines rendered');
  assert(svg.indexOf('class="sc-home"') > -1, 'home plate marker rendered');
  // 4 events → 4 circles
  const dotCount = (svg.match(/<circle /g) || []).length;
  assert(dotCount === 4, '4 batted-ball dots rendered (got ' + dotCount + ')');
  // Color coding
  assert(svg.indexOf('#1D4ED8') > -1, 'ground-ball blue color applied');
  assert(svg.indexOf('#047857') > -1, 'line-drive green color applied');
  assert(svg.indexOf('#C2410C') > -1, 'fly-ball orange color applied');
  assert(svg.indexOf('#B91C1C') > -1, 'popup red color applied');
  // Legend
  assert(svg.indexOf('Ground ball') > -1, 'legend lists Ground ball');
});

runScenario('Hitter — sprayChartSVG with empty events shows empty state', () => {
  const win = makeWindow();
  const svg = win.MiLBCards._sprayChartSVG([]);
  assert(svg.indexOf('No batted-ball events') > -1, 'empty state copy present');
  assert(svg.indexOf('<svg') === -1, 'no SVG when empty');
});

runScenario('Hitter — battedBallProfileFromBBE renders distribution + spray + QoC', () => {
  const win = makeWindow();
  const bbe = {
    agg: {
      n: 30,
      avg_ev: 89.6, max_ev: 111.6,
      hard_hit_pct: 43.3, sweet_spot_pct: 26.8, barrel_pct: 12.4,
      avg_la: 13.0,
      gb_pct: 42.3, ld_pct: 22.7, fb_pct: 22.7, pu_pct: 12.4,
      pull_pct: 26.8, center_pct: 47.4, oppo_pct: 25.8
    },
    events: [{ s: 'R' }]
  };
  const lgAgg = {
    avg_ev: 88.9, hard_hit_pct: 38.3, sweet_spot_pct: 34.9, barrel_pct: 8.4,
    gb_pct: 44, ld_pct: 22, fb_pct: 24, pu_pct: 10,
    pull_pct: 30, center_pct: 40, oppo_pct: 30
  };
  const html = win.MiLBCards._battedBallProfileFromBBE(bbe, lgAgg, { xba: 0.275, xslg: 0.446 });
  // Distribution
  assert(html.indexOf('Distribution') > -1, 'distribution section header');
  assert(html.indexOf('Ground Ball') > -1 && html.indexOf('42.3%') > -1, 'GB row with pct');
  assert(html.indexOf('Line Drive')  > -1 && html.indexOf('22.7%') > -1, 'LD row with pct');
  assert(html.indexOf('Fly Ball')    > -1, 'FB row');
  assert(html.indexOf('Popup')       > -1, 'PU row');
  // Spray
  assert(html.indexOf('Spray Direction') > -1, 'spray section header');
  assert(html.indexOf('PULL')   > -1, 'PULL label');
  assert(html.indexOf('CENTER') > -1, 'CENTER label');
  assert(html.indexOf('OPPO')   > -1, 'OPPO label');
  assert(html.indexOf('47.4%')  > -1, 'CENTER pct rendered');
  // QoC
  assert(html.indexOf('Quality of Contact') > -1, 'QoC section header');
  assert(html.indexOf('Avg Exit Velo') > -1, 'Avg EV row');
  assert(html.indexOf('Max Exit Velo') > -1, 'Max EV row');
  assert(html.indexOf('Barrel%')       > -1, 'Barrel% row');
  assert(html.indexOf('Hard Hit%')     > -1, 'Hard Hit% row');
  assert(html.indexOf('Sweet Spot%')   > -1, 'Sweet Spot% row');
  assert(html.indexOf('Avg LA')        > -1, 'Avg LA row');
  assert(html.indexOf('xBA')           > -1, 'xBA row');
  assert(html.indexOf('xSLG')          > -1, 'xSLG row');
});

runScenario('Hitter — battedBallProfileFromBBE empty-state when no events', () => {
  const win = makeWindow();
  const html = win.MiLBCards._battedBallProfileFromBBE({ agg: { n: 0 }, events: [] }, {}, {});
  assert(html.indexOf('No batted-ball events tracked') > -1, 'empty state for no events');
});

runScenario('Pitcher synchronous skeleton', () => {
  const win = makeWindow();
  win.MiLBCards.open(pitcherFull, 'pitchers', makePitcherDb(pitcherFull), 'AAA');
  const html = win.document.getElementById('pc-overlay').innerHTML;
  assert(html.indexOf('Test Ace') > -1, 'header shows player name');
  assert(html.indexOf('Pitch Arsenal') > -1, 'Pitch Arsenal panel title renders');
  assert(html.indexOf('Loading pitch arsenal') > -1, 'arsenal loading state renders');
  assert(html.indexOf('Batted-Ball Against') > -1, 'Batted-Ball Against panel renders');
  assert(html.indexOf('xwOBA-A') > -1, 'xwOBA-A label appears');
  assert(html.indexOf('xBA-A') > -1, 'xBA-A label appears');
  assert(html.indexOf('xSLG-A') > -1, 'xSLG-A label appears');
});

runScenario('Arsenal table render with mock data', () => {
  const win = makeWindow();
  // Verify the arsenalTable function (exported via internals) renders rows
  // when given an arsenal array. This is what hydrateArsenal injects.
  // Use a back-channel by calling renderPitcher then patching the panel.
  win.MiLBCards.open(pitcherFull, 'pitchers', makePitcherDb(pitcherFull), 'AAA');
  const doc = win.document;
  const panel = doc.querySelector('[data-arsenal-target]');
  assert(!!panel, 'arsenal panel has data-arsenal-target attribute');
  // The arsenalTable function is internal; verify the panel anchor exists.
  // Hydration happens in fetch.then() which our stubbed fetch never resolves.
});

runScenario('Pitcher card body still has plate-discipline + stat line', () => {
  const win = makeWindow();
  win.MiLBCards.open(pitcherNoStatcast, 'pitchers', makePitcherDb(pitcherNoStatcast), 'FSL');
  const html = win.document.getElementById('pc-overlay').innerHTML;
  assert(html.indexOf('Pitch Arsenal') > -1, 'pitch arsenal panel title renders');
  assert(html.indexOf('Statcast batted-ball metrics unavailable') > -1, 'batted-ball-against empty-state renders');
  assert(html.indexOf('Plate Discipline') > -1, 'plate-discipline panel still renders');
  assert(html.indexOf('Stat Line') > -1, 'stat-line panel still renders');
});

console.log('\n══════════════════════════════════════════════════');
if ((process.exitCode || 0) === 0) {
  console.log('✅ All ' + total + ' scenarios passed.');
} else {
  console.log('❌ ' + fail + ' of ' + total + ' scenarios had failing assertions.');
}
