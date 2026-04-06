
var allRows = [];
var activeSeason = null;
var sortCol = 'overall';
var sortDir = 'desc';

function loadData() {
  try {
    if (typeof RAW_DATA === 'undefined') {
      console.error('RAW_DATA not found');
      return false;
    }
    allRows = RAW_DATA.map(function(r) {
      return {
        pitcher: r.p, name: r.n || 'Unknown', team: r.t || '', season: r.s,
        overall: r.ov, fb: r.fb, brk: r.bk, off: r.of,
        totalPitches: r.tp || 0, fbPitches: r.fp || 0, brkPitches: r.bp || 0, offPitches: r.op || 0,
        era: r.era, fip: r.fip, xfip: r.xfp, xera: r.xer,
        kpct: r.kp, bbpct: r.bbp, kbbpct: r.kbb, war: r.war,
        csw: r.csw, swstr: r.sws, ip: r.ip,
        fgStuff: r.fgs, fgLoc: r.fgl, fgPit: r.fgp
      };
    });
    return true;
  } catch (e) { console.error('Load error:', e); return false; }
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
  return '<div class="pitch-bar">' +
    '<span class="pitch-bar-inner pitch-bar-fb" style="width:' + Math.round((row.fbPitches/total)*60) + 'px"></span>' +
    '<span class="pitch-bar-inner pitch-bar-brk" style="width:' + Math.round((row.brkPitches/total)*60) + 'px"></span>' +
    '<span class="pitch-bar-inner pitch-bar-off" style="width:' + Math.round((row.offPitches/total)*60) + 'px"></span>' +
    '</div>';
}

function buildSeasonTabs() {
  var seasonSet = {};
  allRows.forEach(function(r) { seasonSet[r.season] = true; });
  var seasons = Object.keys(seasonSet).map(Number).sort();
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

  var scores = filteredRows.map(function(r) { return r.overall; }).filter(function(v) { return v != null; });
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
  g += '<th colspan="5" class="grp-model">Custom Model Output</th>';
  c += '<th data-col="overall">Overall</th><th data-col="fb">FB</th><th data-col="brk">BRK</th><th data-col="off">OFF</th><th data-col="mix">Mix</th>';

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
    h += '<td>' + fmtGrade(r.overall,'grade-overall') + '</td>';
    h += '<td>' + fmtGrade(r.fb) + '</td>';
    h += '<td>' + fmtGrade(r.brk) + '</td>';
    h += '<td>' + fmtGrade(r.off) + '</td>';
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
    stuff_plus:    r.overall,
    location_plus: r.fgLoc,
    pitching_plus: r.fgPit
  };
  if(typeof openPlayerCard === 'function'){
    openPlayerCard(player, "pitchers").catch(function(e){ console.error("Stuff+ card error:", e); });
  }
}

