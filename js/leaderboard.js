
var allRows = [];
var activeSeason = null;
var sortCol = 'overall';
var sortDir = 'desc';
var _historyLoadPromise = null;

function _mapHistoryRow(r) {
  return {
    pitcher: r.p, name: r.n || 'Unknown', team: r.t || '', season: r.s,
    overall: r.ov, fb: r.fb, brk: r.bk, off: r.of,
    totalPitches: r.tp || 0, fbPitches: r.fp || 0, brkPitches: r.bp || 0, offPitches: r.op || 0,
    era: r.era, fip: r.fip, xfip: r.xfp, xera: r.xer,
    kpct: r.kp, bbpct: r.bbp, kbbpct: r.kbb, war: r.war,
    csw: r.csw, swstr: r.sws, ip: r.ip,
    fgStuff: r.fgs, fgLoc: r.fgl, fgPit: r.fgp,
    apw: r.apw != null ? r.apw : null,
    awr: r.awr != null ? r.awr : null,
    _source: "custom_model"
  };
}

// Async history loader. Resolves with true/false; safe to call repeatedly.
function loadData() {
  if (_historyLoadPromise) return _historyLoadPromise;
  // Back-compat: if a synchronous RAW_DATA global is still defined, prefer it.
  if (typeof RAW_DATA !== 'undefined' && Array.isArray(RAW_DATA)) {
    try {
      allRows = RAW_DATA.map(_mapHistoryRow);
      _historyLoadPromise = Promise.resolve(true);
      return _historyLoadPromise;
    } catch (e) { console.error('Load error:', e); }
  }
  _historyLoadPromise = fetch('data/stuffplus-history.json', { cache: 'default' })
    .then(function(r){ if(!r.ok) throw new Error('http '+r.status); return r.json(); })
    .then(function(rows){
      allRows = rows.map(_mapHistoryRow);
      return true;
    })
    .catch(function(e){
      console.error('[loadData] history fetch failed:', e.message);
      allRows = [];
      _historyLoadPromise = null;
      return false;
    });
  return _historyLoadPromise;
}

function gradeClass(val) {
  if (val == null) return 'nd';
  if (val >= 130) return 'g-80'; if (val >= 115) return 'g-70'; if (val >= 107) return 'g-60';
  if (val >= 103) return 'g-55'; if (val >= 97) return 'g-50'; if (val >= 93) return 'g-45';
  if (val >= 85) return 'g-40'; if (val >= 70) return 'g-30'; return 'g-20';
}

function fmtGrade(val, cls) {
  if (val == null) return '<span class="nd">&mdash;</span>';
  return '<span class="grade-cell ' + (cls||'') + ' ' + gradeClass(val) + '">' + Math.round(val) + '</span>';
}

function fmtPub(val, fmt) {
  if (val == null || val === '' || isNaN(val)) return '<span class="nd">&mdash;</span>';
  var text;
  if (fmt === 'pct') text = (val * 100).toFixed(1) + '%';
  else if (fmt === 'dec2') text = parseFloat(val).toFixed(2);
  else if (fmt === 'dec1') text = parseFloat(val).toFixed(1);
  else text = val.toString();
  return '<span class="pub">' + text + '</span>';
}

function fmtPubFG(val) {
  if (val == null || val === '' || isNaN(val)) return '<span class="nd">&mdash;</span>';
  var v = Math.round(val);
  var cls = v >= 110 ? 'pub pub-good' : v < 90 ? 'pub pub-bad' : 'pub';
  return '<span class="' + cls + '">' + v + '</span>';
}

