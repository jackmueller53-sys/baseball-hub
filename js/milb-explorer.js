/* ═════════════════════════════════════════════════════════════════════════════
   BASEBALL HUB — MiLB STATS EXPLORER (per-level)
   ─────────────────────────────────────────────────────────────────────────────
   Mirrors the logic of the MLB explorer (js/explorer.js) — sidebar filters,
   SVG scatter with performance-adjusted quadrants, and a sortable leaderboard
   table — but sourced from MiLB JSON staged at ../data/milb/<level>/ .

   Page-level globals set by the per-level HTML before this file loads:
     window.MILB_LEVEL        = 'aaa' | 'aa' | 'aplus' | 'fsl'
     window.MILB_HAS_STATCAST = true  | false
     window.MILB_LEVEL_LABEL  = 'AAA' | 'AA' | 'A+' | 'FSL'  (optional display)

   Required DOM IDs (mirrors MLB explorer): x-sel, y-sel, x-desc, y-desc,
   x-src-tag, y-src-tag, srch, tm-sel, age-mn, age-mx, age-disp, min-v, min-lbl,
   role-sel, role-row, p-cnt, c-title, c-sub, c-src-row, svg-plot, t-head,
   t-body, tbl-note, tbl-mode, meta-txt, tog-n, tog-n2, tog-q, tog-q2, legend,
   dot-tip + children.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

// ── PAGE CONFIG ──────────────────────────────────────────────────────────────
var LEVEL           = window.MILB_LEVEL         || 'aaa';
var HAS_STATCAST    = !!window.MILB_HAS_STATCAST;
var LEVEL_LABEL     = window.MILB_LEVEL_LABEL   || LEVEL.toUpperCase();

// ── STATE ────────────────────────────────────────────────────────────────────
var MODE   = 'hitters';
var NAMES  = false;
var QUADS  = true;
var SCOL   = null;  // sort column index (default: last column = Y vs avg desc)
var SDIR   = 1;
var DB     = { hitters: [], pitchers: [] };

// ── HELPERS ──────────────────────────────────────────────────────────────────
var mean = function (a) { return a.length ? a.reduce(function (s, v) { return s + v; }, 0) / a.length : 0; };
var fv   = function (v) { return v == null || isNaN(v) ? '--' : Math.abs(v) < 1 ? v.toFixed(3) : Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(1); };
var nf   = function (v) { var f = parseFloat(v); return isNaN(f) ? null : f; };
var pct  = function (v) {
  if (v == null || v === '') return null;
  var s = String(v).replace('%', '').trim();
  var f = parseFloat(s);
  if (isNaN(f)) return null;
  return Math.abs(f) <= 1 ? f * 100 : f;
};
var stripHTML = function (s) { return String(s || '').replace(/<[^>]*>/g, '').trim(); };

// Normalize player names: strip accents, suffixes (jr/sr/ii/iii/iv/v), lowercase, letters+spaces only.
function normName(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/g, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function savantNameToNorm(s) {
  // Savant uses "Last, First" → flip to "First Last" before normalizing
  var t = String(s || '');
  if (t.indexOf(',') > -1) {
    var parts = t.split(',');
    t = (parts[1] || '').trim() + ' ' + (parts[0] || '').trim();
  }
  return normName(t);
}
function buildIdx(rows, keyFn) {
  var idx = {};
  rows.forEach(function (r) {
    var k = keyFn(r);
    if (!k) return;
    var prev = idx[k];
    if (!prev) { idx[k] = r; return; }
    // On collision, keep the row with more non-null fields
    var countNN = function (o) { var c = 0; for (var k2 in o) if (o[k2] != null && o[k2] !== '') c++; return c; };
    if (countNN(r) > countNN(prev)) idx[k] = r;
  });
  return idx;
}
function fuzzyLookup(k, idx) {
  if (!k) return null;
  if (idx[k]) return idx[k];
  // Last-name-only fallback (single match)
  var last = k.split(' ').slice(-1)[0];
  if (!last) return null;
  var hits = Object.keys(idx).filter(function (n) { return n.split(' ').slice(-1)[0] === last; });
  return hits.length === 1 ? idx[hits[0]] : null;
}

// ── AXIS DEFS ────────────────────────────────────────────────────────────────
// dir: 1 = higher is better; -1 = lower is better
// src: 'fg' | 'sv'
var H_AXES_ALL = [
  { k: 'wrc_plus', lbl: 'wRC+',     src: 'fg', d: 'Weighted Runs Created+ — 100 is league average',                 dir: 1  },
  { k: 'woba',     lbl: 'wOBA',     src: 'fg', d: 'Weighted On-Base Average — offensive value per PA',              dir: 1  },
  { k: 'avg',      lbl: 'AVG',      src: 'fg', d: 'Batting Average',                                                 dir: 1  },
  { k: 'obp',      lbl: 'OBP',      src: 'fg', d: 'On-Base Percentage',                                              dir: 1  },
  { k: 'slg',      lbl: 'SLG',      src: 'fg', d: 'Slugging Percentage',                                             dir: 1  },
  { k: 'ops',      lbl: 'OPS',      src: 'fg', d: 'OBP + SLG',                                                       dir: 1  },
  { k: 'iso',      lbl: 'ISO',      src: 'fg', d: 'Isolated Power — SLG minus AVG',                                  dir: 1  },
  { k: 'hr',       lbl: 'HR',       src: 'fg', d: 'Home Runs',                                                       dir: 1  },
  { k: 'sb',       lbl: 'SB',       src: 'fg', d: 'Stolen Bases',                                                    dir: 1  },
  { k: 'bb_pct',   lbl: 'BB%',      src: 'fg', d: 'Walks as % of PA',                                                dir: 1  },
  { k: 'k_pct',    lbl: 'K%',       src: 'fg', d: 'Strikeouts as % of PA (lower = better)',                          dir: -1 },
  { k: 'babip',    lbl: 'BABIP',    src: 'fg', d: 'Batting Avg on Balls in Play',                                    dir: 1  },
  { k: 'xwoba',    lbl: 'xwOBA',    src: 'sv', d: 'Expected wOBA based on quality of contact',                       dir: 1  },
  { k: 'xba',      lbl: 'xBA',      src: 'sv', d: 'Expected Batting Average',                                        dir: 1  },
  { k: 'xslg',     lbl: 'xSLG',     src: 'sv', d: 'Expected Slugging',                                               dir: 1  },
  { k: 'brl_pct',  lbl: 'Barrel%',  src: 'sv', d: 'Barrel% — elite contact events per PA',                           dir: 1  },
  { k: 'ev',       lbl: 'Avg EV',   src: 'sv', d: 'Average Exit Velocity (mph)',                                     dir: 1  },
  { k: 'hard_hit', lbl: 'HardHit%', src: 'sv', d: 'Hard Hit% — batted balls ≥ 95 mph',                               dir: 1  }
];

var P_AXES_ALL = [
  { k: 'era',     lbl: 'ERA',     src: 'fg', d: 'Earned Run Average (lower = better)',                    dir: -1 },
  { k: 'fip',     lbl: 'FIP',     src: 'fg', d: 'Fielding Independent Pitching',                          dir: -1 },
  { k: 'xfip',    lbl: 'xFIP',    src: 'fg', d: 'Expected FIP — HR/FB regressed to league average',       dir: -1 },
  { k: 'whip',    lbl: 'WHIP',    src: 'fg', d: 'Walks + Hits per IP',                                    dir: -1 },
  { k: 'k9',      lbl: 'K/9',     src: 'fg', d: 'Strikeouts per 9 innings',                               dir: 1  },
  { k: 'bb9',     lbl: 'BB/9',    src: 'fg', d: 'Walks per 9 innings (lower = better)',                   dir: -1 },
  { k: 'k_pct',   lbl: 'K%',      src: 'fg', d: 'Strikeouts as % of batters faced',                       dir: 1  },
  { k: 'bb_pct',  lbl: 'BB%',     src: 'fg', d: 'Walks as % of batters faced (lower = better)',           dir: -1 },
  { k: 'kbb_pct', lbl: 'K-BB%',   src: 'fg', d: 'Strikeout rate minus walk rate',                         dir: 1  },
  { k: 'hr9',     lbl: 'HR/9',    src: 'fg', d: 'Home Runs per 9 (lower = better)',                       dir: -1 },
  { k: 'xera',    lbl: 'xERA',    src: 'sv', d: 'Expected ERA — contact-quality based',                    dir: -1 },
  { k: 'xwoba_a', lbl: 'xwOBA Against', src: 'sv', d: 'Expected wOBA allowed on contact',                 dir: -1 },
  { k: 'xba_a',   lbl: 'xBA Against',   src: 'sv', d: 'Expected BA allowed on contact',                   dir: -1 },
  { k: 'xslg_a',  lbl: 'xSLG Against',  src: 'sv', d: 'Expected SLG allowed on contact',                  dir: -1 },
  { k: 'brl_pct', lbl: 'Barrel% Against', src: 'sv', d: 'Barrel% allowed — lower is better',              dir: -1 },
  { k: 'ev',      lbl: 'Avg EV Against', src: 'sv', d: 'Average exit velocity against',                   dir: -1 },
  { k: 'hard_hit', lbl: 'HardHit% Against', src: 'sv', d: 'Hard hits allowed ≥ 95 mph',                   dir: -1 }
];

var H_TIP = [
  { k: 'avg',      lbl: 'AVG',     f: function (v) { return v == null ? '--' : v.toFixed(3); } },
  { k: 'obp',      lbl: 'OBP',     f: function (v) { return v == null ? '--' : v.toFixed(3); } },
  { k: 'slg',      lbl: 'SLG',     f: function (v) { return v == null ? '--' : v.toFixed(3); } },
  { k: 'hr',       lbl: 'HR',      f: function (v) { return v == null ? '--' : Math.round(v); } },
  { k: 'wrc_plus', lbl: 'wRC+',    f: function (v) { return v == null ? '--' : Math.round(v); } },
  { k: 'bb_pct',   lbl: 'BB%',     f: function (v) { return v == null ? '--' : v.toFixed(1) + '%'; } },
  { k: 'k_pct',    lbl: 'K%',      f: function (v) { return v == null ? '--' : v.toFixed(1) + '%'; } }
];
var P_TIP = [
  { k: 'era',    lbl: 'ERA',  f: function (v) { return v == null ? '--' : v.toFixed(2); } },
  { k: 'fip',    lbl: 'FIP',  f: function (v) { return v == null ? '--' : v.toFixed(2); } },
  { k: 'whip',   lbl: 'WHIP', f: function (v) { return v == null ? '--' : v.toFixed(2); } },
  { k: 'k9',     lbl: 'K/9',  f: function (v) { return v == null ? '--' : v.toFixed(1); } },
  { k: 'bb9',    lbl: 'BB/9', f: function (v) { return v == null ? '--' : v.toFixed(1); } },
  { k: 'k_pct',  lbl: 'K%',   f: function (v) { return v == null ? '--' : v.toFixed(1) + '%'; } }
];

function axes()    { var A = MODE === 'hitters' ? H_AXES_ALL : P_AXES_ALL; return HAS_STATCAST ? A : A.filter(function (a) { return a.src !== 'sv'; }); }
function tip()     { return MODE === 'hitters' ? H_TIP : P_TIP; }
function dat()     { return DB[MODE] || []; }
function xk()      { return document.getElementById('x-sel').value; }
function yk()      { return document.getElementById('y-sel').value; }

function qcol(px, py) {
  if (px >= 0 && py >= 0) return '#047857'; // elite
  if (px < 0  && py >= 0) return '#1D4ED8'; // strong Y only
  if (px >= 0 && py < 0)  return '#C2410C'; // strong X only
  return '#B91C1C';                          // below avg both
}
function srcTag(s) {
  return s === 'fg'
    ? '<span class="src-tag tag-fg">FanGraphs</span>'
    : '<span class="src-tag tag-sv">Savant</span>';
}

// ── ADAPTERS (MiLB JSON → unified player row) ────────────────────────────────
function mapHitter(fg, sv) {
  var teamRaw = fg['Team'] || fg['team'] || '';
  var team = (teamRaw === '- - -' || teamRaw === '---') ? (sv ? sv['team_name_abbrev'] || '' : '') : teamRaw;
  var avg  = nf(fg['AVG'] || fg['avg']);
  var obp  = nf(fg['OBP'] || fg['obp']);
  var slg  = nf(fg['SLG'] || fg['slg']);
  return {
    name:     stripHTML(fg['PlayerName'] || fg['Name'] || ''),
    team:     team,
    age:      nf(fg['Age'] || fg['age']),
    pos:      fg['pos'] || fg['Position'] || '',
    ab:       nf(fg['AB']  || fg['ab']),
    pa:       nf(fg['PA']  || fg['pa']),
    avg:      avg,
    obp:      obp,
    slg:      slg,
    ops:      (obp != null && slg != null) ? +(obp + slg).toFixed(3) : nf(fg['OPS']),
    hr:       nf(fg['HR']  || fg['hr']),
    sb:       nf(fg['SB']  || fg['sb']),
    wrc_plus: nf(fg['wRC+'] || fg['wRCPlus'] || fg['wrc_plus']),
    woba:     nf(fg['wOBA'] || fg['woba']),
    iso:      nf(fg['ISO'] || fg['iso']) != null ? nf(fg['ISO'] || fg['iso']) : ((avg != null && slg != null) ? +(slg - avg).toFixed(3) : null),
    babip:    nf(fg['BABIP'] || fg['babip']),
    k_pct:    pct(fg['K%']  || fg['SO%']),
    bb_pct:   pct(fg['BB%']),
    // Savant (AAA/FSL only)
    xwoba:    sv ? nf(sv['est_woba'] || sv['xwoba'])   : null,
    xba:      sv ? nf(sv['est_ba']   || sv['xba'])     : null,
    xslg:     sv ? nf(sv['est_slg']  || sv['xslg'])    : null,
    brl_pct:  sv ? nf(sv['brl_percent'] || sv['barrel_batted_rate']) : null,
    ev:       sv ? nf(sv['avg_best_speed'] || sv['avg_hit_speed'] || sv['exit_velocity_avg']) : null,
    hard_hit: sv ? nf(sv['hard_hit_percent'] || sv['hard_hit']) : null
  };
}

function mapPitcher(fg, sv) {
  var g  = nf(fg['G']  || fg['g'])  || 1;
  var gs = nf(fg['GS'] || fg['gs']) || 0;
  var teamRaw = fg['Team'] || fg['team'] || '';
  var team = (teamRaw === '- - -' || teamRaw === '---' || teamRaw === 'TOT') ? (sv ? sv['team_name_abbrev'] || '' : '') : teamRaw;
  return {
    name:    stripHTML(fg['PlayerName'] || fg['Name'] || fg['player_name'] || ''),
    team:    team,
    age:     nf(fg['Age'] || fg['age']),
    role:    (gs / g) >= 0.5 ? 'SP' : 'RP',
    g:       nf(fg['G']  || fg['g']),
    gs:      nf(fg['GS'] || fg['gs']),
    ip:      nf(fg['IP'] || fg['ip']),
    era:     nf(fg['ERA'] || fg['era']),
    fip:     nf(fg['FIP'] || fg['fip']),
    xfip:    nf(fg['xFIP'] || fg['xfip']),
    whip:    nf(fg['WHIP'] || fg['whip']),
    k9:      nf(fg['K/9']  || fg['SO9'] || fg['k9']),
    bb9:     nf(fg['BB/9'] || fg['bb9']),
    hr9:     nf(fg['HR/9'] || fg['hr9']),
    k_pct:   pct(fg['K%']  || fg['SO%']),
    bb_pct:  pct(fg['BB%']),
    kbb_pct: pct(fg['K-BB%'] || fg['K-BB'] || fg['kbb_pct']),
    // Savant allowed-side (AAA/FSL only, pitcher expected stats CSV)
    xera:    sv ? nf(sv['xera'] || sv['est_era']) : null,
    xwoba_a: sv ? nf(sv['est_woba']) : null,
    xba_a:   sv ? nf(sv['est_ba'])   : null,
    xslg_a:  sv ? nf(sv['est_slg'])  : null,
    brl_pct: sv ? nf(sv['brl_percent'] || sv['barrel_batted_rate']) : null,
    ev:      sv ? nf(sv['avg_best_speed'] || sv['avg_hit_speed'] || sv['exit_velocity_avg']) : null,
    hard_hit: sv ? nf(sv['hard_hit_percent'] || sv['hard_hit']) : null
  };
}

// ── MERGE (FG + Savant) ──────────────────────────────────────────────────────
function mergeHitters(fgRows, svRows, minAB) {
  var svIdx = buildIdx(svRows, function (r) { return savantNameToNorm(r['last_name, first_name'] || r['player_name'] || ''); });
  var matched = 0;
  var out = fgRows
    .filter(function (r) { return nf(r['AB'] || r['ab'] || r['PA'] || r['pa'] || 0) >= minAB; })
    .map(function (r) {
      var k  = normName(stripHTML(r['PlayerName'] || r['Name'] || ''));
      var sv = HAS_STATCAST ? fuzzyLookup(k, svIdx) : null;
      if (sv) matched++;
      return mapHitter(r, sv);
    })
    .filter(function (r) { return r.name; });
  console.log('[milb-merge] ' + LEVEL + ' hitters: ' + out.length + ' rows, ' + matched + '/' + fgRows.length + ' Savant-matched');
  return out;
}
function mergePitchers(fgRows, svRows, minIP) {
  var svIdx = buildIdx(svRows, function (r) { return savantNameToNorm(r['last_name, first_name'] || r['player_name'] || ''); });
  var matched = 0;
  var out = fgRows
    .filter(function (r) { return nf(r['IP'] || r['ip'] || 0) >= minIP; })
    .map(function (r) {
      var k  = normName(stripHTML(r['PlayerName'] || r['Name'] || ''));
      var sv = HAS_STATCAST ? fuzzyLookup(k, svIdx) : null;
      if (sv) matched++;
      return mapPitcher(r, sv);
    })
    .filter(function (r) { return r.name; });
  console.log('[milb-merge] ' + LEVEL + ' pitchers: ' + out.length + ' rows, ' + matched + '/' + fgRows.length + ' Savant-matched');
  return out;
}

// ── UI BUILDERS ──────────────────────────────────────────────────────────────
function buildAxes() {
  var ax = axes();
  ['x-sel', 'y-sel'].forEach(function (id, i) {
    var s = document.getElementById(id);
    s.innerHTML = ax.map(function (a) { return '<option value="' + a.k + '">' + a.lbl + '</option>'; }).join('');
    s.selectedIndex = i === 0 ? 0 : Math.min(3, ax.length - 1);
  });
  updDesc();
}
function updDesc() {
  var ax = axes(), x = ax.find(function (a) { return a.k === xk(); }), y = ax.find(function (a) { return a.k === yk(); });
  document.getElementById('x-src-tag').innerHTML = x ? srcTag(x.src) : '';
  document.getElementById('y-src-tag').innerHTML = y ? srcTag(y.src) : '';
  document.getElementById('x-desc').textContent  = (x || {}).d || '';
  document.getElementById('y-desc').textContent  = (y || {}).d || '';
}
function updAge() {
  document.getElementById('age-disp').textContent =
    document.getElementById('age-mn').value + '\u2013' + document.getElementById('age-mx').value;
}

function rebuildTeamDropdown() {
  var sel = document.getElementById('tm-sel'); if (!sel) return;
  var tms = {};
  dat().forEach(function (p) { if (p.team) tms[p.team] = 1; });
  var list = ['All Teams'].concat(Object.keys(tms).sort());
  sel.innerHTML = list.map(function (t) { return '<option>' + t + '</option>'; }).join('');
}

function setMode(mode) {
  MODE = mode;
  document.getElementById('ptab-hit').classList.toggle('active', mode === 'hitters');
  document.getElementById('ptab-pit').classList.toggle('active', mode === 'pitchers');
  document.getElementById('min-lbl').textContent = mode === 'hitters' ? 'Min AB' : 'Min IP';
  document.getElementById('min-v').value = mode === 'hitters' ? 30 : 10;
  document.getElementById('role-row').style.display = mode === 'pitchers' ? '' : 'none';
  var tm = document.getElementById('tbl-mode'); if (tm) tm.textContent = '— ' + (mode === 'hitters' ? 'Hitters' : 'Pitchers');
  SCOL = null; SDIR = 1;
  buildAxes();
  rebuildTeamDropdown();
  render();
}

// ── FILTER ───────────────────────────────────────────────────────────────────
function filt() {
  var d = dat(); if (!d || !d.length) return [];
  var tm   = document.getElementById('tm-sel').value;
  var amn  = +document.getElementById('age-mn').value;
  var amx  = +document.getElementById('age-mx').value;
  var mv   = +document.getElementById('min-v').value;
  var role = document.getElementById('role-sel').value;
  var q    = (document.getElementById('srch').value || '').toLowerCase().trim();
  return d.filter(function (p) {
    if (tm !== 'All Teams' && p.team !== tm) return false;
    if (p.age && (p.age < amn || p.age > amx)) return false;
    if (MODE === 'hitters'  && (p.ab || p.pa || 0) < mv) return false;
    if (MODE === 'pitchers' && (p.ip || 0) < mv) return false;
    if (MODE === 'pitchers' && role !== 'all' && p.role !== role) return false;
    if (q && !(p.name || '').toLowerCase().includes(q) && !(p.team || '').toLowerCase().includes(q)) return false;
    return true;
  });
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  updDesc();
  var f = filt(), xKey = xk(), yKey = yk();
  var ax = axes(), xa = ax.find(function (a) { return a.k === xKey; }), ya = ax.find(function (a) { return a.k === yKey; });
  var xl = xa ? xa.lbl : xKey, yl = ya ? ya.lbl : yKey;
  document.getElementById('p-cnt').textContent = f.length;
  document.getElementById('c-title').innerHTML = xl + ' <em>vs</em> ' + yl;
  document.getElementById('c-src-row').innerHTML = (xa ? srcTag(xa.src) : '') + ' ' + (ya ? srcTag(ya.src) : '');
  var xvs = f.map(function (p) { return p[xKey]; }).filter(function (v) { return v != null && !isNaN(v); });
  var yvs = f.map(function (p) { return p[yKey]; }).filter(function (v) { return v != null && !isNaN(v); });
  var xA = mean(xvs), yA = mean(yvs);
  document.getElementById('c-sub').innerHTML =
    'Origin = filtered average &nbsp;&middot;&nbsp; ' + xl + ' avg: <b>' + fv(xA) + '</b>' +
    ' &nbsp;&middot;&nbsp; ' + yl + ' avg: <b>' + fv(yA) + '</b>' +
    ' &nbsp;&middot;&nbsp; <span style="color:var(--fg2)">' + f.length + '/' + dat().length + ' players</span>';
  var mt = document.getElementById('meta-txt'); if (mt) mt.textContent = f.length + ' of ' + dat().length + ' players';
  var xDir = xa ? (xa.dir || 1) : 1;
  var yDir = ya ? (ya.dir || 1) : 1;
  var cd = f.map(function (p) {
    var dx = p[xKey] != null ? p[xKey] - xA : null;
    var dy = p[yKey] != null ? p[yKey] - yA : null;
    return Object.assign({}, p, {
      rawX: p[xKey], rawY: p[yKey],
      cx: dx, cy: dy,
      px: dx != null ? dx * xDir : null,
      py: dy != null ? dy * yDir : null,
      xDir: xDir, yDir: yDir
    });
  });
  drawScatter(cd, xl, yl, xDir, yDir);
  drawLegend(xl, yl);
  drawTable(cd, xl, yl);
}

// ── SCATTER ──────────────────────────────────────────────────────────────────
function drawScatter(data, xl, yl, xDir, yDir) {
  var svg = document.getElementById('svg-plot');
  var W = 900, H = 470, PAD = { t: 26, r: 22, b: 50, l: 54 };
  var IW = W - PAD.l - PAD.r, IH = H - PAD.t - PAD.b;
  var vld = data.filter(function (d) { return d.cx != null && d.cy != null; });
  if (!vld.length) {
    svg.innerHTML = '<text x="' + (W / 2) + '" y="' + (H / 2) + '" text-anchor="middle" fill="#6b88aa" '
      + 'font-family="Barlow Condensed" font-size="14" letter-spacing="2">NO DATA</text>';
    return;
  }
  var pxs = vld.map(function (d) { return d.px; }), pys = vld.map(function (d) { return d.py; });
  var xPad = (Math.max.apply(null, pxs) - Math.min.apply(null, pxs)) * 0.1 || 1;
  var yPad = (Math.max.apply(null, pys) - Math.min.apply(null, pys)) * 0.12 || 1;
  var xD = [Math.min.apply(null, pxs) - xPad, Math.max.apply(null, pxs) + xPad];
  var yD = [Math.min.apply(null, pys) - yPad, Math.max.apply(null, pys) + yPad];
  var sx = function (v) { return PAD.l + (v - xD[0]) / (xD[1] - xD[0]) * IW; };
  var sy = function (v) { return PAD.t + (1 - (v - yD[0]) / (yD[1] - yD[0])) * IH; };
  var x0 = sx(0), y0 = sy(0);
  var tks = function (lo, hi, n) {
    var r = hi - lo, s = Math.pow(10, Math.floor(Math.log10(r / n)));
    var b = s; [1, 2, 5, 10].forEach(function (m) { var c = m * s; if (Math.abs(r / c - n) < Math.abs(r / b - n)) b = c; });
    var st = Math.ceil(lo / b) * b, t = [];
    for (var v = st; v <= hi + 1e-9; v += b) t.push(parseFloat(v.toFixed(8)));
    return t;
  };
  var h = '<defs><clipPath id="cp"><rect x="' + PAD.l + '" y="' + PAD.t + '" width="' + IW + '" height="' + IH + '"/></clipPath></defs>';
  tks(xD[0], xD[1], 8).forEach(function (v) {
    var px = sx(v);
    h += '<line x1="' + px + '" y1="' + PAD.t + '" x2="' + px + '" y2="' + (PAD.t + IH) + '" stroke="rgba(45,36,24,.04)" stroke-width="1"/>';
    if (Math.abs(v) < 1e-9) return;
    var rawV = v / (xDir || 1);
    h += '<text x="' + px + '" y="' + (PAD.t + IH + 16) + '" text-anchor="middle" class="tick">' + fv(rawV) + '</text>';
  });
  tks(yD[0], yD[1], 7).forEach(function (v) {
    var py = sy(v);
    h += '<line x1="' + PAD.l + '" y1="' + py + '" x2="' + (PAD.l + IW) + '" y2="' + py + '" stroke="rgba(45,36,24,.04)" stroke-width="1"/>';
    if (Math.abs(v) < 1e-9) return;
    var rawV = v / (yDir || 1);
    h += '<text x="' + (PAD.l - 6) + '" y="' + (py + 4) + '" text-anchor="end" class="tick">' + fv(rawV) + '</text>';
  });
  var rightTop = [x0, PAD.t, PAD.l + IW - x0, y0 - PAD.t];
  var leftTop  = [PAD.l, PAD.t, x0 - PAD.l, y0 - PAD.t];
  var rightBot = [x0, y0, PAD.l + IW - x0, PAD.t + IH - y0];
  var leftBot  = [PAD.l, y0, x0 - PAD.l, PAD.t + IH - y0];
  [
    { rect: rightTop, fill: 'rgba(45,206,137,.06)' },
    { rect: leftTop,  fill: 'rgba(76,170,245,.05)' },
    { rect: rightBot, fill: 'rgba(240,140,58,.05)' },
    { rect: leftBot,  fill: 'rgba(224,62,82,.05)'  }
  ].forEach(function (q) {
    var qx = q.rect[0], qy = q.rect[1], qw = q.rect[2], qh = q.rect[3];
    if (qw > 0 && qh > 0) h += '<rect x="' + qx + '" y="' + qy + '" width="' + qw + '" height="' + qh + '" fill="' + q.fill + '" clip-path="url(#cp)"/>';
  });
  h += '<line x1="' + x0 + '" y1="' + PAD.t + '" x2="' + x0 + '" y2="' + (PAD.t + IH) + '" stroke="rgba(76,170,245,.3)" stroke-width="1.5" stroke-dasharray="5 4" clip-path="url(#cp)"/>';
  h += '<line x1="' + PAD.l + '" y1="' + y0 + '" x2="' + (PAD.l + IW) + '" y2="' + y0 + '" stroke="rgba(76,170,245,.3)" stroke-width="1.5" stroke-dasharray="5 4" clip-path="url(#cp)"/>';
  h += '<text x="' + (PAD.l + IW / 2) + '" y="' + (H - 3) + '" text-anchor="middle" class="ax-lbl">\u2190 WORSE   ' + xl.toUpperCase() + ' VS AVG   BETTER \u2192</text>';
  h += '<text transform="rotate(-90)" x="' + (-(PAD.t + IH / 2)) + '" y="14" text-anchor="middle" class="ax-lbl">\u2193 WORSE   ' + yl.toUpperCase() + ' VS AVG   BETTER \u2191</text>';
  if (QUADS) {
    [
      ['end',   PAD.l + IW - 5, PAD.t + 12,       '#047857', 'ELITE'],
      ['start', PAD.l + 5,      PAD.t + 12,       '#1D4ED8', 'STRONG ' + yl.toUpperCase()],
      ['end',   PAD.l + IW - 5, PAD.t + IH - 5,   '#C2410C', 'STRONG ' + xl.toUpperCase()],
      ['start', PAD.l + 5,      PAD.t + IH - 5,   '#B91C1C', 'BELOW AVG']
    ].forEach(function (r) {
      h += '<text x="' + r[1] + '" y="' + r[2] + '" text-anchor="' + r[0] + '" class="qlbl" fill="' + r[3] + '">' + r[4] + '</text>';
    });
  }
  if (NAMES) vld.forEach(function (d) {
    var plotX = sx(d.px), plotY = sy(d.py), col = qcol(d.px, d.py);
    h += '<text x="' + plotX + '" y="' + (plotY - 8) + '" text-anchor="middle" class="namelbl" fill="' + col + '" opacity="0.8">' + (d.name || '').split(' ').slice(-1)[0] + '</text>';
  });
  var r = vld.length > 150 ? 4 : vld.length > 80 ? 5 : 6;
  vld.forEach(function (d, i) {
    var plotX = sx(d.px).toFixed(1), plotY = sy(d.py).toFixed(1), col = qcol(d.px, d.py);
    h += '<circle cx="' + plotX + '" cy="' + plotY + '" r="' + r + '" fill="' + col + '" fill-opacity=".82"'
      + ' stroke="' + col + '" stroke-width="1" stroke-opacity=".35"'
      + ' style="cursor:pointer;transition:r .1s,fill-opacity .1s"'
      + ' onmouseenter="MiLBExplorer.showTip(event,' + i + ')" onmouseleave="MiLBExplorer.hideTip()"'
      + ' onmouseover="this.setAttribute(\'r\',\'' + (r + 2) + '\');this.style.fillOpacity=\'1\'"'
      + ' onmouseout="this.setAttribute(\'r\',\'' + r + '\');this.style.fillOpacity=\'.82\'"/>';
  });
  svg.innerHTML = h; svg._vld = vld; svg._xl = xl; svg._yl = yl;
}

// ── TOOLTIP ──────────────────────────────────────────────────────────────────
function showTip(e, i) {
  var svg = document.getElementById('svg-plot'), d = svg._vld[i]; if (!d) return;
  document.getElementById('dt-name').textContent = d.name || '--';
  document.getElementById('dt-team').textContent = d.team || '--';
  document.getElementById('dt-pos').textContent  = ' ' + (d.pos || d.role || '') + '\u00b7Age ' + (d.age || '--');
  document.getElementById('dt-stats').innerHTML  = tip().map(function (s) {
    return '<div class="dt-stat"><div class="dt-sv">' + s.f(d[s.k]) + '</div><div class="dt-sk">' + s.lbl + '</div></div>';
  }).join('');
  var xl = svg._xl, yl = svg._yl;
  var xDevCls = (d.px >= 0) ? 'dev-pos' : 'dev-neg';
  var yDevCls = (d.py >= 0) ? 'dev-pos' : 'dev-neg';
  document.getElementById('dt-ax').innerHTML =
    '<div><div class="dt-ax-lbl">' + xl + '</div><div class="dt-ax-val">' + fv(d.rawX) + '</div>' +
    '<div class="dt-ax-dev ' + xDevCls + '">' + (d.cx >= 0 ? '+' : '') + fv(d.cx) + ' vs avg</div></div>' +
    '<div><div class="dt-ax-lbl">' + yl + '</div><div class="dt-ax-val">' + fv(d.rawY) + '</div>' +
    '<div class="dt-ax-dev ' + yDevCls + '">' + (d.cy >= 0 ? '+' : '') + fv(d.cy) + ' vs avg</div></div>';
  var t = document.getElementById('dot-tip'); t.style.display = 'block'; moveTip(e);
}
function moveTip(e) {
  var t = document.getElementById('dot-tip'), tw = t.offsetWidth || 220, th = t.offsetHeight || 150;
  var l = e.clientX + 16, tp = e.clientY - th / 2;
  if (l + tw > window.innerWidth - 8) l = e.clientX - tw - 16;
  if (tp < 8) tp = 8;
  if (tp + th > window.innerHeight - 8) tp = window.innerHeight - th - 8;
  t.style.left = l + 'px'; t.style.top = tp + 'px';
}
function hideTip() { var t = document.getElementById('dot-tip'); if (t) t.style.display = 'none'; }
document.addEventListener('mousemove', function (e) {
  var t = document.getElementById('dot-tip');
  if (t && t.style.display === 'block') moveTip(e);
});

// ── LEGEND ───────────────────────────────────────────────────────────────────
function drawLegend(xl, yl) {
  var el = document.getElementById('legend'); if (!el) return;
  el.innerHTML = [
    ['#047857', 'Elite — strong ' + xl + ' & ' + yl],
    ['#1D4ED8', 'Strong ' + yl + ' only'],
    ['#C2410C', 'Strong ' + xl + ' only'],
    ['#B91C1C', 'Below avg both']
  ].map(function (r) {
    return '<div class="legend-row"><div class="leg-dot" style="background:' + r[0] + '"></div>' + r[1] + '</div>';
  }).join('');
}

// ── TABLE ────────────────────────────────────────────────────────────────────
function drawTable(data, xl, yl) {
  var isH = MODE === 'hitters';
  var cols = isH
    ? ['Player', 'Team', 'Pos', 'Age', 'AB', 'AVG / OPS / HR / SB / wRC+', xl, yl, xl + ' vs avg', yl + ' vs avg']
    : ['Player', 'Team', 'Role', 'Age', 'IP', 'ERA / FIP / WHIP / K%',     xl, yl, xl + ' vs avg', yl + ' vs avg'];
  var si = SCOL !== null ? SCOL : 9;
  var sorted = data.slice().sort(function (a, b) {
    var vals = [
      [a.name || '', b.name || ''],
      [a.team || '', b.team || ''],
      [isH ? (a.pos || '') : (a.role || ''), isH ? (b.pos || '') : (b.role || '')],
      [a.age || 0, b.age || 0],
      [isH ? (a.ab || a.pa || 0) : (a.ip || 0), isH ? (b.ab || b.pa || 0) : (b.ip || 0)],
      [0, 0],
      [a.rawX == null ? -9999 : a.rawX, b.rawX == null ? -9999 : b.rawX],
      [a.rawY == null ? -9999 : a.rawY, b.rawY == null ? -9999 : b.rawY],
      [a.cx == null ? -9999 : a.cx, b.cx == null ? -9999 : b.cx],
      [a.cy == null ? -9999 : a.cy, b.cy == null ? -9999 : b.cy]
    ];
    var pair = vals[si] || [0, 0];
    if (pair[0] < pair[1]) return SDIR;
    if (pair[0] > pair[1]) return -SDIR;
    return 0;
  });
  document.getElementById('t-head').innerHTML = '<tr>' + cols.map(function (c, i) {
    return '<th class="' + (i === si ? 'sorted' : '') + '" onclick="MiLBExplorer.sortTbl(' + i + ')">' + c + (i === si ? (SDIR > 0 ? ' \u2193' : ' \u2191') : '') + '</th>';
  }).join('') + '</tr>';
  document.getElementById('t-body').innerHTML = sorted.map(function (p) {
    var sl = isH
      ? ((p.avg != null ? p.avg.toFixed(3) : '--') + '/' + (p.ops != null ? p.ops.toFixed(3) : '--')
         + '/' + (p.hr != null ? Math.round(p.hr) : '--') + '/' + (p.sb != null ? Math.round(p.sb) : '--')
         + '/' + (p.wrc_plus != null ? Math.round(p.wrc_plus) : '--'))
      : ((p.era != null ? p.era.toFixed(2) : '--') + '/' + (p.fip != null ? p.fip.toFixed(2) : '--')
         + '/' + (p.whip != null ? p.whip.toFixed(2) : '--') + '/' + (p.k_pct != null ? p.k_pct.toFixed(1) + '%' : '--'));
    return '<tr>'
      + '<td class="td-name">' + (p.name || '--') + '</td>'
      + '<td><span class="td-tm">' + (p.team || '--') + '</span></td>'
      + '<td style="color:var(--fg2);font-size:10px">' + (isH ? (p.pos || '--') : (p.role || '--')) + '</td>'
      + '<td class="td-n">' + (p.age || '--') + '</td>'
      + '<td class="td-n">' + (isH ? (p.ab || p.pa || '--') : (p.ip || '--')) + '</td>'
      + '<td class="td-slash">' + sl + '</td>'
      + '<td class="td-n">' + fv(p.rawX) + '</td>'
      + '<td class="td-n">' + fv(p.rawY) + '</td>'
      + '<td class="' + ((p.px == null ? 0 : p.px) >= 0 ? 'td-pos' : 'td-neg') + '">' + (((p.cx == null ? 0 : p.cx) >= 0) ? '+' : '') + fv(p.cx) + '</td>'
      + '<td class="' + ((p.py == null ? 0 : p.py) >= 0 ? 'td-pos' : 'td-neg') + '">' + (((p.cy == null ? 0 : p.cy) >= 0) ? '+' : '') + fv(p.cy) + '</td>'
      + '</tr>';
  }).join('');
  var note = document.getElementById('tbl-note');
  if (note) note.textContent = 'Sorted by ' + cols[si] + (SDIR > 0 ? ' \u2193' : ' \u2191');
}

function sortTbl(col) { if (SCOL === col) SDIR *= -1; else { SCOL = col; SDIR = col <= 2 ? 1 : -1; } render(); }
function togNames() { NAMES = !NAMES; ['tog-n', 'tog-n2'].forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.toggle('on', NAMES); }); render(); }
function togQuads() { QUADS = !QUADS; ['tog-q', 'tog-q2'].forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.toggle('on', QUADS); }); render(); }

// ── LOAD ─────────────────────────────────────────────────────────────────────
function setStatus(msg, tone) {
  var el = document.getElementById('milb-status'); if (!el) return;
  el.textContent = msg;
  el.className = 'milb-status' + (tone ? ' milb-status-' + tone : '');
}

function loadAndRender() {
  var files = ['fg-bat.json', 'fg-pit.json'];
  if (HAS_STATCAST) files.push('sv-bat.json', 'sv-pit.json');
  setStatus('Loading ' + LEVEL_LABEL + ' data\u2026');
  return window.MiLBData.loadLevel(LEVEL, files).then(function (bundle) {
    var fgBat  = bundle['fg-bat.json']  || [];
    var fgPit  = bundle['fg-pit.json']  || [];
    var svBat  = bundle['sv-bat.json']  || [];
    var svPit  = bundle['sv-pit.json']  || [];
    DB.hitters  = mergeHitters(fgBat, svBat, 0);
    DB.pitchers = mergePitchers(fgPit, svPit, 0);
    if (!DB.hitters.length && !DB.pitchers.length) {
      setStatus('No data yet — updating&hellip;', 'warn');
    } else {
      setStatus('Loaded ' + DB.hitters.length + ' hitters / ' + DB.pitchers.length + ' pitchers');
    }
    buildAxes();
    rebuildTeamDropdown();
    render();
  }).catch(function (e) {
    console.error('[milb-explorer] load failed', e);
    setStatus('Updating data\u2026', 'warn');
    buildAxes(); render();
  });
}

// ── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  // Hitters/pitchers tab wiring
  var hit = document.getElementById('ptab-hit'); if (hit) hit.addEventListener('click', function () { setMode('hitters'); });
  var pit = document.getElementById('ptab-pit'); if (pit) pit.addEventListener('click', function () { setMode('pitchers'); });
  // min label
  document.getElementById('min-lbl').textContent = 'Min AB';
  document.getElementById('min-v').value = 30;
  updAge();
  loadAndRender();
}

// Expose the handful of inline-onclick helpers the rendered HTML needs.
window.MiLBExplorer = {
  setMode: setMode,
  togNames: togNames,
  togQuads: togQuads,
  sortTbl: sortTbl,
  render: render,
  updAge: updAge,
  showTip: showTip,
  hideTip: hideTip
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