// ── STUFF+ 2026 LIVE FETCH ───────────────────────────────────────────────────
// Maps a FanGraphs Pitching+ (type=36) row plus a type=8 row into our Stuff+ format.
// FG type=36 fields: "Stuff+", "Location+", "Pitching+", IP, K%, BB%, ERA, FIP, WAR
// We use FG's Stuff+ as our overall grade and derive FB/BRK/OFF from type=8 pitch vals.
function mapFGStuffRow(spRow, stdRow){
  // FanGraphs Stuff+ field — try several possible names
  // IMPORTANT: FG's actual field names are sp_stuff, sp_location, sp_pitching (verified via live API 2026-03-27)
  const ov = Math.round(
    nf(spRow["sp_stuff"] || spRow["Stuff+"] || spRow["stuff_plus"] || spRow["StuffPlus"]) || 0
  );
  if(!ov) return null; // skip rows where Stuff+ is missing/zero

  const fgLoc = Math.round(nf(spRow["sp_location"] || spRow["Location+"] || spRow["location_plus"] || spRow["LocationPlus"]) || 100);
  const fgPit = Math.round(nf(spRow["sp_pitching"] || spRow["Pitching+"] || spRow["pitching_plus"] || spRow["PitchingPlus"]) || 100);

  // Pitch-type grades: FG doesn't break these out in type=36, so we approximate:
  //  FB ≈ overall  (four-seam dominates Stuff+)
  //  BRK = weighted down slightly from overall
  //  OFF = off-speed, correlated but with higher variance
  // In future these could be fetched from FG's pitch-type detail endpoint.
  const fb  = Math.round(ov * 1.03);
  const bk  = Math.round(ov * 0.97);
  const off = Math.round(ov * 0.94);

  // Counting / traditional stats from std row (type=8)
  const std = stdRow || spRow; // fall back to using spRow fields if no std
  const ip  = nf(std["IP"]||std["ip"]) || nf(spRow["IP"]||spRow["ip"]) || 0;
  const era = nf(std["ERA"]||std["era"]) || nf(spRow["ERA"]||spRow["era"]);
  const fip = nf(std["FIP"]||std["fip"]) || nf(spRow["FIP"]||spRow["fip"]);
  const war = nf(std["WAR"]||std["war"]) || nf(spRow["WAR"]||spRow["war"]);
  const kp  = pct(std["K%"]||std["SO%"]) || pct(spRow["K%"]||spRow["SO%"]);
  const bbp = pct(std["BB%"]) || pct(spRow["BB%"]);
  const kbb = (kp!=null && bbp!=null) ? Math.round((kp - bbp)*10)/10 : null;
  const g   = nf(std["G"]||std["g"]) || nf(spRow["G"]||spRow["g"]) || 0;
  const gs  = nf(std["GS"]||std["gs"]) || nf(spRow["GS"]||spRow["gs"]) || 0;

  // Total pitches from IP (rough: ~15 pitches per IP)
  const tp = ip ? Math.round(ip * 15) : 0;

  const teamRaw = (std["Team"]||std["team"]||spRow["Team"]||spRow["team"]||"");
  const team    = (teamRaw==="- - -"||teamRaw==="---"||teamRaw==="TOT") ? "" : teamRaw;

  return {
    // IMPORTANT: Field names must match loadData() mapping — renderTable uses
    // 'overall', 'fb', 'brk', 'off' (not 'ov', 'bk', 'of' from RAW_DATA shorthand)
    pitcher: nf(spRow["xMLBAMID"]||spRow["MLBAMID"]||std["xMLBAMID"]||std["MLBAMID"]) || null,
    name:    stripHTML(spRow["Name"]||spRow["PlayerName"]||std["Name"]||""),
    team,
    season:  2026,
    overall: ov, fb: fb, brk: bk, off: off,
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
    fgStuff: ov,     // FG Stuff+ IS our stuff grade for live 2026
    fgLoc:   fgLoc,
    fgPit:   fgPit,
    _source: "fg_live",  // flag: this row came from live FG fetch
  };
}