function pitchMix(row) {
  var total = row.totalPitches || 1;
  var fbN = row.fbPitches || 0, brkN = row.brkPitches || 0, offN = row.offPitches || 0;
  var pct = function (n) { return Math.round((n / total) * 100); };
  var grade = function (g) { return (g == null || isNaN(g)) ? '--' : Math.round(g); };
  // Rich hover tooltip — full pitch-group breakdown: count, usage%, Stuff+ grade.
  var tip = 'PITCH MIX  (' + total + ' pitches)\n'
    + 'Fastballs:  ' + fbN  + '  (' + pct(fbN)  + '%)   Stuff+ ' + grade(row.fb) + '\n'
    + 'Breaking:   ' + brkN + '  (' + pct(brkN) + '%)   Stuff+ ' + grade(row.brk) + '\n'
    + 'Offspeed:   ' + offN + '  (' + pct(offN) + '%)   Stuff+ ' + grade(row.off);
  var w = 90;  // wider bar than before (was 60) for readability
  return '<div class="pitch-bar" title="' + tip.replace(/"/g, '&quot;') + '">' +
    '<span class="pitch-bar-inner pitch-bar-fb"  style="width:' + Math.round((fbN/total)*w)  + 'px"></span>' +
    '<span class="pitch-bar-inner pitch-bar-brk" style="width:' + Math.round((brkN/total)*w) + 'px"></span>' +
    '<span class="pitch-bar-inner pitch-bar-off" style="width:' + Math.round((offN/total)*w) + 'px"></span>' +
    '</div>';
}

function buildSeasonTabs() {
  var seasonSet = {};
  allRows.forEach(function(r) { seasonSet[r.season] = true; });
  // Public site exposes 2026 only. Prior-season training data (2020-2025)
  // stays in the underlying files but is not shown as a selectable year tab.
  var seasons = Object.keys(seasonSet).map(Number).sort().filter(function(s){ return s === 2026; });
  if (!seasons.length) seasons = [2026];
  var container = document.getElementById('sp-season-tabs');
  container.innerHTML = '';
  seasons.forEach(function(s) {
    var btn = document.createElement('button');
    btn.className = 'stab' + (s === seasons[seasons.length - 1] ? ' active' : '');
    btn.textContent = s;
    btn.onclick = function() {
      activeSeason = s;
      container.querySelectorAll('.stab').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderTable();
    };
    container.appendChild(btn);
  });
  activeSeason = seasons[seasons.length - 1];
}

function renderHistogram(filteredRows) {
  var svg = document.getElementById('hist-svg');
  var statsEl = document.getElementById('hist-stats');
  document.getElementById('hist-season-label').textContent = activeSeason ? ' \u2014 ' + activeSeason + ' Season' : '';

  // Use custom model 'overall' when available; fall back to fgStuff for 2026 FG-only rows
  var scores = filteredRows.map(function(r) { return r.overall != null ? r.overall : r.fgStuff; }).filter(function(v) { return v != null; });
  if (scores.length === 0) { svg.innerHTML = ''; statsEl.innerHTML = ''; return; }

  // Buckets: 100-centered scale (50-150 range)
  var buckets = [
    {lo:50, hi:69, label:'<70', color:'#991B1B'},
    {lo:70, hi:84, label:'70-84', color:'#B91C1C'},
    {lo:85, hi:99, label:'85-99', color:'#C2410C'},
    {lo:100, hi:114, label:'100-114', color:'var(--fg)'},
    {lo:115, hi:129, label:'115-129', color:'#10b981'},
    {lo:130, hi:150, label:'130+', color:'#047857'}
  ];

  buckets.forEach(function(b) { b.count = 0; });
  scores.forEach(function(s) {
    var rounded = Math.round(s);
    for (var i = 0; i < buckets.length; i++) {
      if (rounded >= buckets[i].lo && rounded <= buckets[i].hi) { buckets[i].count++; break; }
    }
  });

  var maxCount = Math.max.apply(null, buckets.map(function(b) { return b.count; }));
  if (maxCount === 0) maxCount = 1;

  // SVG dimensions
  var W = 800, H = 200;
  var padL = 50, padR = 30, padT = 10, padB = 35;
  var chartW = W - padL - padR;
  var chartH = H - padT - padB;
  var barW = chartW / buckets.length;
  var barGap = 8;

  // Mean line
  var mean = scores.reduce(function(a,b){return a+b;},0) / scores.length;
  var std = Math.sqrt(scores.reduce(function(a,b){return a + (b-mean)*(b-mean);},0) / scores.length);

  var html = '';

  // Y-axis gridlines
  var yTicks = [0, Math.round(maxCount/4), Math.round(maxCount/2), Math.round(maxCount*3/4), maxCount];
  yTicks.forEach(function(t) {
    var y = padT + chartH - (t / maxCount) * chartH;
    html += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W-padR) + '" y2="' + y + '" stroke="rgba(45,36,24,.04)" stroke-width="1"/>';
    html += '<text x="' + (padL-8) + '" y="' + (y+3) + '" text-anchor="end" class="hist-bar-label">' + t + '</text>';
  });

  // Bars
  buckets.forEach(function(b, i) {
    var barH = (b.count / maxCount) * chartH;
    var x = padL + i * barW + barGap/2;
    var y = padT + chartH - barH;
    var w = barW - barGap;

    html += '<rect class="hist-bar" x="' + x + '" y="' + y + '" width="' + w + '" height="' + barH + '" rx="4" fill="' + b.color + '" opacity=".75"/>';
    // Count above bar
    if (b.count > 0) {
      html += '<text x="' + (x + w/2) + '" y="' + (y - 5) + '" class="hist-bar-count" fill="' + b.color + '">' + b.count + '</text>';
    }
    // Bucket label below
    html += '<text x="' + (x + w/2) + '" y="' + (padT + chartH + 18) + '" class="hist-bar-label">' + b.label + '</text>';
  });

  // Mean line
  var meanBucket = (mean - 50) / 100; // normalize 50-150 to 0-1
  var meanX = padL + meanBucket * chartW;
  html += '<line x1="' + meanX + '" y1="' + padT + '" x2="' + meanX + '" y2="' + (padT+chartH) + '" class="hist-mean-line"/>';
  html += '<text x="' + meanX + '" y="' + (padT - 2) + '" text-anchor="middle" class="hist-mean-label">MEAN ' + mean.toFixed(1) + '</text>';

  svg.innerHTML = html;

  // Summary stats
  statsEl.innerHTML =
    '<div class="hist-stat"><div class="hist-stat-val">' + scores.length + '</div><div class="hist-stat-lbl">Pitchers</div></div>' +
    '<div class="hist-stat"><div class="hist-stat-val">' + mean.toFixed(1) + '</div><div class="hist-stat-lbl">Mean</div></div>' +
    '<div class="hist-stat"><div class="hist-stat-val">' + std.toFixed(1) + '</div><div class="hist-stat-lbl">Std Dev</div></div>' +
    '<div class="hist-stat"><div class="hist-stat-val">' + Math.min.apply(null,scores).toFixed(0) + '</div><div class="hist-stat-lbl">Min</div></div>' +
    '<div class="hist-stat"><div class="hist-stat-val">' + Math.max.apply(null,scores).toFixed(0) + '</div><div class="hist-stat-lbl">Max</div></div>';
}

