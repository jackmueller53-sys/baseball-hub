/* ═════════════════════════════════════════════════════════════════════════════
   BASEBALL HUB — MiLB PLAYER CARD DRAWER
   ─────────────────────────────────────────────────────────────────────────────
   Renders the MiLB equivalent of the MLB stats-explorer player card. Same
   .pc-* skeleton (re-uses styles.css), backed by MLB Stats API season +
   seasonAdvanced + expectedStatistics + pitchArsenal groups.

     Hitter card panels:
       • Slash Line Profile      (AVG / OBP / SLG / OPS / wOBA / BABIP)
       • Plate Discipline         (BB%, K%, Whiff%, Contact% bars vs league)
       • Batted-Ball Profile      (xwOBA / EV / Hard-Hit% / Barrel% gauges) — Hawk-Eye
       • Stat Line table          (counting + speed)

     Pitcher card panels:
       • Pitch Arsenal            (per-pitch usage / velo / whiff% / put-away%) — Hawk-Eye
       • Plate Discipline         (K%, BB%, Whiff%, Strike% bars vs league)
       • Stat Line table          (counting + workload)
       • Batted-Ball Against      (xwOBA-A / xBA-A / Hard-Hit%-A / EV-A gauges) — Hawk-Eye

   League averages are computed live from the loaded dataset on each open
   (see computeHitterLeagueAvgs / computePitcherLeagueAvgs). Below the
   qualified-PA / qualified-IP thresholds the "vs league" comparison row and
   gauge/bar comparison ticks gray out and a "Small Sample" chip appears in
   the header.

   Hawk-Eye coverage: every AAA park since 2023 (full); FSL is partial. When
   a player has no xStats / pitchArsenal record, the relevant panel renders
   with dashes and an inline "Statcast not available" notice — the rest of
   the card continues to render normally.

   Public API (called by milb-explorer.js):
     window.MiLBCards.open(player, mode, db, levelLabel)
     window.MiLBCards.close()

   Source: MLB Stats API (statsapi.mlb.com).
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

// ── Sample-size thresholds for "qualified" comparisons ──────────────────────
var QUAL_PA = 10;   // hitters
var QUAL_IP = 3;    // pitchers

// ── Bar-chart / gauge reference scales (max for normalization) ──────────────
// Tuned from the mock so AAA/FSL ranges read cleanly. Player rate is mapped
// to 0-100% of bar width via value / SCALE.MAX (clamped). League-avg tick is
// drawn at leagueAvg / SCALE.MAX.
var SCALE = {
  // hitter PD bars
  bb_pct_h:      { max: 30,   dir:  1 },   // BB% — higher better
  k_pct_h:       { max: 30,   dir: -1 },   // K%  — lower better
  whiff_pct_h:   { max: 60,   dir: -1 },   // Whiff% — lower better
  contact_pct_h: { max: 100,  dir:  1 },   // Contact% — higher better
  // pitcher PD bars
  k_pct_p:       { max: 40,   dir:  1 },
  bb_pct_p:      { max: 20,   dir: -1 },
  whiff_pct_p:   { max: 60,   dir:  1 },   // higher = more swing-and-miss = better
  strike_pct_p:  { max: 80,   dir:  1 },
  // hitter batted-ball gauges (Hawk-Eye / expectedStatistics)
  xwoba:         { max: 0.50, dir:  1 },   // xwOBA — higher better
  ev:            { max: 95,   dir:  1 },   // average exit velocity (mph)
  hard_hit_pct:  { max: 60,   dir:  1 },   // Hard-Hit % — higher better
  barrel_pct:    { max: 20,   dir:  1 },   // Barrel % — higher better
  // pitcher batted-ball-against gauges (Hawk-Eye)
  xwoba_a:       { max: 0.45, dir: -1 },   // xwOBA against — lower better
  xba_a:         { max: 0.35, dir: -1 },   // xBA against — lower better
  ev_a:          { max: 95,   dir: -1 },   // EV against — lower better
  hard_hit_pct_a:{ max: 50,   dir: -1 }    // Hard-Hit% against — lower better
};

// ── Format helpers ──────────────────────────────────────────────────────────
function fmt3(v) {
  if (v == null || isNaN(v)) return '--';
  var s = v.toFixed(3);
  // Drop leading zero for slash-line style: 0.366 -> .366 ; -0.5 stays -0.500
  return v >= 0 && v < 1 ? s.replace(/^0/, '') : s;
}
function fmt2(v)   { return (v == null || isNaN(v)) ? '--' : v.toFixed(2); }
function fmtPct(v, dp) { return (v == null || isNaN(v)) ? '--' : v.toFixed(dp == null ? 1 : dp) + '%'; }
function fmtInt(v) { return (v == null || isNaN(v)) ? '--' : String(Math.round(v)); }
function fmtIP(v)  { return (v == null || isNaN(v)) ? '--' : v.toFixed(1); }
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

// ── League averages (live from the loaded DB) ───────────────────────────────
// Uses an aggregation-where-honest, mean-where-fine mix:
//   AVG/OBP/SLG/ERA/WHIP/HR9/K9/BB9 → re-aggregated from raw counting stats
//                                      restricted to qualified players
//   wOBA / FIP / rate-stats          → simple mean of qualified player values
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
    hr_per_pa: PA ? (HR / PA) * 100 : null,  // pct, comparable to hr_pct mean
    // Batted-ball / Hawk-Eye averages — only meaningful when at least some
    // qualified players have xStats. Falls to null if all xStats are null,
    // which causes the gauge tick + delta to suppress automatically.
    xba:          mean('xba'),
    xslg:         mean('xslg'),
    xwoba:        mean('xwoba'),
    ev:           mean('ev'),
    hard_hit_pct: mean('hard_hit_pct'),
    barrel_pct:   mean('barrel_pct')
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
    // Batted-ball-against / Hawk-Eye averages
    xba_a:          mean('xba_a'),
    xslg_a:         mean('xslg_a'),
    xwoba_a:        mean('xwoba_a'),
    ev_a:           mean('ev_a'),
    hard_hit_pct_a: mean('hard_hit_pct_a')
  };
}

// ── PD bar — width = playerVal/max ; tick = leagueAvg/max ; color reflects dir
// dir = 1: higher better (green if player > avg)
// dir = -1: lower better (green if player < avg)
function pdBar(label, value, leagueAvg, scaleKey, qualified) {
  var sc = SCALE[scaleKey] || { max: 100, dir: 1 };
  var dir = sc.dir, max = sc.max;
  var fillW = value == null || isNaN(value) ? 0 : clamp((value / max) * 100, 0, 100);
  var avgL  = leagueAvg == null || isNaN(leagueAvg) ? 0 : clamp((leagueAvg / max) * 100, 0, 100);
  var better = (value != null && leagueAvg != null && !isNaN(value) && !isNaN(leagueAvg))
    ? ((dir === 1 ? value >= leagueAvg : value <= leagueAvg) ? 'good' : 'bad')
    : '';
  // If sample isn't qualified, render bar in neutral blue and hide the avg tick
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

// ── Gauge — meter width = same normalization, foot = league avg + delta
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
  } else {
    meterCls = 'mid';
  }
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

// ── Pitch-arsenal table ─────────────────────────────────────────────────────
// Renders one row per pitch type sorted by usage% descending. The usage cell
// embeds an inline bar so the eye can read "this is his fastball" at a glance.
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

// Empty-state helper for the batted-ball gauge panels when xStats are absent.
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

// ── vs-Avg row helper — diff sign + good/bad colour ─────────────────────────
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

// ── Hitter card ─────────────────────────────────────────────────────────────
function renderHitter(p, lg, levelLabel) {
  var qualified = lg && lg.qualified && (p.pa || 0) >= QUAL_PA;
  var levelLeague = (levelLabel || '').toUpperCase() + (p.league ? ' · ' + p.league : '');

  // Headline KPI strip — 5 cells matching MLB layout (AVG, OPS, wOBA, HR, ISO)
  var kpis = [
    ['AVG',  fmt3(p.avg)],
    ['OPS',  fmt3(p.ops)],
    ['wOBA', fmt3(p.woba)],
    ['HR',   fmtInt(p.hr)],
    ['ISO',  fmt3(p.iso)]
  ];

  // Slash Line Profile
  var slash = [
    ['AVG',   fmt3(p.avg)],
    ['OBP',   fmt3(p.obp)],
    ['SLG',   fmt3(p.slg)],
    ['OPS',   fmt3(p.ops)],
    ['wOBA',  fmt3(p.woba)],
    ['BABIP', fmt3(p.babip)]
  ];

  // Plate Discipline bars — vs league
  var pdHtml = [
    pdBar('BB%',      p.bb_pct,      qualified ? lg.bb_pct      : null, 'bb_pct_h',      qualified),
    pdBar('K%',       p.k_pct,       qualified ? lg.k_pct       : null, 'k_pct_h',       qualified),
    pdBar('Whiff%',   p.whiff_pct,   qualified ? lg.whiff_pct   : null, 'whiff_pct_h',   qualified),
    pdBar('Contact%', p.contact_pct, qualified ? lg.contact_pct : null, 'contact_pct_h', qualified)
  ].join('');

  // Batted-Ball Profile gauges (replaces Power Profile — ISO/SLG/HR-PA/BB-K
  // were redundant with the slash-line panel + Plate Discipline; the new
  // Statcast quality metrics carry more signal).
  var fmtMph = function (v) { return (v == null || isNaN(v)) ? '--' : v.toFixed(1); };
  var bbHtml = [
    gauge('xwOBA',     p.xwoba,        qualified ? lg.xwoba        : null, 'xwoba',        fmt3, qualified),
    gauge('Avg EV',    p.ev,           qualified ? lg.ev           : null, 'ev',           fmtMph, qualified, function (v) { return v.toFixed(1) + ' mph'; }),
    gauge('Hard-Hit%', p.hard_hit_pct, qualified ? lg.hard_hit_pct : null, 'hard_hit_pct', function (v) { return fmtPct(v, 1); }, qualified, function (v) { return v.toFixed(1) + 'pp'; }),
    gauge('Barrel%',   p.barrel_pct,   qualified ? lg.barrel_pct   : null, 'barrel_pct',   function (v) { return fmtPct(v, 1); }, qualified, function (v) { return v.toFixed(1) + 'pp'; })
  ].join('');
  var bbHasData = !bbAbsent(p, ['xwoba', 'ev', 'hard_hit_pct', 'barrel_pct']);

  // Stat line table — counting + speed
  var sl = '<table class="stat-tbl"><thead><tr><th>Metric</th><th>Value</th><th>Metric</th><th>Value</th></tr></thead><tbody>'
    + '<tr><td>G</td><td>'  + fmtInt(p.g)   + '</td><td>R</td><td>'   + fmtInt(p.r)   + '</td></tr>'
    + '<tr><td>PA</td><td>' + fmtInt(p.pa)  + '</td><td>RBI</td><td>' + fmtInt(p.rbi) + '</td></tr>'
    + '<tr><td>AB</td><td>' + fmtInt(p.ab)  + '</td><td>BB</td><td>'  + fmtInt(p.bb)  + '</td></tr>'
    + '<tr><td>H</td><td>'  + fmtInt(p.h)   + '</td><td>SO</td><td>'  + fmtInt(p.k)   + '</td></tr>'
    + '<tr><td>2B</td><td>' + fmtInt(p.d)   + '</td><td>SB</td><td>'  + fmtInt(p.sb)  + '</td></tr>'
    + '<tr><td>HR</td><td>' + fmtInt(p.hr)  + '</td><td>HBP</td><td>' + fmtInt(p.hbp) + '</td></tr>'
    + '</tbody></table>';

  // vs Level Avg footer table — 4 rows × 2 cols absorbing both trad metrics
  // and the new Statcast quality metrics so the user can compare on one
  // line whether the hitter is over- or under-performing peers.
  var rows = [];
  rows.push(vsRow('AVG',       p.avg,          qualified ? lg.avg          : null, 1, fmt3).concat(
            vsRow('K%',        p.k_pct,        qualified ? lg.k_pct        : null, -1, function (v) { return fmtPct(v, 1); }, function (d) { return d.toFixed(1); })));
  rows.push(vsRow('OBP',       p.obp,          qualified ? lg.obp          : null, 1, fmt3).concat(
            vsRow('BB%',       p.bb_pct,       qualified ? lg.bb_pct       : null, 1,  function (v) { return fmtPct(v, 1); }, function (d) { return d.toFixed(1); })));
  rows.push(vsRow('SLG',       p.slg,          qualified ? lg.slg          : null, 1, fmt3).concat(
            vsRow('wOBA',      p.woba,         qualified ? lg.woba         : null, 1, fmt3)));
  rows.push(vsRow('xwOBA',     p.xwoba,        qualified ? lg.xwoba        : null, 1, fmt3).concat(
            vsRow('Hard-Hit%', p.hard_hit_pct, qualified ? lg.hard_hit_pct : null, 1, function (v) { return fmtPct(v, 1); }, function (d) { return d.toFixed(1); })));
  var vsRows = rows.map(function (cells) { return '<tr>' + cells.join('') + '</tr>'; }).join('');

  var sssChip = qualified ? '' : '<span class="pc-sss-chip" title="Below qualified PA threshold">Small Sample · PA &lt; ' + QUAL_PA + '</span>';
  var vsLbl = qualified
    ? 'vs. ' + escapeHtml(levelLeague) + ' Average (PA \u2265 ' + QUAL_PA + ')'
    : 'vs. ' + escapeHtml(levelLeague) + ' Average — small sample (PA &lt; ' + QUAL_PA + ')';

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
    +     '<div class="pc-row pc-row-2col">'
    +       '<div class="chart-panel">'
    +         '<div class="cp-title">Slash Line Profile<span class="cp-src cp-src-mlb">Stats API</span></div>'
    +         '<div class="slash-grid">'
    +           slash.map(function (s) { return '<div class="slash-cell"><div class="slash-val">' + s[1] + '</div><div class="slash-lbl">' + s[0] + '</div></div>'; }).join('')
    +         '</div>'
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
    +     '<div class="pc-row pc-row-2col">'
    +       '<div class="chart-panel ' + (qualified && bbHasData ? '' : 'pc-sss') + '">'
    +         '<div class="cp-title">Batted-Ball Profile<span class="cp-src cp-src-mlb">Statcast</span></div>'
    +         (bbHasData ? ('<div class="gauge-grid">' + bbHtml + '</div>') : bbEmptyMsg())
    +       '</div>'
    +       '<div class="stat-section">'
    +         '<div class="cp-title">Stat Line<span class="cp-src cp-src-mlb">Stats API</span></div>'
    +         sl
    +       '</div>'
    +     '</div>'
    +     '<div class="pc-bottom-tbl ' + (qualified ? '' : 'pc-sss') + '">'
    +       '<div class="section-lbl">' + vsLbl + '</div>'
    +       '<table class="vs-avg-tbl"><thead><tr>'
    +         '<th>Metric</th><th>Value</th><th>Lg Avg</th><th>vs Avg</th>'
    +         '<th>Metric</th><th>Value</th><th>Lg Avg</th><th>vs Avg</th>'
    +       '</tr></thead><tbody>' + vsRows + '</tbody></table>'
    +     '</div>'
    +     '<div class="pc-footnote">Stats API season + seasonAdvanced + Statcast expectedStatistics. AAA has full Statcast coverage; FSL is partial. League avgs computed from qualified players in the loaded ' + escapeHtml(levelLabel) + ' dataset.</div>'
    +   '</div>'
    + '</div>';
}

// ── Pitcher card ────────────────────────────────────────────────────────────
function renderPitcher(p, lg, levelLabel) {
  var qualified = lg && lg.qualified && (p.ip || 0) >= QUAL_IP;
  var levelLeague = (levelLabel || '').toUpperCase() + (p.league ? ' · ' + p.league : '');

  var kpis = [
    ['ERA',   fmt2(p.era)],
    ['FIP',   fmt2(p.fip)],
    ['K%',    fmtPct(p.k_pct, 1)],
    ['WHIP',  fmt2(p.whip)],
    ['K-BB%', fmtPct(p.kbb_pct, 1)]
  ];

  // Pitch Arsenal table replaces Run Prevention (ERA/FIP/WHIP/HR9/AVGa/OPSa
  // were all redundant — ERA/FIP/WHIP are header KPIs and the rest moved
  // to the vs-Avg footer). Source: Stats API pitchArsenal.
  var arsenalHtml = arsenalTable(p.pitch_arsenal);
  var hasArsenal = !!(p.pitch_arsenal && p.pitch_arsenal.length);

  var pdHtml = [
    pdBar('K%',       p.k_pct,      qualified ? lg.k_pct      : null, 'k_pct_p',      qualified),
    pdBar('BB%',      p.bb_pct,     qualified ? lg.bb_pct     : null, 'bb_pct_p',     qualified),
    pdBar('Whiff%',   p.whiff_pct,  qualified ? lg.whiff_pct  : null, 'whiff_pct_p',  qualified),
    pdBar('Strike%',  p.strike_pct, qualified ? lg.strike_pct : null, 'strike_pct_p', qualified)
  ].join('');

  // Batted-Ball Against gauges replace the old Quality vs Hitters panel —
  // AVG-A / OPS-A / HR-9 / K-BB% now appear in the vs-Avg footer (and K-BB%
  // is a header KPI). Hawk-Eye contact-quality is the higher-signal frame.
  var fmtMph = function (v) { return (v == null || isNaN(v)) ? '--' : v.toFixed(1); };
  var bbAHtml = [
    gauge('xwOBA-A',   p.xwoba_a,        qualified ? lg.xwoba_a        : null, 'xwoba_a',        fmt3, qualified),
    gauge('xBA-A',     p.xba_a,          qualified ? lg.xba_a          : null, 'xba_a',          fmt3, qualified),
    gauge('Hard-Hit%', p.hard_hit_pct_a, qualified ? lg.hard_hit_pct_a : null, 'hard_hit_pct_a', function (v) { return fmtPct(v, 1); }, qualified, function (v) { return v.toFixed(1) + 'pp'; }),
    gauge('EV-A',      p.ev_a,           qualified ? lg.ev_a           : null, 'ev_a',           fmtMph, qualified, function (v) { return v.toFixed(1) + ' mph'; })
  ].join('');
  var bbAHasData = !bbAbsent(p, ['xwoba_a', 'xba_a', 'hard_hit_pct_a', 'ev_a']);

  var sl = '<table class="stat-tbl"><thead><tr><th>Metric</th><th>Value</th><th>Metric</th><th>Value</th></tr></thead><tbody>'
    + '<tr><td>G</td><td>'      + fmtInt(p.g)  + '</td><td>BF</td><td>'    + fmtInt(p.bf)  + '</td></tr>'
    + '<tr><td>GS</td><td>'     + fmtInt(p.gs) + '</td><td>H</td><td>'     + fmtInt(p.h_a) + '</td></tr>'
    + '<tr><td>IP</td><td>'     + fmtIP(p.ip)  + '</td><td>R / ER</td><td>'+ fmtInt(p.r_a) + ' / ' + fmtInt(p.er) + '</td></tr>'
    + '<tr><td>W-L</td><td>'    + fmtInt(p.w)  + '\u2013' + fmtInt(p.l) + '</td><td>BB</td><td>' + fmtInt(p.bb) + '</td></tr>'
    + '<tr><td>SV</td><td>'     + fmtInt(p.sv) + '</td><td>SO</td><td>'    + fmtInt(p.k)   + '</td></tr>'
    + '<tr><td>HR-A</td><td>'   + fmtInt(p.hr_a) + '</td><td>HBP</td><td>' + fmtInt(p.hbp) + '</td></tr>'
    + '</tbody></table>';

  // 5 rows × 2 cols. Absorbs metrics that were lost when Run Prevention +
  // Quality vs Hitters were replaced (HR9, AVG-A, OPS-A) plus the new
  // Hawk-Eye xStats so the user can compare contact quality on one line.
  var rows = [];
  rows.push(vsRow('ERA',     p.era,     qualified ? lg.era     : null, -1, fmt2).concat(
            vsRow('K%',      p.k_pct,   qualified ? lg.k_pct   : null, 1,  function (v) { return fmtPct(v, 1); }, function (d) { return d.toFixed(1); })));
  rows.push(vsRow('FIP',     p.fip,     qualified ? lg.fip     : null, -1, fmt2).concat(
            vsRow('BB%',     p.bb_pct,  qualified ? lg.bb_pct  : null, -1, function (v) { return fmtPct(v, 1); }, function (d) { return d.toFixed(1); })));
  rows.push(vsRow('WHIP',    p.whip,    qualified ? lg.whip    : null, -1, fmt2).concat(
            vsRow('HR/9',    p.hr9,     qualified ? lg.hr9     : null, -1, fmt2)));
  rows.push(vsRow('AVG-A',   p.avg_a,   qualified ? lg.avg_a   : null, -1, fmt3).concat(
            vsRow('OPS-A',   p.ops_a,   qualified ? lg.ops_a   : null, -1, fmt3)));
  rows.push(vsRow('xwOBA-A', p.xwoba_a, qualified ? lg.xwoba_a : null, -1, fmt3).concat(
            vsRow('Hard-Hit%-A', p.hard_hit_pct_a, qualified ? lg.hard_hit_pct_a : null, -1, function (v) { return fmtPct(v, 1); }, function (d) { return d.toFixed(1); })));
  var vsRows = rows.map(function (cells) { return '<tr>' + cells.join('') + '</tr>'; }).join('');

  var sssChip = qualified ? '' : '<span class="pc-sss-chip" title="Below qualified IP threshold">Small Sample · IP &lt; ' + QUAL_IP + '</span>';
  var vsLbl = qualified
    ? 'vs. ' + escapeHtml(levelLeague) + ' Average (IP \u2265 ' + QUAL_IP + ')'
    : 'vs. ' + escapeHtml(levelLeague) + ' Average — small sample (IP &lt; ' + QUAL_IP + ')';

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
    +     '<div class="pc-row pc-row-2col">'
    +       '<div class="chart-panel' + (hasArsenal ? '' : ' pc-empty-panel') + '">'
    +         '<div class="cp-title">Pitch Arsenal<span class="cp-src cp-src-mlb">Statcast</span></div>'
    +         arsenalHtml
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
    +     '<div class="pc-row pc-row-2col">'
    +       '<div class="stat-section">'
    +         '<div class="cp-title">Stat Line<span class="cp-src cp-src-mlb">Stats API</span></div>'
    +         sl
    +       '</div>'
    +       '<div class="chart-panel ' + (qualified && bbAHasData ? '' : 'pc-sss') + '">'
    +         '<div class="cp-title">Batted-Ball Against<span class="cp-src cp-src-mlb">Statcast</span></div>'
    +         (bbAHasData ? ('<div class="gauge-grid">' + bbAHtml + '</div>') : bbEmptyMsg())
    +       '</div>'
    +     '</div>'
    +     '<div class="pc-bottom-tbl ' + (qualified ? '' : 'pc-sss') + '">'
    +       '<div class="section-lbl">' + vsLbl + '</div>'
    +       '<table class="vs-avg-tbl"><thead><tr>'
    +         '<th>Metric</th><th>Value</th><th>Lg Avg</th><th>vs Avg</th>'
    +         '<th>Metric</th><th>Value</th><th>Lg Avg</th><th>vs Avg</th>'
    +       '</tr></thead><tbody>' + vsRows + '</tbody></table>'
    +     '</div>'
    +     '<div class="pc-footnote">Stats API season + seasonAdvanced + Statcast pitchArsenal + expectedStatistics. AAA has full Statcast coverage; FSL is partial. League avgs computed from qualified pitchers in the loaded ' + escapeHtml(levelLabel) + ' dataset.</div>'
    +   '</div>'
    + '</div>';
}

// ── Open / close ────────────────────────────────────────────────────────────
function ensureOverlay() {
  var ov = document.getElementById('pc-overlay');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'pc-overlay';
  ov.innerHTML = '<div id="pc-overlay-content"></div>';
  // click-outside-to-close (matches MLB explorer behaviour)
  ov.addEventListener('click', function (e) {
    if (e.target === ov) close();
  });
  document.body.appendChild(ov);
  // ESC to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
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
    html = renderPitcher(player, lg, levelLabel || '');
  } else {
    lg = computeHitterLeagueAvgs((db && db.hitters) || []);
    html = renderHitter(player, lg, levelLabel || '');
  }
  content.innerHTML = html;
  ov.classList.add('visible');
  // Lock body scroll while drawer is open
  document.body.style.overflow = 'hidden';
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
  _QUAL_PA: QUAL_PA,
  _QUAL_IP: QUAL_IP
};

})();