// Async: load 2026 Stuff+ from pre-fetched static JSON files (daily cron),
// inject into allRows, rebuild season tabs, re-render.
// All mapFGStuffRow() calculations and grade logic remain exactly the same.
async function load2026StuffPlusLive(){
  var statusEl = document.getElementById('loading');
  var origHtml = statusEl ? statusEl.innerHTML : '';
  try {
    if(statusEl) statusEl.innerHTML = '<div style="padding:12px;font-family:var(--fh);font-size:11px;letter-spacing:1.5px;color:var(--fg2);text-transform:uppercase">Loading 2026 Stuff+ data…</div>';

    // Resolve base path for data files
    var dataBase = (function(){
      var scripts = document.querySelectorAll('script[src]');
      for(var i=0;i<scripts.length;i++){
        var s = scripts[i].src;
        if(s.indexOf('leaderboard')!==-1 || s.indexOf('explorer')!==-1){
          return s.replace(/js\/[^\/]+$/, 'data/');
        }
      }
      var p = location.pathname.replace(/\/[^\/]*$/, '/');
      return location.origin + p + 'data/';
    })();

    // Load pre-fetched static JSON (from GitHub Actions daily cron)
    var [spRes, stdRes] = await Promise.allSettled([
      fetch(dataBase + 'fg-stuffplus.json').then(function(r){ return r.ok ? r.json() : []; }),
      fetch(dataBase + 'fg-pit.json').then(function(r){ return r.ok ? r.json() : []; })
    ]);

    const sp  = spRes.status  === 'fulfilled' ? spRes.value  : [];
    const std = stdRes.status === 'fulfilled' ? stdRes.value : [];

    // Log results
    console.log("[stuff+2026] Stuff+ (type=36) load:", spRes.status,
      spRes.status==='fulfilled' ? sp.length+" rows" : spRes.reason?.message);
    console.log("[stuff+2026] Standard (type=8) load:", stdRes.status,
      stdRes.status==='fulfilled' ? std.length+" rows" : stdRes.reason?.message);
    if(sp.length > 0) console.log("[stuff+2026] Sample row fields:", Object.keys(sp[0]).join(", "));

    // If type=36 (Stuff+) returns 0 rows but type=8 (standard) has data,
    // create preliminary entries using standard pitching stats.
    // This handles early season when FG hasn't computed Stuff+ yet.
    if(!sp.length && std.length > 0){
      console.warn("[stuff+2026] FanGraphs Stuff+ (type=36) returned 0 rows — using standard stats (type=8) as preliminary entries");
      // Remove any pre-existing 2026 rows
      allRows = allRows.filter(function(r){ return r.season !== 2026; });
      var added = 0;
      std.forEach(function(r){
        var ip = nf(r["IP"]||r["ip"]) || 0;
        if(ip < 0.1) return; // skip pitchers with no innings
        var name = stripHTML(r["Name"]||r["PlayerName"]||"");
        if(!name) return;
        var teamRaw = r["Team"]||r["team"]||"";
        var team = (teamRaw==="- - -"||teamRaw==="---"||teamRaw==="TOT") ? "" : teamRaw;
        var tp = ip ? Math.round(ip * 15) : 0;
        allRows.push({
          pitcher: nf(r["xMLBAMID"]||r["MLBAMID"]) || null,
          name: name, team: team, season: 2026,
          overall: null, fb: null, brk: null, off: null,  // Stuff+ not available yet
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
      console.log("[stuff+2026] Injected "+added+" preliminary 2026 rows (standard stats only, Stuff+ pending)");
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
      console.warn("[stuff+2026] FanGraphs returned 0 rows for both type=36 and type=8 — live 2026 tab unavailable (season data not yet available)");
      if(statusEl) statusEl.innerHTML = origHtml;
      return;
    }

    // Build name-keyed lookup for std rows
    const stdIdx = {};
    std.forEach(function(r){ const k = normName(stripHTML(r["Name"]||r["PlayerName"]||"")); if(k) stdIdx[k]=r; });

    // Remove any pre-existing 2026 rows (in case of re-fetch)
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
      buildSeasonTabs();                        // adds 2026 tab
      activeSeason = 2026;                      // auto-select 2026
      // Set min-pitches threshold appropriate for 2026 early season
      // 2 days in → ~50-100 pitches per starter, so set to 0 to show everyone
      var openDay2026 = new Date("2026-03-26");
      var daysIn2026 = Math.max(0, Math.floor((new Date() - openDay2026) / 86400000));
      var minPitchVal = daysIn2026 < 7 ? 0 : daysIn2026 < 30 ? 100 : daysIn2026 < 60 ? 200 : 400;
      document.getElementById('min-pitches').value = minPitchVal;
      // Mark the 2026 tab as active in the UI
      document.querySelectorAll('#sp-season-tabs .stab').forEach(function(b){
        b.classList.toggle('active', parseInt(b.textContent)===2026);
      });
      // Show LIVE badge on 2026 tab
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

(function init() {
  var ok = loadData();
  if (!ok) {
    document.getElementById('loading').innerHTML = '<div class="error-msg">Could not load Stuff+ data. RAW_DATA is missing or corrupted.</div>';
    return;
  }
  buildSeasonTabs();
  renderTable();
  document.getElementById('search').addEventListener('input', renderTable);
  document.getElementById('min-pitches').addEventListener('change', renderTable);
  document.getElementById('view-mode').addEventListener('change', renderTable);

  // Async-load live 2026 Stuff+ data after the static data is shown
  setTimeout(load2026StuffPlusLive, 800);
})();