function buildHeaders() {
  var thead = document.getElementById('thead');
  var mode = document.getElementById('view-mode').value;
  var g = '<tr class="grp-header">', c = '<tr class="col-header">';

  g += '<th colspan="3" class="grp-info">Pitcher</th>';
  c += '<th data-col="rank">RK</th><th data-col="name" style="text-align:left">Name</th><th data-col="totalPitches">Pitches</th>';

  g += '<th class="sep-header"></th>';
  c += '<td class="sep"></td>';
  g += '<th colspan="4" class="grp-model">Custom XGBoost Model</th>';
  c += '<th data-col="overall">Stuff+</th><th data-col="apw">Pred Whiff</th><th data-col="awr">Actual Whiff</th><th data-col="mix">Mix</th>';

  if (mode === 'full' || mode === 'comparison') {
    g += '<th class="sep-header"></th>'; c += '<td class="sep"></td>';
    g += '<th colspan="3" class="grp-public">FanGraphs Models</th>';
    c += '<th data-col="fgStuff">Stuff+</th><th data-col="fgLoc">Loc+</th><th data-col="fgPit">Pit+</th>';
  }
  if (mode === 'full') {
    g += '<th class="sep-header"></th>'; c += '<td class="sep"></td>';
    g += '<th colspan="7" class="grp-public">Public Stats</th>';
    c += '<th data-col="era">ERA</th><th data-col="fip">FIP</th><th data-col="xera">xERA</th><th data-col="kpct">K%</th><th data-col="bbpct">BB%</th><th data-col="csw">CSW%</th><th data-col="war">WAR</th>';
  }
  g += '</tr>'; c += '</tr>';
  thead.innerHTML = g + c;

  thead.querySelectorAll('.col-header th[data-col]').forEach(function(th) {
    th.addEventListener('click', function() {
      var col = th.dataset.col;
      if (col === 'mix' || col === 'rank') return;
      if (col === 'name') { sortCol = 'name'; sortDir = sortDir === 'asc' ? 'desc' : 'asc'; }
      else { if (sortCol === col) sortDir = sortDir === 'desc' ? 'asc' : 'desc'; else { sortCol = col; sortDir = 'desc'; } }
      renderTable();
    });
  });
}

