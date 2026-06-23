/* ═════════════════════════════════════════════════════════════════════════════
   BASEBALL HUB — MiLB PLAYER CARD DRAWER  (Statcast event-data rebuild)
   ─────────────────────────────────────────────────────────────────────────────
   MLB-parity card layout for AAA + FSL hitters. Panels mirror the MLB cards
   that pull from Baseball Savant — but for MiLB the per-event Statcast data
   comes from the MLB Stats API live-feed pipeline (scripts/fetch-milb-bbe.js)
   because Savant's leaderboards silently swap MiLB filters for MLB data.

     Hitter card panels (2x2 grid):
       • Spray Chart                — SVG, dots colored by bb_type, distance arcs (Statcast)
       • Batted Ball Profile        — distribution bars + spray cone + quality-of-contact
       • Plate Discipline           — BB% / K% / Whiff% / Contact% bars vs league (Stats API)
       • Stat Line                  — counting/speed table (Stats API)

     Pitcher card panels (unchanged from prior rebuild):
       • Pitch Arsenal              — per-pitch usage / velo / whiff% / put-away%
       • Plate Discipline           — K% / BB% / Whiff% / Strike% bars vs league
       • Stat Line                  — counting + workload
       • Batted-Ball Against        — xwOBA-A / xBA-A / xSLG-A gauges

   Data flow:
     - On open(player, mode, db, levelLabel) the synchronous render fires
       immediately so the user sees the card frame instantly.
     - For hitters the Spray Chart + Batted Ball Profile panels render a
       loading state, then fetch ../data/milb/<level>/bbe/<player_id>.json
       and re-render those two panels in place.
     - If the BBE shard is missing (no events in any of the player's games —
       common for FSL parks without Hawk-Eye) the panels show an empty state
       and the rest of the card stays interactive.

   Public API (called by milb-explorer.js):
     window.MiLBCards.open(player, mode, db, levelLabel)
     window.MiLBCards.close()

   Source: MLB Stats API (statsapi.mlb.com), per-event hit_data from live feeds.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

// ── Sample-size thresholds for "qualified" comparisons ──────────────────────
var QUAL_PA = 10;   // hitters
var QUAL_IP = 3;    // pitchers

// ── Bar-chart / gauge reference scales (max for normalization) ──────────────
var SCALE = {
  // hitter PD bars
  bb_pct_h:      { max: 30,   dir:  1 },
  k_pct_h:       { max: 30,   dir: -1 },
  whiff_pct_h:   { max: 60,   dir: -1 },
  contact_pct_h: { max: 100,  dir:  1 },
  // pitcher PD bars
  k_pct_p:       { max: 40,   dir:  1 },
  bb_pct_p:      { max: 20,   dir: -1 },
  kbb_pct_p:     { max: 35,   dir:  1 },
  whiff_pct_p:   { max: 60,   dir:  1 },
  strike_pct_p:  { max: 80,   dir:  1 },
  // hitter batted-ball gauges (Statcast) — fallback if no BBE shard
  xwoba:         { max: 0.50, dir:  1 },
  xba:           { max: 0.40, dir:  1 },
  xslg:          { max: 0.65, dir:  1 },
  // pitcher batted-ball-against gauges
  xwoba_a:       { max: 0.45, dir: -1 },
  xba_a:         { max: 0.35, dir: -1 },
  xslg_a:        { max: 0.60, dir: -1 }
};

// ── BBE shard path resolver ─────────────────────────────────────────────────
// MiLB pages live at /pages/milb-aaa.html and /pages/milb-fsl.html, so the
// shard lives at ../data/milb/<level>/bbe/<player_id>.json. Level comes from
// the levelLabel passed to open() — case-insensitive.
function bbeShardPath(levelLabel, playerId) {
  var lvl = String(levelLabel || '').toLowerCase().trim();
  if (lvl !== 'aaa' && lvl !== 'fsl') return null;
  return '../data/milb/' + lvl + '/bbe/' + playerId + '.json';
}

// In-memory cache so re-opening a card doesn't re-fetch.
var _bbeCache = {};

function fetchBBE(levelLabel, playerId) {
  var key = (levelLabel || '') + ':' + playerId;
  if (_bbeCache[key] !== undefined) return Promise.resolve(_bbeCache[key]);
  var url = bbeShardPath(levelLabel, playerId);
  if (!url) { _bbeCache[key] = null; return Promise.resolve(null); }
  return fetch(url, { cache: 'default' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(function (data) { _bbeCache[key] = data; return data; });
}

// ── Pitcher arsenal shard (lazy-loaded from data/milb/<level>/arsenal/<pid>.json)
//    Backed by per-pitch live-feed extraction in scripts/fetch-milb-bbe.js since
//    the MLB Stats API pitchArsenal endpoint is deprecated (returns 0 splits
//    for ALL leagues including MLB itself, probed 2026-05-04).
function arsenalShardPath(levelLabel, playerId) {
  var lvl = String(levelLabel || '').toLowerCase().trim();
  if (lvl !== 'aaa' && lvl !== 'fsl') return null;
  return '../data/milb/' + lvl + '/arsenal/' + playerId + '.json';
}
var _arsenalCache = {};
function fetchArsenal(levelLabel, playerId) {
  var key = (levelLabel || '') + ':' + playerId;
  if (_arsenalCache[key] !== undefined) return Promise.resolve(_arsenalCache[key]);
  var url = arsenalShardPath(levelLabel, playerId);
  if (!url) { _arsenalCache[key] = null; return Promise.resolve(null); }
  return fetch(url, { cache: 'default' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(function (data) { _arsenalCache[key] = data; return data; });
}

// ── BBE per-level league average (data/milb/<level>/bbe-league-avg.json) ──
// Real AAA / FSL Quality-of-Contact averages computed server-side by
// scripts/fetch-milb-bbe.js so cards show accurate vs-Avg deltas.
var _bbeLgCache = {};
function fetchBbeLeagueAvg(levelLabel) {
  var lvl = String(levelLabel || '').toLowerCase().trim();
  if (lvl !== 'aaa' && lvl !== 'fsl') return Promise.resolve(null);
  if (_bbeLgCache[lvl] !== undefined) return Promise.resolve(_bbeLgCache[lvl]);
  return fetch('../data/milb/' + lvl + '/bbe-league-avg.json', { cache: 'default' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(function (data) { _bbeLgCache[lvl] = data; return data; });
}

// ── Format helpers ──────────────────────────────────────────────────────────
function fmt3(v) {
  if (v == null || isNaN(v)) return '--';
  var s = v.toFixed(3);
  return v >= 0 && v < 1 ? s.replace(/^0/, '') : s;
}
function fmt2(v)   { return (v == null || isNaN(v)) ? '--' : v.toFixed(2); }
function fmt1(v)   { return (v == null || isNaN(v)) ? '--' : v.toFixed(1); }
function fmtPct(v, dp) { return (v == null || isNaN(v)) ? '--' : v.toFixed(dp == null ? 1 : dp) + '%'; }
function fmtInt(v) { return (v == null || isNaN(v)) ? '--' : String(Math.round(v)); }
function fmtIP(v)  { return (v == null || isNaN(v)) ? '--' : v.toFixed(1); }
function fmtMph(v) { return (v == null || isNaN(v)) ? '--' : v.toFixed(1) + ' mph'; }
function fmtDeg(v) { return (v == null || isNaN(v)) ? '--' : v.toFixed(1) + '°'; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
  });
}

function avatarInitials(name) {
  if (!name) return '?';
  var parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function teamAbbrev(p) {
  if (p.team_abbrev) return p.team_abbrev;
  if (!p.team) return '--';
  return p.team.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 4).toUpperCase();
}

// ── League averages ─────────────────────────────────────────────────────────
function computeHitterLeagueAvgs(rows) {
  var qual = (rows || []).filter(function (r) { return (r.pa || 0) >= QUAL_PA; });
  if (!qual.length) return { qualified: false, n: 0 };
  var sum = function (k) { return qual.reduce(function (a, r) { return a + (Number(r[k]) || 0); }, 0); };
  var mean = function (k) {
    var vals = qual.map(function (r) { return r[k]; }).filter(function (v) { return v != null && !isNaN(v); });
    return vals.length ? vals.reduce(function (a, v) { return a + v; }, 0) / vals.length : null;
  };
  var H = sum('h'), AB = sum('ab'), BB = sum('bb'), HBP = sum('hbp'), SF = sum('sf'), PA = sum('pa'), HR = sum('hr');
  var TB = sum('singles') + 2 * sum('d') + 3 * sum('t') + 4 * sum('hr');
  var avg = AB ? H / AB : null;
  var obp = (AB + BB + HBP + SF) ? (H + BB + HBP) / (AB + BB + HBP + SF) : null;
  var slg = AB ? TB / AB : null;
  return {
    qualified: true,
    n: qual.length,
    avg: avg, obp: obp, slg: slg,
    ops: (obp != null && slg != null) ? obp + slg : null,
    woba: mean('woba'),
    babip: mean('babip'),
    iso: mean('iso'),
    bb_pct: mean('bb_pct'),
    k_pct: mean('k_pct'),
    hr_pct: mean('hr_pct'),
    whiff_pct: mean('whiff_pct'),
    contact_pct: mean('contact_pct'),
    bb_k: mean('bb_k'),
    hr_per_pa: PA ? (HR / PA) * 100 : null,
    xba:   mean('xba'),
    xslg:  mean('xslg'),
    xwoba: mean('xwoba')
  };
}

function computePitcherLeagueAvgs(rows) {
  var qual = (rows || []).filter(function (r) { return (r.ip || 0) >= QUAL_IP; });
  if (!qual.length) return { qualified: false, n: 0 };
  var sum = function (k) { return qual.reduce(function (a, r) { return a + (Number(r[k]) || 0); }, 0); };
  var mean = function (k) {
    var vals = qual.map(function (r) { return r[k]; }).filter(function (v) { return v != null && !isNaN(v); });
    return vals.length ? vals.reduce(function (a, v) { return a + v; }, 0) / vals.length : null;
  };
  var IP = sum('ip'), ER = sum('er'), HA = sum('h_a'), BB = sum('bb'), HRA = sum('hr_a'), K = sum('k'), BF = sum('bf'), HBP = sum('hbp');
  return {
    qualified: true,
    n: qual.length,
    era: IP ? (ER * 9) / IP : null,
    whip: IP ? (BB + HA) / IP : null,
    hr9: IP ? (HRA * 9) / IP : null,
    k9:  IP ? (K * 9) / IP : null,
    bb9: IP ? (BB * 9) / IP : null,
    fip: mean('fip'),
    k_pct: mean('k_pct'),
    bb_pct: mean('bb_pct'),
    kbb_pct: mean('kbb_pct'),
    whiff_pct: mean('whiff_pct'),
    strike_pct: mean('strike_pct'),
    avg_a: BF && (BF - BB - HBP) > 0 ? HA / (BF - BB - HBP) : mean('avg_a'),
    obp_a: mean('obp_a'),
    slg_a: mean('slg_a'),
    ops_a: mean('ops_a'),
    babip: mean('babip'),
    xba_a:   mean('xba_a'),
    xslg_a:  mean('xslg_a'),
    xwoba_a: mean('xwoba_a')
  };
}

// ── BBE league averages (per-level, computed lazily on first need) ──────────
// Stored on db._bbeAvg by level so cards can compare a player's QoC metrics
// against the level average. Compute on demand from the BBE manifest, not
// from individual shards (too slow).
//
// Since we can't fetch all shards, we expose a helper that records each
// player's agg as it's loaded and runs an online mean.
var _bbeAggRunning = {};  // level -> { n, sum_avg_ev, ..., agg: {avg_ev_avg, ...} }
function _ensureBbeRunning(levelKey) {
  if (!_bbeAggRunning[levelKey]) {
    _bbeAggRunning[levelKey] = {
      n: 0, ids: {},
      sum: { avg_ev:0, hard_hit_pct:0, sweet_spot_pct:0, barrel_pct:0,
             gb_pct:0, ld_pct:0, fb_pct:0, pu_pct:0,
             pull_pct:0, center_pct:0, oppo_pct:0 },
      cnt: { avg_ev:0, hard_hit_pct:0, sweet_spot_pct:0, barrel_pct:0,
             gb_pct:0, ld_pct:0, fb_pct:0, pu_pct:0,
             pull_pct:0, center_pct:0, oppo_pct:0 }
    };
  }
  return _bbeAggRunning[levelKey];
}
function _recordBbeAgg(levelKey, pid, agg) {
  if (!agg) return;
  var rec = _ensureBbeRunning(levelKey);
  if (rec.ids[pid]) return;  // already counted
  rec.ids[pid] = true;
  rec.n++;
  Object.keys(rec.sum).forEach(function (k) {
    var v = agg[k];
    if (v != null && !isNaN(v)) { rec.sum[k] += v; rec.cnt[k]++; }
  });
}
function _bbeMean(levelKey, key) {
  var rec = _bbeAggRunning[levelKey];
  if (!rec || !rec.cnt[key]) return null;
  return rec.sum[key] / rec.cnt[key];
}

// ── PD bar (unchanged) ──────────────────────────────────────────────────────
function pdBar(label, value, leagueAvg, scaleKey, qualified) {
  var sc = SCALE[scaleKey] || { max: 100, dir: 1 };
  var max = sc.max, dir = sc.dir;
  var fillW = value == null || isNaN(value) ? 0 : clamp((value / max) * 100, 0, 100);
  var avgL  = leagueAvg == null || isNaN(leagueAvg) ? 0 : clamp((leagueAvg / max) * 100, 0, 100);
  var better = (value != null && leagueAvg != null && !isNaN(value) && !isNaN(leagueAvg))
    ? ((dir === 1 ? value >= leagueAvg : value <= leagueAvg) ? 'good' : 'bad')
    : '';
  var fillCls = qualified ? better : '';
  var tickHtml = qualified && leagueAvg != null && !isNaN(leagueAvg)
    ? '<div class="pd-bar-avg" style="left:' + avgL.toFixed(1) + '%"></div>'
    : '';
  return '<div class="pd-row">'
    +  '<span class="pd-label">' + escapeHtml(label) + '</span>'
    +  '<div class="pd-bar-track">'
    +    '<div class="pd-bar-fill ' + fillCls + '" style="width:' + fillW.toFixed(1) + '%"></div>'
    +    tickHtml
    +  '</div>'
    +  '<span class="pd-val">' + fmtPct(value) + '</span>'
    + '</div>';
}

// ── Gauge (used for pitcher batted-ball-against) ────────────────────────────
function gauge(label, value, leagueAvg, scaleKey, valFmt, qualified, deltaFmt) {
  var sc = SCALE[scaleKey] || { max: 1, dir: 1 };
  var dir = sc.dir, max = sc.max;
  var pct;
  if (value == null || isNaN(value)) pct = 0;
  else if (dir === 1) pct = clamp((value / max) * 100, 0, 100);
  else                pct = clamp((1 - value / max) * 100, 0, 100);
  var meterCls = '';
  var deltaCls = 'vs';
  if (qualified && value != null && leagueAvg != null && !isNaN(value) && !isNaN(leagueAvg)) {
    var better = dir === 1 ? value >= leagueAvg : value <= leagueAvg;
    meterCls = better ? '' : 'bad';
    deltaCls = better ? 'vs' : 'vs bad';
  } else { meterCls = 'mid'; }
  var foot = '';
  if (leagueAvg != null && !isNaN(leagueAvg)) {
    var diff = (value != null && !isNaN(value)) ? (value - leagueAvg) : null;
    var deltaStr = '';
    if (diff != null) {
      var sign = diff >= 0 ? '+' : '';
      deltaStr = ' · <span class="' + deltaCls + '">' + sign + (deltaFmt ? deltaFmt(diff) : valFmt(Math.abs(diff))) + '</span>';
    }
    foot = '<div class="gauge-foot">Lg avg ' + valFmt(leagueAvg) + deltaStr + '</div>';
  } else {
    foot = '<div class="gauge-foot">Lg avg --</div>';
  }
  return '<div class="gauge">'
    +  '<div class="gauge-top"><span class="gauge-label">' + escapeHtml(label) + '</span><span class="gauge-val">' + valFmt(value) + '</span></div>'
    +  '<div class="gauge-meter"><div class="gauge-meter-fill ' + meterCls + '" style="width:' + pct.toFixed(1) + '%"></div></div>'
    +  foot
    + '</div>';
}

// ── Pitch-arsenal table (pitcher card; unchanged) ───────────────────────────
function arsenalRow(p) {
  var pct = p.pct;
  var pctW = (pct == null || isNaN(pct)) ? 0 : clamp(pct, 0, 100);
  var pctStr = (pct == null || isNaN(pct)) ? '--' : pct.toFixed(1) + '%';
  var velo = (p.velo == null || isNaN(p.velo)) ? '--' : p.velo.toFixed(1);
  var whiff = (p.whiff_pct == null || isNaN(p.whiff_pct)) ? '--' : p.whiff_pct.toFixed(1) + '%';
  var pa = (p.put_away_pct == null || isNaN(p.put_away_pct)) ? '--' : p.put_away_pct.toFixed(1) + '%';
  return '<tr>'
    +    '<td class="ar-type"><span class="ar-code">' + escapeHtml(p.code || '--') + '</span> ' + escapeHtml(p.type || '--') + '</td>'
    +    '<td class="ar-usage"><div class="ar-bar"><div class="ar-bar-fill" style="width:' + pctW.toFixed(1) + '%"></div></div><span class="ar-usage-num">' + pctStr + '</span></td>'
    +    '<td class="ar-num">' + velo + '</td>'
    +    '<td class="ar-num">' + whiff + '</td>'
    +    '<td class="ar-num">' + pa + '</td>'
    +  '</tr>';
}

function arsenalTable(arsenal) {
  if (!arsenal || !arsenal.length) {
    return '<div class="ar-empty">Pitch-by-pitch tracking unavailable for this player.<br>'
      +  '<span class="ar-empty-sub">Statcast coverage is full at AAA, partial at FSL.</span></div>';
  }
  var rows = arsenal.map(arsenalRow).join('');
  return '<table class="arsenal-tbl"><thead><tr>'
    +    '<th>Pitch</th><th>Usage</th><th>Velo</th><th>Whiff%</th><th>Put-Away%</th>'
    +    '</tr></thead><tbody>' + rows + '</tbody></table>';
}

function bbAbsent(p, fields) {
  for (var i = 0; i < fields.length; i++) {
    var v = p[fields[i]];
    if (v != null && !isNaN(v)) return false;
  }
  return true;
}
function bbEmptyMsg() {
  return '<div class="ar-empty">Statcast batted-ball metrics unavailable for this player.<br>'
    + '<span class="ar-empty-sub">Coverage is full at AAA, partial at FSL.</span></div>';
}

// ── vs-Avg row helper (unchanged) ───────────────────────────────────────────
function vsRow(label, value, leagueAvg, dir, valFmt, diffFmt) {
  if (value == null || isNaN(value) || leagueAvg == null || isNaN(leagueAvg)) {
    return [
      '<td>' + escapeHtml(label) + '</td>',
      '<td>' + (valFmt(value)) + '</td>',
      '<td>' + (valFmt(leagueAvg)) + '</td>',
      '<td>--</td>'
    ];
  }
  var diff = value - leagueAvg;
  var good = (dir === 1) ? diff >= 0 : diff <= 0;
  var cls = good ? 'diff-good' : 'diff-bad';
  var sign = diff >= 0 ? '+' : (diffFmt ? '' : '−');
  var diffStr;
  if (diffFmt) diffStr = (diff >= 0 ? '+' : '') + diffFmt(diff);
  else         diffStr = sign + valFmt(Math.abs(diff)).replace(/^\.?-/, '.');
  return [
    '<td>' + escapeHtml(label) + '</td>',
    '<td>' + valFmt(value) + '</td>',
    '<td>' + valFmt(leagueAvg) + '</td>',
    '<td class="' + cls + '">' + diffStr + '</td>'
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// SPRAY CHART (Statcast event-data SVG)
// ═════════════════════════════════════════════════════════════════════════════
//
// Stats API hit-data coordinates: x in [0,250] (LF foul line at 0, RF foul
// line at 250, dead-center ≈ 125), y in [0,250] (home plate near y=200,
// dead-center deep at y≈25). One Stats-API unit ≈ 2.5 feet (calibrated
// against batted-ball total_distance).
//
// Canvas: 350 × 350 SVG, home plate at (175, 320), 200/300/400ft arcs drawn
// as quarter-circle strokes. Foul lines drawn at ±45°.
var SC_W = 350, SC_H = 350;
var SC_HP = { x: 175, y: 320 };           // home plate canvas position
var SC_FT_PER_PX = 2.0;                   // tuned for the canvas
function sc_arcRadius(ft) { return ft / SC_FT_PER_PX; }

// Stats-API → canvas coordinate transform.
//   (raw_x=125, raw_y=200) → home plate
//   raw scale: 1 unit ≈ 2.5 feet → canvas: feet × (1/SC_FT_PER_PX)
function sc_project(raw_x, raw_y) {
  if (raw_x == null || raw_y == null) return null;
  var dx = raw_x - 125;
  var dy = 200 - raw_y;       // flip y so deeper hits are higher on canvas
  // Stats API unit ≈ 2.5 ft, so feet = unit × 2.5
  var ftX = dx * 2.5;
  var ftY = dy * 2.5;
  var px = SC_HP.x + ftX / SC_FT_PER_PX;
  var py = SC_HP.y - ftY / SC_FT_PER_PX;
  return { x: px, y: py };
}

function sc_dotColor(bb) {
  return ({
    line_drive: '#047857',  // green
    fly_ball:   '#C2410C',  // orange
    ground_ball:'#1D4ED8',  // blue
    popup:      '#B91C1C'   // red
  })[bb] || '#6b88aa';
}

function sprayChartSVG(events) {
  if (!events || !events.length) {
    return '<div class="ar-empty" style="height:300px;display:flex;align-items:center;justify-content:center">'
      + 'No batted-ball events with Statcast tracking yet.<br>'
      + '<span class="ar-empty-sub">Coverage is full at AAA, partial at FSL.</span>'
      + '</div>';
  }
  // Outfield wall arc — quarter-circle from foul line to foul line at ~410ft.
  var wallR = sc_arcRadius(410);
  // Foul lines from home plate at -45° and +45° (in canvas terms, that's 45°
  // off vertical to the upper-left and upper-right).
  // sin(45°)*r ≈ 0.707 r
  var foul = 0.707 * wallR;
  var foulPathR = 'M' + SC_HP.x + ',' + SC_HP.y + ' L' + (SC_HP.x + foul) + ',' + (SC_HP.y - foul);
  var foulPathL = 'M' + SC_HP.x + ',' + SC_HP.y + ' L' + (SC_HP.x - foul) + ',' + (SC_HP.y - foul);
  // Wall arc — quarter circle (135°→45°)
  var wallStart = { x: SC_HP.x - foul, y: SC_HP.y - foul };
  var wallEnd   = { x: SC_HP.x + foul, y: SC_HP.y - foul };
  var wallArc = 'M' + wallStart.x + ',' + wallStart.y
    + ' A' + wallR + ',' + wallR + ' 0 0 1 ' + wallEnd.x + ',' + wallEnd.y;
  // Distance arcs: 200/300/400 ft
  function arcAtFt(ft) {
    var r = sc_arcRadius(ft);
    var f = 0.707 * r;
    var sx = SC_HP.x - f, sy = SC_HP.y - f;
    var ex = SC_HP.x + f, ey = SC_HP.y - f;
    return 'M' + sx + ',' + sy + ' A' + r + ',' + r + ' 0 0 1 ' + ex + ',' + ey;
  }
  var dots = events.map(function (e) {
    var p = sc_project(e.x, e.y);
    if (!p) return '';
    var color = sc_dotColor(e.bb);
    var stroke = (e.e && /home run|homer/i.test(e.e)) ? '#a00' : 'none';
    var sw = (stroke === 'none') ? 0 : 1.5;
    return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3.2" '
      + 'fill="' + color + '" fill-opacity="0.78" stroke="' + stroke + '" stroke-width="' + sw + '">'
      + '<title>' + escapeHtml((e.e || '')) + ' · ' + (e.ev != null ? e.ev.toFixed(1) + ' mph' : '--') + ' · ' + (e.la != null ? e.la.toFixed(0) + '°' : '--') + (e.dist != null ? ' · ' + e.dist + ' ft' : '') + '</title>'
      + '</circle>';
  }).join('');
  // Distance labels
  var lblFt = function (ft) {
    var r = sc_arcRadius(ft);
    var lx = SC_HP.x - r * 0.06;
    var ly = SC_HP.y - r;
    return '<text x="' + lx + '" y="' + (ly + 11) + '" class="sc-arc-lbl">' + ft + 'ft</text>';
  };
  return '<svg class="spray-chart-svg" viewBox="0 0 ' + SC_W + ' ' + SC_H + '" preserveAspectRatio="xMidYMid meet">'
    + '<path d="' + arcAtFt(200) + '" class="sc-arc" />'
    + '<path d="' + arcAtFt(300) + '" class="sc-arc" />'
    + '<path d="' + arcAtFt(400) + '" class="sc-arc" />'
    + '<path d="' + foulPathL + '" class="sc-foul" />'
    + '<path d="' + foulPathR + '" class="sc-foul" />'
    + '<path d="' + wallArc + '" class="sc-wall" />'
    + lblFt(200) + lblFt(300) + lblFt(400)
    + '<rect x="' + (SC_HP.x - 4) + '" y="' + (SC_HP.y - 2) + '" width="8" height="8" class="sc-home" />'
    + '<text x="' + SC_HP.x + '" y="' + (SC_HP.y + 16) + '" class="sc-home-lbl" text-anchor="middle">HOME</text>'
    + '<text x="340" y="22" class="sc-event-count" text-anchor="end">N=' + events.length + ' EVENTS</text>'
    + dots
    + '</svg>'
    + '<div class="sc-legend">'
    +   '<div class="sc-legend-title">BATTED-BALL TYPE</div>'
    +   '<div class="sc-legend-row">'
    +     '<span><span class="sc-dot" style="background:#1D4ED8"></span>Ground ball</span>'
    +     '<span><span class="sc-dot" style="background:#047857"></span>Line drive</span>'
    +     '<span><span class="sc-dot" style="background:#C2410C"></span>Fly ball</span>'
    +     '<span><span class="sc-dot" style="background:#B91C1C"></span>Popup</span>'
    +   '</div>'
    + '</div>';
}

// ═════════════════════════════════════════════════════════════════════════════
// BATTED BALL PROFILE PANEL  (distribution + spray cone + quality of contact)
// ═════════════════════════════════════════════════════════════════════════════

function bbpDistributionRow(label, pct, color) {
  var w = (pct == null || isNaN(pct)) ? 0 : clamp(pct, 0, 100);
  return '<div class="bbp-dist-row">'
    +  '<span class="bbp-dist-dot" style="background:' + color + '"></span>'
    +  '<span class="bbp-dist-lbl">' + escapeHtml(label) + '</span>'
    +  '<span class="bbp-dist-bar"><span class="bbp-dist-fill" style="width:' + w.toFixed(1) + '%;background:' + color + '"></span></span>'
    +  '<span class="bbp-dist-pct">' + (pct == null || isNaN(pct) ? '--' : pct.toFixed(1) + '%') + '</span>'
    + '</div>';
}

function bbpDistribution(agg) {
  return '<div class="bbp-dist">'
    +  '<div class="bbp-section-lbl">Distribution</div>'
    +  bbpDistributionRow('Ground Ball', agg.gb_pct, '#1D4ED8')
    +  bbpDistributionRow('Line Drive',  agg.ld_pct, '#047857')
    +  bbpDistributionRow('Fly Ball',    agg.fb_pct, '#C2410C')
    +  bbpDistributionRow('Popup',       agg.pu_pct, '#B91C1C')
    + '</div>';
}

// 3-cone spray-direction triangle, RHB-perspective (LHB cone is mirrored
// in the data already since classifySpray flips by stand).
function bbpSprayCone(agg, stand) {
  // viewBox: 280 wide × 200 tall. Home plate at bottom-center (140, 155).
  // Cones fan upward. Field tip labels (LF/CF/RF) at outer arc; OPPO/CENTER
  // /PULL labels + percentages laid out in a clean horizontal row BELOW the
  // cone (no overlap with cone fill).
  var cx = 140, cy = 155;
  var len = 130;
  function cone(angleStart, angleEnd, fill, opacity) {
    var aS = (angleStart - 90) * Math.PI / 180;
    var aE = (angleEnd - 90) * Math.PI / 180;
    var x1 = cx + len * Math.cos(aS), y1 = cy + len * Math.sin(aS);
    var x2 = cx + len * Math.cos(aE), y2 = cy + len * Math.sin(aE);
    return '<polygon points="' + cx + ',' + cy + ' ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" fill="' + fill + '" fill-opacity="' + opacity + '" stroke="' + fill + '" stroke-width="1" />';
  }
  function labelPos(angleStart, angleEnd, distFrac) {
    var bisector = (angleStart + angleEnd) / 2;
    var rad = (bisector - 90) * Math.PI / 180;
    return { x: cx + distFrac * len * Math.cos(rad), y: cy + distFrac * len * Math.sin(rad) };
  }
  var isLHB = stand === 'L';
  var pullCol = '#9C2E2E', centerCol = '#7A4F1A', oppoCol = '#1F4D7A';
  var pullPct = agg.pull_pct, ctrPct = agg.center_pct, oppoPct = agg.oppo_pct;
  var leftPct  = isLHB ? oppoPct : pullPct;
  var rightPct = isLHB ? pullPct : oppoPct;
  var leftLbl  = isLHB ? 'OPPO' : 'PULL';
  var rightLbl = isLHB ? 'PULL' : 'OPPO';
  var fmtCone = function (v) { return (v == null || isNaN(v)) ? '--' : v.toFixed(1) + '%'; };
  // Position labels at 55% of cone length along bisector — well inside cones,
  // away from the home-plate vertex and the outer arc.
  var lP = labelPos(-45, -15, 0.55);
  var cP = labelPos(-15,  15, 0.55);
  var rP = labelPos( 15,  45, 0.55);
  // Field-orientation hints (LF/CENTER/RF) at the cone tips for clarity
  var lT = labelPos(-45, -15, 1.05);
  var cT = labelPos(-15,  15, 1.05);
  var rT = labelPos( 15,  45, 1.05);
  return '<div class="bbp-spray">'
    +  '<div class="bbp-section-lbl">Spray Direction (' + (isLHB ? 'LHB' : 'RHB') + ')</div>'
    +  '<svg class="bbp-spray-svg" viewBox="0 0 280 220" preserveAspectRatio="xMidYMid meet">'
    +    cone(-45, -15, isLHB ? oppoCol : pullCol, 0.32)
    +    cone(-15,  15, centerCol, 0.32)
    +    cone( 15,  45, isLHB ? pullCol : oppoCol, 0.32)
    +    '<text x="' + lT.x.toFixed(1) + '" y="' + lT.y.toFixed(1) + '" class="bbp-spray-tip" text-anchor="middle">LF</text>'
    +    '<text x="' + cT.x.toFixed(1) + '" y="' + cT.y.toFixed(1) + '" class="bbp-spray-tip" text-anchor="middle">CF</text>'
    +    '<text x="' + rT.x.toFixed(1) + '" y="' + rT.y.toFixed(1) + '" class="bbp-spray-tip" text-anchor="middle">RF</text>'
    +    '<rect x="20" y="' + (cy + 20) + '" width="240" height="1" fill="rgba(45,36,24,0.18)" />'
    +    '<text x="55"  y="' + (cy + 42) + '" class="bbp-spray-lbl" text-anchor="middle">' + leftLbl + '</text>'
    +    '<text x="55"  y="' + (cy + 58) + '" class="bbp-spray-pct" text-anchor="middle">' + fmtCone(leftPct) + '</text>'
    +    '<text x="140" y="' + (cy + 42) + '" class="bbp-spray-lbl" text-anchor="middle">CENTER</text>'
    +    '<text x="140" y="' + (cy + 58) + '" class="bbp-spray-pct" text-anchor="middle">' + fmtCone(ctrPct) + '</text>'
    +    '<text x="225" y="' + (cy + 42) + '" class="bbp-spray-lbl" text-anchor="middle">' + rightLbl + '</text>'
    +    '<text x="225" y="' + (cy + 58) + '" class="bbp-spray-pct" text-anchor="middle">' + fmtCone(rightPct) + '</text>'
    +  '</svg>'
    + '</div>';
}

// Quality of Contact table — 8 rows with vs-avg deltas.
function bbpQoCRow(label, value, leagueAvg, dir, valFmt, diffFmt) {
  var diff = (value != null && leagueAvg != null && !isNaN(value) && !isNaN(leagueAvg))
    ? value - leagueAvg : null;
  var diffCell = '<td class="bbp-qoc-diff">--</td>';
  if (diff != null) {
    var good = (dir === 1) ? diff >= 0 : diff <= 0;
    var cls = good ? 'diff-good' : 'diff-bad';
    var sign = diff >= 0 ? '+' : '';
    var diffStr = diffFmt ? sign + diffFmt(diff) : sign + valFmt(diff);
    diffCell = '<td class="bbp-qoc-diff ' + cls + '">' + diffStr + '</td>';
  }
  return '<tr><td class="bbp-qoc-lbl">' + escapeHtml(label) + '</td>'
    + '<td class="bbp-qoc-val">' + valFmt(value) + '</td>'
    + diffCell
    + '</tr>';
}

function bbpQualityOfContact(agg, lgAgg, p) {
  // Quality of Contact — drops xBA / xSLG (per rework spec), adds Z-Con% /
  // O-Con% from the new pitch-discipline aggregate carried on agg.*.
  var pp = function (v) { return v == null || isNaN(v) ? '--' : v.toFixed(1) + 'pp'; };
  var pctFmt = function (v) { return v == null || isNaN(v) ? '--' : v.toFixed(1) + '%'; };
  var rows = []
    .concat(bbpQoCRow('Avg Exit Velo', agg.avg_ev,         lgAgg.avg_ev,         1, fmtMph, function (d) { return d.toFixed(1); }))
    .concat(bbpQoCRow('Max Exit Velo', agg.max_ev,         lgAgg.max_ev,         1, fmtMph, function (d) { return d.toFixed(1); }))
    .concat(bbpQoCRow('Barrel%',       agg.barrel_pct,     lgAgg.barrel_pct,     1, pctFmt, pp))
    .concat(bbpQoCRow('Hard Hit%',     agg.hard_hit_pct,   lgAgg.hard_hit_pct,   1, pctFmt, pp))
    .concat(bbpQoCRow('Sweet Spot%',   agg.sweet_spot_pct, lgAgg.sweet_spot_pct, 1, pctFmt, pp))
    .concat(bbpQoCRow('Avg LA',        agg.avg_la,         lgAgg.avg_la,         1, fmtDeg, function (d) { return d.toFixed(1); }))
    .concat(bbpQoCRow('Z-Contact%',    agg.z_contact_pct,  lgAgg.z_contact_pct,  1, pctFmt, pp))
    .concat(bbpQoCRow('O-Contact%',    agg.o_contact_pct,  lgAgg.o_contact_pct,  1, pctFmt, pp));
  return '<div class="bbp-qoc">'
    + '<table class="bbp-qoc-tbl"><thead><tr><th>Metric</th><th>Value</th><th>vs Avg</th></tr></thead><tbody>'
    + rows.join('') + '</tbody></table>'
    + '</div>';
}

function battedBallProfileFromBBE(bbe, lgAgg, p) {
  if (!bbe || !bbe.agg || !bbe.agg.n) {
    return '<div class="ar-empty" style="padding:18px 14px">'
      + 'No batted-ball events tracked yet for this player.<br>'
      + '<span class="ar-empty-sub">Coverage is full at AAA, partial at FSL.</span>'
      + '</div>';
  }
  return bbpQualityOfContact(bbe.agg, lgAgg || {}, p);
}

// Text-based batted-ball distribution — replaces the SVG distribution + spray
// cone. Shows GB / LD / FB / PU + Pull / Cent / Oppo as side-by-side bars w/
// the league-average delta in parentheses.
function bbDistributionText(bbe, lgAgg) {
  if (!bbe || !bbe.agg || !bbe.agg.n) {
    return '<div class="ar-empty" style="padding:14px">'
      + 'No batted-ball events tracked yet — coverage is full at AAA, partial at FSL.</div>';
  }
  var a = bbe.agg, lg = lgAgg || {};
  function row(label, key, dir) {
    var v = a[key]; var l = lg[key];
    var vTxt = v == null || isNaN(v) ? '--' : v.toFixed(1) + '%';
    var deltaTxt = '';
    if (v != null && l != null && !isNaN(v) && !isNaN(l)) {
      var d = v - l;
      var good = dir === 0 ? null : (dir === 1 ? d >= 0 : d <= 0);
      var sign = d >= 0 ? '+' : '−';
      var cls = good == null ? '' : (good ? 'diff-good' : 'diff-bad');
      deltaTxt = ' <span class="bb-dist-delta ' + cls + '">' + sign + Math.abs(d).toFixed(1) + 'pp</span>';
    }
    var pct = v == null || isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
    return '<div class="bb-dist-row">'
      + '<div class="bb-dist-lbl">' + label + '</div>'
      + '<div class="bb-dist-bar"><div class="bb-dist-fill" style="width:' + pct + '%"></div></div>'
      + '<div class="bb-dist-val">' + vTxt + deltaTxt + '</div>'
      + '</div>';
  }
  return '<div class="bb-dist-group">'
    +   '<div class="bb-dist-h">Trajectory mix</div>'
    +   row('Ground Ball', 'gb_pct', 0)
    +   row('Line Drive',  'ld_pct', 1)
    +   row('Fly Ball',    'fb_pct', 0)
    +   row('Pop Up',      'pu_pct', -1)
    + '</div>'
    + '<div class="bb-dist-group">'
    +   '<div class="bb-dist-h">Spray angle</div>'
    +   row('Pull',   'pull_pct',   0)
    +   row('Center', 'center_pct', 0)
    +   row('Oppo',   'oppo_pct',   0)
    + '</div>';
}

// Hitter Percentiles vs League — mirrors pitcherVsTable visually. Shows
// player value, lg avg, diff, and percentile within the loaded hitter pool.
function hitterVsTable(p, lg, hitters, levelLabel, qualified) {
  hitters = hitters || [];
  function pctRank(key, v, dir) {
    var vals = hitters.map(function (r) { return r[key]; })
      .filter(function (x) { return x != null && !isNaN(x); });
    if (!vals.length || v == null || isNaN(v)) return null;
    var nBeaten = vals.filter(function (x) { return dir === 1 ? x <= v : x >= v; }).length;
    return Math.round(100 * nBeaten / vals.length);
  }
  var pct1 = function (v) { return fmtPct(v, 1); };
  var defs = [
    { lbl: 'AVG',   key: 'avg',    dir:  1, fmt: fmt3 },
    { lbl: 'OBP',   key: 'obp',    dir:  1, fmt: fmt3 },
    { lbl: 'SLG',   key: 'slg',    dir:  1, fmt: fmt3 },
    { lbl: 'OPS',   key: 'ops',    dir:  1, fmt: fmt3 },
    { lbl: 'wOBA',  key: 'woba',   dir:  1, fmt: fmt3 },
    { lbl: 'xwOBA', key: 'xwoba',  dir:  1, fmt: fmt3 },
    { lbl: 'ISO',   key: 'iso',    dir:  1, fmt: fmt3 },
    { lbl: 'K%',    key: 'k_pct',  dir: -1, fmt: pct1 },
    { lbl: 'BB%',   key: 'bb_pct', dir:  1, fmt: pct1 }
  ];
  var body = defs.map(function (d) {
    var pv = p[d.key];
    var la = qualified ? lg[d.key] : null;
    var diffCell = '<td class="vt-diff">--</td>';
    if (pv != null && la != null && !isNaN(pv) && !isNaN(la)) {
      var diff = pv - la;
      var good = d.dir === 1 ? diff >= 0 : diff <= 0;
      var sign = diff >= 0 ? '+' : '−';
      diffCell = '<td class="vt-diff ' + (good ? 'diff-good' : 'diff-bad') + '">'
        + sign + d.fmt(Math.abs(diff)) + '</td>';
    }
    var pr = pctRank(d.key, pv, d.dir);
    var pctCell = '<td class="vt-pct"><span class="vt-na">--</span></td>';
    if (pr != null) {
      var cls = pr >= 75 ? 'vt-hi' : pr <= 25 ? 'vt-lo' : 'vt-mid';
      pctCell = '<td class="vt-pct">'
        + '<span class="vt-pct-track"><span class="vt-pct-fill ' + cls + '" style="width:' + pr + '%"></span></span>'
        + '<span class="vt-pct-num">' + pr + '</span></td>';
    }
    return '<tr>'
      + '<td class="vt-metric">' + escapeHtml(d.lbl) + '</td>'
      + '<td class="vt-val">' + d.fmt(pv) + '</td>'
      + '<td class="vt-avg">' + (la != null ? d.fmt(la) : '--') + '</td>'
      + diffCell + pctCell
      + '</tr>';
  }).join('');
  var lvl = escapeHtml((levelLabel || '').toUpperCase() || 'Lg');
  return '<table class="vt-tbl"><thead><tr>'
    + '<th>Metric</th><th>Player</th><th>' + lvl + ' Avg</th><th>Diff</th><th>Percentile</th>'
    + '</tr></thead><tbody>' + body + '</tbody></table>';
}

function battedBallProfileLoading() {
  return '<div class="bbp-loading">Loading Statcast events…</div>';
}

// ═════════════════════════════════════════════════════════════════════════════
// HITTER CARD
// ═════════════════════════════════════════════════════════════════════════════
function renderHitter(p, lg, levelLabel, hitters) {
  hitters = hitters || [];
  var qualified = lg && lg.qualified && (p.pa || 0) >= QUAL_PA;
  var levelLeague = (levelLabel || '').toUpperCase() + (p.league ? ' · ' + p.league : '');

  // Headline KPI strip
  var kpis = [
    ['AVG',  fmt3(p.avg)],
    ['OPS',  fmt3(p.ops)],
    ['wOBA', fmt3(p.woba)],
    ['HR',   fmtInt(p.hr)],
    ['ISO',  fmt3(p.iso)]
  ];

  // Plate Discipline bars — vs league
  var pdHtml = [
    pdBar('BB%',      p.bb_pct,      qualified ? lg.bb_pct      : null, 'bb_pct_h',      qualified),
    pdBar('K%',       p.k_pct,       qualified ? lg.k_pct       : null, 'k_pct_h',       qualified),
    pdBar('Whiff%',   p.whiff_pct,   qualified ? lg.whiff_pct   : null, 'whiff_pct_h',   qualified),
    pdBar('Contact%', p.contact_pct, qualified ? lg.contact_pct : null, 'contact_pct_h', qualified)
  ].join('');

  var sssChip = qualified ? '' : '<span class="pc-sss-chip" title="Below qualified PA threshold">Small Sample · PA &lt; ' + QUAL_PA + '</span>';
  var pctLbl = qualified
    ? 'Percentiles vs. ' + escapeHtml(levelLeague) + ' (PA ≥ ' + QUAL_PA + ')'
    : 'Percentiles vs. ' + escapeHtml(levelLeague) + ' — small sample (PA &lt; ' + QUAL_PA + ')';

  return ''
    + '<div class="pc-card">'
    +   '<button class="pc-close" onclick="MiLBCards.close()">&times;</button>'
    +   '<div class="pc-header">'
    +     '<div class="pc-header-top">'
    +       '<div class="pc-avatar">' + escapeHtml(avatarInitials(p.name)) + '</div>'
    +       '<div class="pc-info">'
    +         '<div class="pc-name">' + escapeHtml(p.name || '--') + '</div>'
    +         '<div class="pc-meta">'
    +           '<span class="pc-team-badge">' + escapeHtml(teamAbbrev(p)) + '</span>'
    +           '<span class="pc-level-pill">' + escapeHtml(levelLeague) + '</span>'
    +           '<span>' + escapeHtml((p.pos || '') + (p.age ? ' · Age ' + p.age : '')) + '</span>'
    +           '<span style="color:var(--fg2)">2026 Season</span>'
    +           sssChip
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="pc-stats-row">'
    +       kpis.map(function (k) { return '<div class="pc-stat"><div class="pc-stat-val">' + k[1] + '</div><div class="pc-stat-lbl">' + k[0] + '</div></div>'; }).join('')
    +     '</div>'
    +   '</div>'
    +   '<div class="pc-body">'
    // Row 1: Quality of Contact (lazy from BBE shard) + Plate Discipline
    +     '<div class="pc-row pc-row-2col">'
    +       '<div class="chart-panel bbp-panel" data-bbe-target="bbp-' + (p.player_id || '0') + '">'
    +         '<div class="cp-title">Quality of Contact<span class="cp-src cp-src-mlb">Statcast</span></div>'
    +         battedBallProfileLoading()
    +       '</div>'
    +       '<div class="stat-section ' + (qualified ? '' : 'pc-sss') + '">'
    +         '<div class="cp-title">Plate Discipline<span class="cp-src cp-src-mlb">Stats API</span></div>'
    +         pdHtml
    +         '<div class="pd-legend">'
    +           '<span><span class="swatch" style="background:var(--green)"></span>Better than ' + escapeHtml(levelLabel) + ' avg</span>'
    +           '<span><span class="swatch" style="background:var(--red)"></span>Worse</span>'
    +           '<span><span class="swatch" style="background:rgba(45,36,24,.55)"></span>League avg</span>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    // Row 2: Percentiles vs league (moved up from old bottom slot)
    +     '<div class="pc-row">'
    +       '<div class="stat-section ' + (qualified ? '' : 'pc-sss') + '">'
    +         '<div class="cp-title">' + pctLbl + '<span class="cp-src cp-src-mlb">Stats API</span></div>'
    +         hitterVsTable(p, lg || {}, hitters, levelLabel, qualified)
    +       '</div>'
    +     '</div>'
    // Row 3: Batted-Ball distribution as text + percentages (lazy from BBE shard)
    +     '<div class="pc-row">'
    +       '<div class="chart-panel" data-bbdist-target="' + (p.player_id || '0') + '">'
    +         '<div class="cp-title">Batted-Ball Distribution<span class="cp-src cp-src-mlb">Statcast</span></div>'
    +         battedBallProfileLoading()
    +       '</div>'
    +     '</div>'
    +     '<div class="pc-footnote">Quality of Contact + batted-ball distribution from Statcast per-event hit_data. Percentile vs ' + escapeHtml(levelLabel) + ' hitters with qualified PA. Z-Contact% / O-Contact% derived from per-pitch plate location (proxy zone: |pX| ≤ 0.83 ft, 1.5 ≤ pZ ≤ 3.5 ft).</div>'
    +   '</div>'
    + '</div>';
}

// ═════════════════════════════════════════════════════════════════════════════
// PITCHER CARD (unchanged from prior rebuild — no BBE-against panel yet)
// ═════════════════════════════════════════════════════════════════════════════
// Enhanced vs-league table for the pitcher card — Player / Lg Avg / Diff /
// Percentile across the loaded level dataset. Replaces the old Stat Line panel.
function pitcherVsTable(p, lg, pitchers, levelLabel, qualified) {
  pitchers = pitchers || [];
  function pctRank(key, v, dir) {
    var vals = pitchers.map(function (r) { return r[key]; })
      .filter(function (x) { return x != null && !isNaN(x); });
    if (!vals.length || v == null || isNaN(v)) return null;
    var nBeaten = vals.filter(function (x) { return dir === 1 ? x <= v : x >= v; }).length;
    return Math.round(100 * nBeaten / vals.length);
  }
  var pct1 = function (v) { return fmtPct(v, 1); };
  var defs = [
    { lbl: 'ERA',     key: 'era',     dir: -1, fmt: fmt2 },
    { lbl: 'FIP',     key: 'fip',     dir: -1, fmt: fmt2 },
    { lbl: 'WHIP',    key: 'whip',    dir: -1, fmt: fmt2 },
    { lbl: 'K%',      key: 'k_pct',   dir:  1, fmt: pct1 },
    { lbl: 'BB%',     key: 'bb_pct',  dir: -1, fmt: pct1 },
    { lbl: 'K-BB%',   key: 'kbb_pct', dir:  1, fmt: pct1 },
    { lbl: 'HR/9',    key: 'hr9',     dir: -1, fmt: fmt2 },
    { lbl: 'xwOBA-A', key: 'xwoba_a', dir: -1, fmt: fmt3 }
  ];
  var body = defs.map(function (d) {
    var pv = p[d.key];
    var la = qualified ? lg[d.key] : null;
    var diffCell = '<td class="vt-diff">--</td>';
    if (pv != null && la != null && !isNaN(pv) && !isNaN(la)) {
      var diff = pv - la;
      var good = d.dir === 1 ? diff >= 0 : diff <= 0;
      var sign = diff >= 0 ? '+' : '\u2212';
      diffCell = '<td class="vt-diff ' + (good ? 'diff-good' : 'diff-bad') + '">'
        + sign + d.fmt(Math.abs(diff)) + '</td>';
    }
    var pr = pctRank(d.key, pv, d.dir);
    var pctCell = '<td class="vt-pct"><span class="vt-na">--</span></td>';
    if (pr != null) {
      var cls = pr >= 75 ? 'vt-hi' : pr <= 25 ? 'vt-lo' : 'vt-mid';
      pctCell = '<td class="vt-pct">'
        + '<span class="vt-pct-track"><span class="vt-pct-fill ' + cls + '" style="width:' + pr + '%"></span></span>'
        + '<span class="vt-pct-num">' + pr + '</span></td>';
    }
    return '<tr>'
      + '<td class="vt-metric">' + escapeHtml(d.lbl) + '</td>'
      + '<td class="vt-val">' + d.fmt(pv) + '</td>'
      + '<td class="vt-avg">' + (la != null ? d.fmt(la) : '--') + '</td>'
      + diffCell + pctCell
      + '</tr>';
  }).join('');
  var lvl = escapeHtml((levelLabel || '').toUpperCase() || 'Lg');
  return '<table class="vt-tbl"><thead><tr>'
    + '<th>Metric</th><th>Player</th><th>' + lvl + ' Avg</th><th>Diff</th><th>Percentile</th>'
    + '</tr></thead><tbody>' + body + '</tbody></table>';
}

function renderPitcher(p, lg, levelLabel, pitchers) {
  var qualified = lg && lg.qualified && (p.ip || 0) >= QUAL_IP;
  var levelLeague = (levelLabel || '').toUpperCase() + (p.league ? ' · ' + p.league : '');

  var kpis = [
    ['ERA',   fmt2(p.era)],
    ['FIP',   fmt2(p.fip)],
    ['K%',    fmtPct(p.k_pct, 1)],
    ['WHIP',  fmt2(p.whip)],
    ['K-BB%', fmtPct(p.kbb_pct, 1)]
  ];

  // Arsenal lazy-loads from data/milb/<level>/arsenal/<pid>.json — see
  // hydrateArsenal() in the open path. Inline the loading state here.
  var arsenalHtml = '<div class="ar-loading">Loading pitch arsenal…</div>';
  var hasArsenal = true;  // optimistic — empty state replaces if shard missing

  // Expanded "Command & Whiff Profile" — keep K%/BB%/Whiff%/Strike% and add
  // K-BB% (overall dominance), CSW% proxy (called-strikes via 1 - strike-on-
  // contact heuristic isn't available; we surface HR/9 instead since it
  // captures the worst-case command outcome), and BABIP against (luck signal).
  var profileHtml = [
    pdBar('K%',       p.k_pct,      qualified ? lg.k_pct       : null, 'k_pct_p',       qualified),
    pdBar('BB%',      p.bb_pct,     qualified ? lg.bb_pct      : null, 'bb_pct_p',      qualified),
    pdBar('K-BB%',    p.kbb_pct,    qualified ? lg.kbb_pct     : null, 'kbb_pct_p',     qualified),
    pdBar('Whiff%',   p.whiff_pct,  qualified ? lg.whiff_pct   : null, 'whiff_pct_p',   qualified),
    pdBar('Strike%',  p.strike_pct, qualified ? lg.strike_pct  : null, 'strike_pct_p',  qualified)
  ].join('');

  // Batted-ball percentile bars vs league (replaces Batted Ball Against gauges)
  // Same visual treatment as the Command & Whiff bars but for trajectory
  // outcomes (GB / FB / LD / HR/9). Lazy-loaded from the BBE shard since
  // pitcher BBE aggregation hasn't run yet — degrades to empty msg when missing.
  var bbProfileHtml = '<div class="ar-loading">Loading batted-ball profile…</div>';

  var sssChip = qualified ? '' : '<span class="pc-sss-chip" title="Below qualified IP threshold">Small Sample · IP &lt; ' + QUAL_IP + '</span>';
  var vsLbl = qualified
    ? 'Percentiles vs. ' + escapeHtml(levelLeague) + ' (IP ≥ ' + QUAL_IP + ')'
    : 'Percentiles vs. ' + escapeHtml(levelLeague) + ' — small sample (IP &lt; ' + QUAL_IP + ')';

  return ''
    + '<div class="pc-card">'
    +   '<button class="pc-close" onclick="MiLBCards.close()">&times;</button>'
    +   '<div class="pc-header">'
    +     '<div class="pc-header-top">'
    +       '<div class="pc-avatar">' + escapeHtml(avatarInitials(p.name)) + '</div>'
    +       '<div class="pc-info">'
    +         '<div class="pc-name">' + escapeHtml(p.name || '--') + '</div>'
    +         '<div class="pc-meta">'
    +           '<span class="pc-team-badge">' + escapeHtml(teamAbbrev(p)) + '</span>'
    +           '<span class="pc-level-pill">' + escapeHtml(levelLeague) + '</span>'
    +           '<span>' + escapeHtml((p.role || p.pos || '') + (p.age ? ' · Age ' + p.age : '')) + '</span>'
    +           '<span style="color:var(--fg2)">2026 Season</span>'
    +           sssChip
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="pc-stats-row">'
    +       kpis.map(function (k) { return '<div class="pc-stat"><div class="pc-stat-val">' + k[1] + '</div><div class="pc-stat-lbl">' + k[0] + '</div></div>'; }).join('')
    +     '</div>'
    +   '</div>'
    +   '<div class="pc-body">'
    // Row 1: Arsenal + Command & Whiff Profile (renamed Plate Discipline)
    +     '<div class="pc-row pc-row-2col">'
    +       '<div class="chart-panel" data-arsenal-target="' + (p.player_id || '0') + '">'
    +         '<div class="cp-title">Pitch Arsenal<span class="cp-src cp-src-mlb">Statcast</span></div>'
    +         arsenalHtml
    +       '</div>'
    +       '<div class="stat-section ' + (qualified ? '' : 'pc-sss') + '">'
    +         '<div class="cp-title">Command &amp; Whiff Profile<span class="cp-src cp-src-mlb">Stats API</span></div>'
    +         profileHtml
    +         '<div class="pd-legend">'
    +           '<span><span class="swatch" style="background:var(--green)"></span>Better than ' + escapeHtml(levelLabel) + ' avg</span>'
    +           '<span><span class="swatch" style="background:var(--red)"></span>Worse</span>'
    +           '<span><span class="swatch" style="background:rgba(45,36,24,.55)"></span>League avg</span>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    // Row 2: Pitch Movement (full width)
    +     '<div class="pc-row">'
    +       '<div class="chart-panel" data-movement-target="' + (p.player_id || '0') + '">'
    +         '<div class="cp-title">Pitch Movement<span class="cp-src cp-src-mlb">Statcast</span></div>'
    +         '<div class="mlb-movement-wrap"><div class="ar-loading">Loading pitch movement…</div></div>'
    +       '</div>'
    +     '</div>'
    // Row 3: Percentiles vs league (moved up from old bottom slot)
    +     '<div class="pc-row">'
    +       '<div class="stat-section ' + (qualified ? '' : 'pc-sss') + '">'
    +         '<div class="cp-title">' + vsLbl + '<span class="cp-src cp-src-mlb">Stats API</span></div>'
    +         pitcherVsTable(p, lg, pitchers, levelLabel, qualified)
    +       '</div>'
    +     '</div>'
    // Row 4: Batted-Ball Profile (GB/FB/LD/PU as percentile bars; lazy)
    +     '<div class="pc-row">'
    +       '<div class="stat-section ' + (qualified ? '' : 'pc-sss') + '" data-bbpit-target="' + (p.player_id || '0') + '">'
    +         '<div class="cp-title">Batted-Ball Profile<span class="cp-src cp-src-mlb">Statcast</span></div>'
    +         bbProfileHtml
    +       '</div>'
    +     '</div>'
    +     '<div class="pc-footnote">Stats API season + seasonAdvanced + Statcast pitchArsenal + per-event hit_data. League avgs computed from qualified pitchers in the loaded ' + escapeHtml(levelLabel) + ' dataset.</div>'
    +   '</div>'
    + '</div>';
}

// ═════════════════════════════════════════════════════════════════════════════
// LAZY BBE LOAD + RE-RENDER
// ═════════════════════════════════════════════════════════════════════════════
//
// After the synchronous render paints the card, fetch the BBE shard for the
// hitter and replace the Spray Chart + Batted Ball Profile panels in place.
// On miss / error / FSL-no-coverage, replace with empty-state.
function hydrateBBE(player, levelLabel, lg) {
  if (!player || !player.player_id) return;
  // Fetch the player's BBE shard AND the real per-level league-average file in
  // parallel so the Quality-of-Contact 'vs Avg' column shows accurate deltas.
  Promise.all([
    fetchBBE(levelLabel, player.player_id),
    fetchBbeLeagueAvg(levelLabel)
  ]).then(function (res) {
    var bbe = res[0], lgFile = res[1];
    var bbpEl    = document.querySelector('[data-bbe-target="bbp-' + player.player_id + '"]');
    var bbDistEl = document.querySelector('[data-bbdist-target="' + player.player_id + '"]');
    var src = (lgFile && lgFile.avg) || {};
    var lgAgg = {
      avg_ev: src.avg_ev, max_ev: src.max_ev,
      hard_hit_pct: src.hard_hit_pct, barrel_pct: src.barrel_pct,
      sweet_spot_pct: src.sweet_spot_pct, avg_la: src.avg_la,
      gb_pct: src.gb_pct, ld_pct: src.ld_pct, fb_pct: src.fb_pct, pu_pct: src.pu_pct,
      pull_pct: src.pull_pct, center_pct: src.center_pct, oppo_pct: src.oppo_pct,
      z_contact_pct: src.z_contact_pct, o_contact_pct: src.o_contact_pct,
      chase_pct: src.chase_pct
    };
    if (bbpEl) {
      var t = '<div class="cp-title">Quality of Contact<span class="cp-src cp-src-mlb">Statcast</span></div>';
      bbpEl.innerHTML = t + battedBallProfileFromBBE(bbe, lgAgg, player);
    }
    if (bbDistEl) {
      var t2 = '<div class="cp-title">Batted-Ball Distribution<span class="cp-src cp-src-mlb">Statcast</span></div>';
      bbDistEl.innerHTML = t2 + bbDistributionText(bbe, lgAgg);
    }
  });
}

// Lazy hydrator for the pitcher card's Batted-Ball Profile panel: reads the
// `bbe_against` block on the arsenal shard and renders GB/FB/LD/PU bars vs
// the league pitcher averages.
function renderPitcherBattedBallBars(bbe, lg) {
  if (!bbe || !bbe.n) {
    return '<div class="ar-empty" style="padding:14px">'
      + 'No batted-ball events tracked yet for this pitcher.<br>'
      + '<span class="ar-empty-sub">Coverage is full at AAA, partial at FSL.</span>'
      + '</div>';
  }
  function row(label, val, lgVal, dirGood) {
    // dirGood: +1 = higher is good (e.g. GB% for sinker-baller), -1 = lower
    var v = val == null || isNaN(val) ? 0 : val;
    var lv = lgVal == null || isNaN(lgVal) ? null : lgVal;
    var valTxt = val == null || isNaN(val) ? '--' : val.toFixed(1) + '%';
    var deltaTxt = '';
    if (val != null && lv != null) {
      var d = val - lv;
      var good = (dirGood === 1) ? d >= 0 : d <= 0;
      var sign = d >= 0 ? '+' : '−';
      var cls = good ? 'diff-good' : 'diff-bad';
      deltaTxt = ' <span class="bb-dist-delta ' + cls + '">' + sign + Math.abs(d).toFixed(1) + 'pp</span>';
    }
    var pct = Math.max(0, Math.min(100, v));
    return '<div class="bb-dist-row">'
      + '<div class="bb-dist-lbl">' + label + '</div>'
      + '<div class="bb-dist-bar"><div class="bb-dist-fill" style="width:' + pct + '%"></div></div>'
      + '<div class="bb-dist-val">' + valTxt + deltaTxt + '</div>'
      + '</div>';
  }
  // Pitcher direction convention: GB% high is good for groundballers, LD%
  // low is good for everyone, FB% / PU% are neutral relative to era/style —
  // we mark LD as -1 (lower better) and leave others neutral via -1/+1 your
  // call. Standard: LD allowed is the bad one to suppress.
  return '<div class="bb-dist-group">'
    +   row('Ground Ball', bbe.gb_pct, lg.gb_pct, 1)
    +   row('Line Drive',  bbe.ld_pct, lg.ld_pct, -1)
    +   row('Fly Ball',    bbe.fb_pct, lg.fb_pct, -1)
    +   row('Pop Up',      bbe.pu_pct, lg.pu_pct, 1)
    + '</div>'
    + '<div class="bb-dist-foot" style="font-family:JetBrains Mono,monospace;font-size:10px;color:#8a8278;margin-top:8px">'
    + 'n = ' + bbe.n + ' batted-ball events</div>';
}

// Hydrate pitcher pitch arsenal: fetch arsenal shard and re-render the panel.
function hydrateArsenal(player, levelLabel) {
  if (!player || !player.player_id) return;
  fetchArsenal(levelLabel, player.player_id).then(function (data) {
    var arsenalEl = document.querySelector('[data-arsenal-target="' + player.player_id + '"]');
    if (arsenalEl) {
      var titleHtml = '<div class="cp-title">Pitch Arsenal<span class="cp-src cp-src-mlb">Statcast</span></div>';
      var bodyHtml = (data && data.arsenal && data.arsenal.length)
        ? arsenalTable(data.arsenal)
        : arsenalTable(null);
      arsenalEl.innerHTML = titleHtml + bodyHtml;
    }
    var moveEl = document.querySelector('[data-movement-target="' + player.player_id + '"]');
    if (moveEl) {
      var mTitle = '<div class="cp-title">Pitch Movement<span class="cp-src cp-src-mlb">Statcast</span></div>';
      var hasMov = !!(data && data.arsenal && data.arsenal.some(function (a) { return a.n_mov > 0 && a.avg_hb_in != null; }));
      var mBody = hasMov
        ? renderMiLBMovement(data.arsenal, data.throws)
        : '<div class="ar-empty">Pitch-by-pitch movement unavailable for this player.<br>'
        + '<span class="ar-empty-sub">Statcast coverage is full at AAA, partial at FSL.</span></div>';
      moveEl.innerHTML = mTitle + '<div class="mlb-movement-wrap">' + mBody + '</div>';
    }
    // Batted-Ball Profile panel — uses bbe_against from the same shard plus
    // the league-average BBE file (which has gb_pct etc. computed across all
    // batters at the level; we treat that as a proxy for the league pitcher
    // average too since both sides observe the same trajectory mix).
    var bbPitEl = document.querySelector('[data-bbpit-target="' + player.player_id + '"]');
    if (bbPitEl) {
      fetchBbeLeagueAvg(levelLabel).then(function (lgFile) {
        var bbTitle = '<div class="cp-title">Batted-Ball Profile<span class="cp-src cp-src-mlb">Statcast</span></div>';
        var lg = (lgFile && lgFile.avg) || {};
        var bb = data && data.bbe_against;
        bbPitEl.innerHTML = bbTitle + renderPitcherBattedBallBars(bb, lg);
      });
    }
  });
}

// ── Pitch-type helpers (mirror explorer.js' helpers; vendored here to keep
//    milb-cards.js self-contained so the MiLB pages can load without
//    explorer.js — the MiLB pages don't bundle the MLB Stats Explorer JS).
var MILB_PITCH_COLORS = {
  FF: '#B91C1C', SI: '#DC2626', FT: '#DC2626', FC: '#92400E',
  SL: '#047857', ST: '#0D9488', SV: '#0D9488', CU: '#1D4ED8', KC: '#3730A3',
  CH: '#7C3AED', FS: '#D97706', FO: '#D97706', SC: '#7C3AED',
  KN: '#6B7280', EP: '#6B7280',
};
var MILB_PITCH_NAMES = {
  FF: 'Four-Seam',  SI: 'Sinker',   FT: 'Two-Seam', FC: 'Cutter',
  SL: 'Slider',     ST: 'Sweeper',  SV: 'Slurve',
  CU: 'Curveball',  KC: 'Knuckle-C',
  CH: 'Changeup',   FS: 'Splitter', FO: 'Forkball', SC: 'Screwball',
  KN: 'Knuckleball', EP: 'Eephus',
};
function milbPitchColor(code) { return MILB_PITCH_COLORS[code] || '#6B7280'; }
function milbPitchName(code)  { return MILB_PITCH_NAMES[code]  || (code || '—'); }

// Render movement plot from arsenal data. Now matches the MLB pitcher card:
// every pitch is a small translucent dot in its pitch-type color, with an
// outlined AVG marker for the cluster center. NO arm-axis line.
function renderMiLBMovement(arsenal, throws) {
  if (!arsenal || !arsenal.length) return '';
  var isRHP = (throws !== 'L');
  var handLabel = isRHP ? 'RHP' : 'LHP';
  var RANGE = 25;

  var px = function (v) { return 50 + (v + RANGE) / (2 * RANGE) * 300; };
  var py = function (v) { return 10 + (RANGE - v) / (2 * RANGE) * 250; };

  var svg = '<svg viewBox="0 0 400 300" style="width:100%;height:100%">';
  svg += '<rect x="50" y="10" width="300" height="250" fill="rgba(0,0,0,.02)" rx="4"/>';
  svg += '<line x1="' + px(0) + '" y1="10" x2="' + px(0) + '" y2="260" stroke="rgba(0,0,0,.1)" stroke-dasharray="4 3"/>';
  svg += '<line x1="50" y1="' + py(0) + '" x2="350" y2="' + py(0) + '" stroke="rgba(0,0,0,.1)" stroke-dasharray="4 3"/>';

  var armSide  = isRHP ? 'ARM SIDE →' : '← ARM SIDE';
  var gloveSide = isRHP ? '← GLOVE SIDE' : 'GLOVE SIDE →';
  svg += '<text x="200" y="285" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">'
       + gloveSide + '   HB (in.)   ' + armSide + '</text>';
  svg += '<text transform="rotate(-90)" x="-135" y="16" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">'
       + 'INDUCED VERT. BREAK (in.)</text>';
  svg += '<text x="345" y="24" text-anchor="end" fill="rgba(45,36,24,.35)" font-family="Barlow Condensed" font-size="11" font-weight="700" letter-spacing="2">'
       + handLabel + '</text>';

  var ticks = [-20, -10, 0, 10, 20];
  for (var ti = 0; ti < ticks.length; ti++) {
    var t = ticks[ti];
    svg += '<text x="' + px(t) + '" y="275" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">' + t + '</text>';
    if (t !== 0) svg += '<line x1="' + px(t) + '" y1="10" x2="' + px(t) + '" y2="260" stroke="rgba(0,0,0,.06)"/>';
    svg += '<text x="44" y="' + (py(t) + 3) + '" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">' + t + '</text>';
    if (t !== 0) svg += '<line x1="50" y1="' + py(t) + '" x2="350" y2="' + py(t) + '" stroke="rgba(0,0,0,.06)"/>';
  }

  // Filter to pitch types with movement samples
  var pitches = arsenal.filter(function (a) { return a.avg_hb_in != null && a.n_mov >= 3; });

  // Layer 1: per-pitch dots (oldest/least-used pitch types drawn first so most
  // common type's dots sit on top).
  var byUsageAsc = pitches.slice().sort(function (a, b) { return a.n - b.n; });
  for (var i = 0; i < byUsageAsc.length; i++) {
    var a = byUsageAsc[i];
    var color = milbPitchColor(a.code);
    var samples = a.mov_samples || [];
    for (var k = 0; k < samples.length; k++) {
      var s = samples[k];
      svg += '<circle cx="' + px(s[0]) + '" cy="' + py(s[1]) + '" r="2" fill="' + color + '" opacity=".2"/>';
    }
  }
  // Layer 2: AVG markers on top — solid outlined dot per pitch type
  for (var j = 0; j < byUsageAsc.length; j++) {
    var b = byUsageAsc[j];
    var c2 = milbPitchColor(b.code);
    var cx = px(b.avg_hb_in), cy = py(b.avg_ivb_in);
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="' + c2 + '" stroke="rgba(0,0,0,.55)" stroke-width="1.2"/>';
    svg += '<text x="' + (cx + 9) + '" y="' + (cy + 4) + '" fill="' + c2
         + '" font-family="Barlow Condensed" font-size="10" font-weight="700">'
         + escapeHtml(milbPitchName(b.code).substring(0, 3).toUpperCase()) + '</text>';
  }

  svg += '</svg>';

  var legend = '<div class="legend">';
  var byUsageDesc = pitches.slice().sort(function (a, b) { return b.n - a.n; });
  for (var li = 0; li < byUsageDesc.length; li++) {
    var l = byUsageDesc[li];
    legend += '<div class="legend-item"><span class="pitch-dot" style="background:'
            + milbPitchColor(l.code) + '"></span>' + escapeHtml(milbPitchName(l.code))
            + ' <span style="color:#a99e8e">(' + (l.n_mov || 0) + ')</span></div>';
  }
  legend += '<div class="legend-item" style="color:rgba(45,36,24,.4)">'
          + handLabel + ' · Pitcher\'s perspective · solid dot = AVG</div>';
  legend += '</div>';

  return svg + legend;
}

// ═════════════════════════════════════════════════════════════════════════════
// OPEN / CLOSE
// ═════════════════════════════════════════════════════════════════════════════
function ensureOverlay() {
  var ov = document.getElementById('pc-overlay');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'pc-overlay';
  ov.innerHTML = '<div id="pc-overlay-content"></div>';
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  return ov;
}

function open(player, mode, db, levelLabel) {
  if (!player) return;
  var ov = ensureOverlay();
  var content = document.getElementById('pc-overlay-content');
  if (!content) return;
  var lg, html;
  if (mode === 'pitchers') {
    lg = computePitcherLeagueAvgs((db && db.pitchers) || []);
    html = renderPitcher(player, lg, levelLabel || '', (db && db.pitchers) || []);
  } else {
    lg = computeHitterLeagueAvgs((db && db.hitters) || []);
    html = renderHitter(player, lg, levelLabel || '', (db && db.hitters) || []);
  }
  content.innerHTML = html;
  ov.classList.add('visible');
  document.body.style.overflow = 'hidden';
  // Hitter cards: lazy-load BBE shard + re-render the Spray Chart + BBP panels.
  // Pitcher cards: lazy-load arsenal shard (Stats API pitchArsenal endpoint
  // is deprecated; we extract per-pitch from live feeds in the BBE fetcher).
  if (mode === 'pitchers') hydrateArsenal(player, levelLabel);
  else hydrateBBE(player, levelLabel, lg);
}

function close() {
  var ov = document.getElementById('pc-overlay');
  if (!ov) return;
  ov.classList.remove('visible');
  document.body.style.overflow = '';
}

// expose
window.MiLBCards = {
  open: open,
  close: close,
  // exposed for testability
  _computeHitterLeagueAvgs: computeHitterLeagueAvgs,
  _computePitcherLeagueAvgs: computePitcherLeagueAvgs,
  _renderHitter: renderHitter,
  _renderPitcher: renderPitcher,
  _sprayChartSVG: sprayChartSVG,
  _battedBallProfileFromBBE: battedBallProfileFromBBE,
  _QUAL_PA: QUAL_PA,
  _QUAL_IP: QUAL_IP
};

})();