function renderTable() {
  var mode = document.getElementById('view-mode').value;
  var minP = parseInt(document.getElementById('min-pitches').value) || 0;
  var q = document.getElementById('search').value.toLowerCase().trim();
  buildHeaders();

  var rows = allRows.filter(function(r) {
    if (r.season !== activeSeason) return false;
    if (r.totalPitches < minP) return false;
    if (q && r.name.toLowerCase().indexOf(q) === -1 && (r.team||'').toLowerCase().indexOf(q) === -1) return false;
    return true;
  });

  rows.sort(function(a, b) {
    var av = a[sortCol], bv = b[sortCol];
    // For 'overall' sort: if custom model grade is null, fall back to fgStuff
    if (sortCol === 'overall') {
      if (av == null) av = a.fgStuff;
      if (bv == null) bv = b.fgStuff;
    }
    if (sortCol === 'name') { return sortDir === 'asc' ? (av||'').localeCompare(bv||'') : (bv||'').localeCompare(av||''); }
    if (av == null) av = -Infinity; if (bv == null) bv = -Infinity;
    return sortDir === 'desc' ? bv - av : av - bv;
  });

  document.querySelectorAll('.col-header th').forEach(function(th) {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.col === sortCol) th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
  });

  // Store filtered rows for click handler access
  window._stuffRows = rows;

  var h = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    h += '<tr style="cursor:pointer" onclick="openStuffPlayerCard('+i+')">';
    h += '<td class="rk">' + (i+1) + '</td>';
    h += '<td class="nm">' + r.name + '<span class="team">' + (r.team||'') + '</span></td>';
    h += '<td class="pub">' + r.totalPitches.toLocaleString() + '</td>';
    h += '<td class="sep"></td>';
    // Show custom model grade if available; for 2026 FG-only rows, show FG Stuff+ with 'fg' marker
    if (r.overall != null) {
      h += '<td>' + fmtGrade(r.overall,'grade-overall') + '</td>';
    } else if (r.fgStuff != null) {
      h += '<td>' + fmtGrade(r.fgStuff,'grade-overall') + '<span class="fg-tag" title="FanGraphs model (custom model pending)">FG</span></td>';
    } else {
      h += '<td>' + fmtGrade(null) + '</td>';
    }
    h += '<td>' + fmtPub(r.apw, 'pct') + '</td>';
    h += '<td>' + fmtPub(r.awr, 'pct') + '</td>';
    h += '<td>' + pitchMix(r) + '</td>';
    if (mode === 'full' || mode === 'comparison') {
      h += '<td class="sep"></td>';
      h += '<td>' + fmtPubFG(r.fgStuff) + '</td>';
      h += '<td>' + fmtPubFG(r.fgLoc) + '</td>';
      h += '<td>' + fmtPubFG(r.fgPit) + '</td>';
    }
    if (mode === 'full') {
      h += '<td class="sep"></td>';
      h += '<td>' + fmtPub(r.era,'dec2') + '</td>';
      h += '<td>' + fmtPub(r.fip,'dec2') + '</td>';
      h += '<td>' + fmtPub(r.xera,'dec2') + '</td>';
      h += '<td>' + fmtPub(r.kpct,'pct') + '</td>';
      h += '<td>' + fmtPub(r.bbpct,'pct') + '</td>';
      h += '<td>' + fmtPub(r.csw,'pct') + '</td>';
      h += '<td>' + fmtPub(r.war,'dec1') + '</td>';
    }
    h += '</tr>';
  }
  document.getElementById('tbody').innerHTML = h;
  document.getElementById('count-badge').innerHTML = '<b>' + rows.length + '</b> pitchers';
  document.getElementById('loading').style.display = 'none';
  document.getElementById('lb').style.display = '';
  renderHistogram(rows);
}

// Bridge from Stuff+ row click → shared openPlayerCard modal
function openStuffPlayerCard(idx){
  var r = window._stuffRows && window._stuffRows[idx];
  if(!r) return;
  // Build a player object compatible with openPlayerCard(player, "pitchers")
  var player = {
    name:     r.name,
    team:     r.team,
    mlbam_id: r.pitcher || null,
    era:      r.era,
    fip:      r.fip,
    xfip:     r.xfip,
    xera:     r.xera,
    war:      r.war,
    ip:       r.ip,
    k_pct:    r.kpct != null ? r.kpct * 100 : null,
    bb_pct:   r.bbpct != null ? r.bbpct * 100 : null,
    csw:      r.csw != null ? r.csw * 100 : null,
    swstr:    r.swstr != null ? r.swstr * 100 : null,
    role:     "SP",
    stuff_plus:    r.overall != null ? r.overall : r.fgStuff,
    location_plus: r.fgLoc,
    pitching_plus: r.fgPit,
    apw:           r.apw,
    awr:           r.awr
  };
  if(typeof openPlayerCard === 'function'){
    openPlayerCard(player, "pitchers").catch(function(e){ console.error("Stuff+ card error:", e); });
  }
}

// ── STUFF+ 2026 STATIC DATA LOADER ───────────────────────────────────────────
// Loads 2026 Stuff+ data from static JSON files (custom model output or FG fallback).
// Tries data/stuffplus-custom.json first (custom XGBoost output), then data/fg-stuffplus.json
async function load2026StuffPlus() {
  var statusEl = document.getElementById('loading');
  var origHtml = statusEl ? statusEl.innerHTML : '';
  try {
    // Try custom model output first
    try {
      const resp = await fetch('data/stuffplus-custom.json');
      if (resp.ok) {
        const data = await resp.json();
        // data should be in RAW_DATA format: [{p:..., n:..., s:2026, ov:..., ...}]
        const rows2026 = data.filter(r => r.s === 2026);
        if (rows2026.length > 0) {
          // Remove any 2026 rows already loaded from RAW_DATA to avoid duplicates
          allRows = allRows.filter(function(r) { return r.season !== 2026; });
          // Merge into allRows, converting to the format loadData() produces
          rows2026.forEach(function(r) {
            allRows.push({
              pitcher: r.p, name: r.n || 'Unknown', team: r.t || '', season: r.s,
              overall: r.ov, fb: r.fb, brk: r.bk, off: r.of,
              totalPitches: r.tp || 0, fbPitches: r.fp || 0, brkPitches: r.bp || 0, offPitches: r.op || 0,
              era: r.era, fip: r.fip, xfip: r.xfp, xera: r.xer,
              kpct: r.kp, bbpct: r.bbp, kbbpct: r.kbb, war: r.war,
              csw: r.csw, swstr: r.sws, ip: r.ip,
              fgStuff: r.fgs, fgLoc: r.fgl, fgPit: r.fgp,
              apw: r.apw != null ? r.apw : null,
              awr: r.awr != null ? r.awr : null,
              _source: "custom_model"
            });
          });
          console.log('[load2026] Loaded ' + rows2026.length + ' custom model rows for 2026');

          // Merge public stats (ERA, FIP, xERA, K%, BB%, CSW%, WAR, IP)
          // from fg-stuffplus.json into the custom model rows, matched by MLBAM ID.
          try {
            const fgResp = await fetch('data/fg-stuffplus.json');
            if (fgResp.ok) {
              const fgData = await fgResp.json();
              const fgById = {};
              fgData.forEach(function(fg) {
                const id = fg.xMLBAMID || fg.playerid;
                if (id) fgById[String(id)] = fg;
              });
              var merged = 0;
              allRows.forEach(function(r) {
                if (r.season !== 2026 || r._source !== 'custom_model') return;
                const fg = fgById[String(r.pitcher)];
                if (!fg) return;
                if (r.era   == null && fg.ERA         != null) r.era   = parseFloat(fg.ERA);
                if (r.fip   == null && fg.FIP         != null) r.fip   = parseFloat(fg.FIP);
                if (r.xera  == null && fg.xERA        != null) r.xera  = parseFloat(fg.xERA);
                if (r.kpct  == null && fg['K%']       != null) r.kpct  = parseFloat(fg['K%']);
                if (r.bbpct == null && fg['BB%']      != null) r.bbpct = parseFloat(fg['BB%']);
                if (r.csw   == null && fg['C+SwStr%'] != null) r.csw   = parseFloat(fg['C+SwStr%']);
                if (r.war   == null && fg.WAR         != null) r.war   = parseFloat(fg.WAR);
                if (r.ip    == null && fg.IP          != null) r.ip    = parseFloat(fg.IP);
                merged++;
              });
              console.log('[load2026] Merged public stats for ' + merged + ' pitchers from FG');
            }
          } catch(e) { console.warn('[load2026] Could not merge public stats:', e.message); }

          return true;
        }
      }
    } catch(e) { console.warn('[load2026] Custom model data not available:', e.message); }

    // Fallback: load FanGraphs Stuff+ data
    try {
      const resp = await fetch('data/fg-stuffplus.json');
      if (resp.ok) {
        const fgData = await resp.json();
        if (fgData.length > 0) {
          // Remove any 2026 rows already loaded from RAW_DATA to avoid duplicates
          allRows = allRows.filter(function(r) { return r.season !== 2026; });
          fgData.forEach(function(fg) {
            // Extract name from HTML: <a href="...">Name</a>
            var name = (fg.Name || fg.PlayerName || '').replace(/<[^>]*>/g, '').trim();
            var team = (fg.Team || fg.TeamNameAbb || '').replace(/<[^>]*>/g, '').trim();
            if (team === '- - -' || team === '---') team = '';

            allRows.push({
              pitcher: fg.xMLBAMID || fg.playerid,
              name: name,
              team: team,
              season: fg.Season || 2026,
              // CRITICAL: overall is NULL here — this is the Custom XGBoost column.
              // FG Stuff+ goes ONLY into fgStuff for the FanGraphs comparison column.
              // Custom model scores come from data/stuffplus-custom.json (computed by compute_stuffplus.py).
              overall: null,
              fb: null, brk: null, off: null,
              totalPitches: fg.Pitches || 0, fbPitches: 0, brkPitches: 0, offPitches: 0,
              era: fg.ERA, fip: fg.FIP, xfip: fg.xFIP, xera: fg.xERA,
              kpct: fg['K%'] != null ? fg['K%'] * 100 : null,
              bbpct: fg['BB%'] != null ? fg['BB%'] * 100 : null,
              kbbpct: fg['K-BB%'] != null ? fg['K-BB%'] * 100 : null,
              war: fg.WAR,
              csw: fg['C+SwStr%'] != null ? fg['C+SwStr%'] * 100 : null,
              swstr: fg['SwStr%'] != null ? fg['SwStr%'] * 100 : null,
              ip: fg.IP,
              fgStuff: fg.sp_stuff, fgLoc: fg.sp_location, fgPit: fg.sp_pitching,
              apw: null, awr: null,
              _source: "fangraphs_stuffplus"
            });
          });
          console.log('[load2026] Loaded ' + fgData.length + ' FG Stuff+ rows for 2026');
          return true;
        }
      }
    } catch(e) { console.warn('[load2026] FG Stuff+ data not available:', e.message); }

    return false;
  } catch(e) {
    console.error('[load2026] Error:', e.message);
    return false;
  }
}

// ── STUFF+ 2026 LIVE FETCH ───────────────────────────────────────────────────
// Maps a FanGraphs Pitching+ (type=36) row plus a type=8 row into our Stuff+ format.
// FG type=36 fields: "Stuff+", "Location+", "Pitching+", IP, K%, BB%, ERA, FIP, WAR
//
// CRITICAL: For 2026, we do NOT have custom XGBoost model scores yet.
// FG's Stuff+ is stored in fgStuff for comparison, but the custom model 'overall'
// grade is null. The table clearly distinguishes "Custom Model" vs "FanGraphs Model".
function mapFGStuffRow(spRow, stdRow){
  // FanGraphs Stuff+ field — try several possible names
  const fgStuffVal = Math.round(
    nf(spRow["sp_stuff"] || spRow["Stuff+"] || spRow["stuff_plus"] || spRow["StuffPlus"]) || 0
  );
  if(!fgStuffVal) return null; // skip rows where FG Stuff+ is missing/zero

  const fgLoc = Math.round(nf(spRow["sp_location"] || spRow["Location+"] || spRow["location_plus"] || spRow["LocationPlus"]) || 100);
  const fgPit = Math.round(nf(spRow["sp_pitching"] || spRow["Pitching+"] || spRow["pitching_plus"] || spRow["PitchingPlus"]) || 100);

  // Counting / traditional stats from std row (type=8)
  const std = stdRow || spRow;
  const ip  = nf(std["IP"]||std["ip"]) || nf(spRow["IP"]||spRow["ip"]) || 0;
  const era = nf(std["ERA"]||std["era"]) || nf(spRow["ERA"]||spRow["era"]);
  const fip = nf(std["FIP"]||std["fip"]) || nf(spRow["FIP"]||spRow["fip"]);
  const war = nf(std["WAR"]||std["war"]) || nf(spRow["WAR"]||spRow["war"]);
  const kp  = pct(std["K%"]||std["SO%"]) || pct(spRow["K%"]||spRow["SO%"]);
  const bbp = pct(std["BB%"]) || pct(spRow["BB%"]);
  const kbb = (kp!=null && bbp!=null) ? Math.round((kp - bbp)*10)/10 : null;

  // Total pitches from IP (rough: ~15 pitches per IP)
  const tp = ip ? Math.round(ip * 15) : 0;

  const teamRaw = (std["Team"]||std["team"]||spRow["Team"]||spRow["team"]||"");
  const team    = (teamRaw==="- - -"||teamRaw==="---"||teamRaw==="TOT") ? "" : teamRaw;

  return {
    pitcher: nf(spRow["xMLBAMID"]||spRow["MLBAMID"]||std["xMLBAMID"]||std["MLBAMID"]) || null,
    name:    stripHTML(spRow["Name"]||spRow["PlayerName"]||std["Name"]||""),
    team,
    season:  2026,
    // Custom model: no scores for 2026 yet (model hasn't been run on new season data)
    overall: null, fb: null, brk: null, off: null,
    apw: null, awr: null,
    totalPitches: tp,
    fbPitches:    Math.round(tp * 0.45),
    brkPitches:   Math.round(tp * 0.30),
    offPitches:   Math.round(tp * 0.25),
    era:  era, fip:  fip, xfip: null, xera: null,
    kpct: kp!=null ? kp/100 : null,
    bbpct: bbp!=null ? bbp/100 : null,
    kbbpct: kbb!=null ? kbb/100 : null,
    war: war,
    csw:  null, swstr: null,
    ip:   ip,
    fgStuff: fgStuffVal,  // FanGraphs Stuff+ (their model, not ours)
    fgLoc:   fgLoc,
    fgPit:   fgPit,
    _source: "fg_live",
  };
}

// Async: load 2026 Stuff+ LIVE from FanGraphs via CORS proxy chain.
// Uses the same proxyFetch() + fetchFGStuffPlus() + fetchFG() functions
// defined in explorer.js (loaded before leaderboard.js).
async function load2026StuffPlusLive(){
  var statusEl = document.getElementById('loading');
  var origHtml = statusEl ? statusEl.innerHTML : '';
  try {
    if(statusEl) statusEl.innerHTML = '<div style="padding:12px;font-family:var(--fh);font-size:11px;letter-spacing:1.5px;color:var(--fg2);text-transform:uppercase">Loading 2026 Stuff+ data…</div>';

    // ── Fetch live from FanGraphs via CORS proxy chain ──
    var sp = [], std = [];

    console.log("[stuff+2026] Fetching FG Stuff+ (type=36) via CORS proxy...");
    try { sp = await fetchFGStuffPlus(2026); }
    catch(e){ console.error("[stuff+2026] FG Stuff+ fetch error:", e.message); }

    console.log("[stuff+2026] Fetching FG pitching (type=8) via CORS proxy...");
    try { std = await fetchFG(2026, "pit", 1, {}); }
    catch(e){ console.error("[stuff+2026] FG pitching fetch error:", e.message); }

    console.log("[stuff+2026] Results: Stuff+ rows=" + sp.length + ", Standard rows=" + std.length);
    if(sp.length > 0) console.log("[stuff+2026] Sample Stuff+ row fields:", Object.keys(sp[0]).slice(0,15).join(", "));

    // If type=36 (Stuff+) returns 0 rows but type=8 (standard) has data,
    // create preliminary entries using standard pitching stats.
    if(!sp.length && std.length > 0){
      console.warn("[stuff+2026] Stuff+ (type=36) returned 0 rows — using standard stats as preliminary entries");
      allRows = allRows.filter(function(r){ return r.season !== 2026; });
      var added = 0;
      std.forEach(function(r){
        var ip = nf(r["IP"]||r["ip"]) || 0;
        if(ip < 0.1) return;
        var name = stripHTML(r["Name"]||r["PlayerName"]||"");
        if(!name) return;
        var teamRaw = r["Team"]||r["team"]||"";
        var team = (teamRaw==="- - -"||teamRaw==="---"||teamRaw==="TOT") ? "" : teamRaw;
        var tp = ip ? Math.round(ip * 15) : 0;
        allRows.push({
          pitcher: nf(r["xMLBAMID"]||r["MLBAMID"]) || null,
          name: name, team: team, season: 2026,
          overall: null, fb: null, brk: null, off: null, apw: null, awr: null,
          totalPitches: tp, fbPitches: Math.round(tp*0.45), brkPitches: Math.round(tp*0.30), offPitches: Math.round(tp*0.25),
          era: nf(r["ERA"]||r["era"]), fip: nf(r["FIP"]||r["fip"]),
          xfip: nf(r["xFIP"]||r["xfip"]), xera: null,
          kpct: pct(r["K%"]||r["SO%"]) != null ? pct(r["K%"]||r["SO%"])/100 : null,
          bbpct: pct(r["BB%"]) != null ? pct(r["BB%"])/100 : null,
          kbbpct: null, war: nf(r["WAR"]||r["war"]),
          csw: null, swstr: null, ip: ip,
          fgStuff: null, fgLoc: null, fgPit: null,
          _source: "fg_std_only",
        });
        added++;
      });
      console.log("[stuff+2026] Injected "+added+" preliminary 2026 rows (standard stats only)");
      if(added > 0){
        buildSeasonTabs();
        activeSeason = 2026;
        document.querySelectorAll('#sp-season-tabs .stab').forEach(function(b){
          b.classList.toggle('active', parseInt(b.textContent)===2026);
        });
        document.querySelectorAll('#sp-season-tabs .stab').forEach(function(b){
          if(parseInt(b.textContent)===2026 && !b.querySelector('.live-dot')){
            var dot = document.createElement('span');
            dot.className = 'live-dot';
            dot.style.cssText = 'display:inline-block;width:6px;height:6px;background:#f5a623;border-radius:50%;margin-left:5px;vertical-align:middle;animation:blink 1.5s infinite';
            dot.title = 'Preliminary data — Stuff+ grades not yet available';
            b.appendChild(dot);
          }
        });
        renderTable();
      }
      if(statusEl && statusEl.innerHTML.includes('live Stuff')) statusEl.innerHTML = origHtml;
      return;
    }

    if(!sp.length){
      console.warn("[stuff+2026] FG returned 0 rows for both type=36 and type=8 — 2026 tab unavailable");
      if(statusEl) statusEl.innerHTML = origHtml;
      return;
    }

    // Build name-keyed lookup for std rows
    const stdIdx = {};
    std.forEach(function(r){ const k = normName(stripHTML(r["Name"]||r["PlayerName"]||"")); if(k) stdIdx[k]=r; });

    // Remove any pre-existing 2026 rows
    allRows = allRows.filter(function(r){ return r.season !== 2026; });

    // Map and add
    var added = 0;
    sp.forEach(function(r){
      const k = normName(stripHTML(r["Name"]||r["PlayerName"]||""));
      const mapped = mapFGStuffRow(r, stdIdx[k]||null);
      if(mapped && mapped.name){
        allRows.push(mapped);
        added++;
      }
    });

    console.log("[stuff+2026] Injected "+added+" live 2026 rows into Stuff+ leaderboard");

    if(added > 0){
      buildSeasonTabs();
      activeSeason = 2026;
      var openDay2026 = new Date("2026-03-26");
      var daysIn2026 = Math.max(0, Math.floor((new Date() - openDay2026) / 86400000));
      var minPitchVal = daysIn2026 < 7 ? 0 : daysIn2026 < 30 ? 100 : daysIn2026 < 60 ? 200 : 400;
      document.getElementById('min-pitches').value = minPitchVal;
      document.querySelectorAll('#sp-season-tabs .stab').forEach(function(b){
        b.classList.toggle('active', parseInt(b.textContent)===2026);
      });
      document.querySelectorAll('#sp-season-tabs .stab').forEach(function(b){
        if(parseInt(b.textContent)===2026 && !b.querySelector('.live-dot')){
          var dot = document.createElement('span');
          dot.className = 'live-dot';
          dot.style.cssText = 'display:inline-block;width:6px;height:6px;background:#047857;border-radius:50%;margin-left:5px;vertical-align:middle;animation:blink 1.5s infinite';
          b.appendChild(dot);
        }
      });
      renderTable();
    }
    if(statusEl && statusEl.innerHTML.includes('live Stuff')) statusEl.innerHTML = origHtml;

  } catch(e){
    console.error("[stuff+2026] Live fetch failed:", e.message);
    if(statusEl && statusEl.innerHTML.includes('live Stuff')) statusEl.innerHTML = origHtml;
  }
}

(async function init() {
  var ok = await loadData();
  if (!ok) {
    document.getElementById('loading').innerHTML = '<div class="error-msg">Could not load Stuff+ data. History file is missing or corrupted.</div>';
    return;
  }
  buildSeasonTabs();
  renderTable();
  document.getElementById('search').addEventListener('input', renderTable);
  document.getElementById('min-pitches').addEventListener('change', renderTable);
  document.getElementById('view-mode').addEventListener('change', renderTable);

  // Async-load 2026 Stuff+ data: try static files first, then live fetch
  (async function() {
    var loaded = await load2026StuffPlus();
    if (loaded) {
      // Static files found and loaded — rebuild tabs and re-render
      buildSeasonTabs();
      activeSeason = 2026;
      document.querySelectorAll('#sp-season-tabs .stab').forEach(function(b) {
        b.classList.toggle('active', parseInt(b.textContent) === 2026);
      });
      renderTable();
    } else {
      // Static files not available — try live fetch as fallback
      setTimeout(load2026StuffPlusLive, 800);
    }
  })();
})();

