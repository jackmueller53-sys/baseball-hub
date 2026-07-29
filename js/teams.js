/* ══════════════════════════════════════════════════════════════════════════
   TEAMS DASHBOARD — Stats Explorer sub-mode
   ──────────────────────────────────────────────────────────────────────────
   Adds a third "Teams" button beside Hitters / Pitchers inside the existing
   Stats Explorer tab. When active:
     • The player chart/table cards are hidden.
     • A team-level scatter renders into #svg-teams (30 dots, one per team).
     • A team-cards grid renders below — click any dot or card for a roster
       breakdown (lineup, rotation, key relievers).
   Reads data/fg-bat.json + data/fg-pit.json directly — no dependency on
   explorer.js internals beyond toggling DOM visibility.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── State ──
  let _bat = [], _pit = [];
  let _teams = [];                  // aggregated team rows
  let _rosters = null;              // data/rosters.json (authoritative team membership)
  let _reconStats = null;           // { moved, updatedAt } summary for the verify badge
  let _xKey = 'wrcPlus', _yKey = 'eraMinus';
  let _loaded = false, _loading = null;

  // ── Helpers ──
  const $ = (id) => document.getElementById(id);
  const esc = (s) => s == null ? '' : String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const stripHTML = (s) => s ? String(s).replace(/<[^>]*>/g, '').trim() : '';
  const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : null; };
  const TEAM_NAME = {
    ARI: 'Diamondbacks', ATH: 'Athletics', ATL: 'Braves', BAL: 'Orioles',
    BOS: 'Red Sox', CHC: 'Cubs', CHW: 'White Sox', CWS: 'White Sox',
    CIN: 'Reds', CLE: 'Guardians', COL: 'Rockies', DET: 'Tigers',
    HOU: 'Astros', KC: 'Royals', KCR: 'Royals', LAA: 'Angels', LAD: 'Dodgers',
    MIA: 'Marlins', MIL: 'Brewers', MIN: 'Twins', NYM: 'Mets', NYY: 'Yankees',
    OAK: 'Athletics', PHI: 'Phillies', PIT: 'Pirates', SD: 'Padres',
    SDP: 'Padres', SEA: 'Mariners', SF: 'Giants', SFG: 'Giants',
    STL: 'Cardinals', TB: 'Rays', TBR: 'Rays', TEX: 'Rangers',
    TOR: 'Blue Jays', WSN: 'Nationals', WSH: 'Nationals',
  };

  // Axis catalog
  const AXES = [
    { k:'wrcPlus',   lbl:'Team wRC+',      side:'b', d:'Weighted Runs Created+ (100 = lg avg)',     dir:1  },
    { k:'wOBA',      lbl:'Team wOBA',      side:'b', d:'Weighted On-Base Average',                  dir:1  },
    { k:'avg',       lbl:'Team AVG',       side:'b', d:'Batting average',                           dir:1  },
    { k:'obp',       lbl:'Team OBP',       side:'b', d:'On-base percentage',                        dir:1  },
    { k:'slg',       lbl:'Team SLG',       side:'b', d:'Slugging percentage',                       dir:1  },
    { k:'iso',       lbl:'Team ISO',       side:'b', d:'Isolated Power (SLG - AVG)',                dir:1  },
    { k:'hr',        lbl:'Team HR',        side:'b', d:'Total home runs',                           dir:1  },
    { k:'bbPct',     lbl:'Off BB%',        side:'b', d:'Walk rate, offense',                        dir:1  },
    { k:'kPct',      lbl:'Off K%',         side:'b', d:'Strikeout rate, offense',                   dir:-1 },
    { k:'sb',        lbl:'Team SB',        side:'b', d:'Stolen bases',                              dir:1  },
    { k:'batWAR',    lbl:'Bat WAR',        side:'b', d:'Position-player WAR (sum)',                 dir:1  },
    { k:'era',       lbl:'Team ERA',       side:'p', d:'Earned Run Average',                        dir:-1 },
    { k:'fip',       lbl:'Team FIP',       side:'p', d:'Fielding Independent Pitching',             dir:-1 },
    { k:'xFIP',      lbl:'Team xFIP',      side:'p', d:'Expected FIP',                              dir:-1 },
    { k:'whip',      lbl:'Team WHIP',      side:'p', d:'Walks + Hits per IP',                       dir:-1 },
    { k:'kPctP',     lbl:'Pit K%',         side:'p', d:'Strikeout rate, pitching',                  dir:1  },
    { k:'bbPctP',    lbl:'Pit BB%',        side:'p', d:'Walk rate, pitching',                       dir:-1 },
    { k:'pitWAR',    lbl:'Pit WAR',        side:'p', d:'Pitching WAR (sum)',                        dir:1  },
    { k:'eraMinus',  lbl:'ERA−',           side:'p', d:'ERA scaled (100 = avg; lower is better)',   dir:-1 },
    { k:'wrcMinus',  lbl:'wRC+ allowed*',  side:'p', d:'Estimated wRC+ allowed (FIP-derived proxy)', dir:-1 },
    { k:'runDiff',   lbl:'Run Differential', side:'t', d:'Bat WAR − Pit WAR (lite proxy)',          dir:1  },
  ];
  function axBy(k) { return AXES.find(a => a.k === k) || AXES[0]; }

  // ── Data load ──
  async function load() {
    if (_loaded) return;
    if (_loading) return _loading;
    _loading = (async () => {
      try {
        // Prefer fg-pit-all.json (qual=0; includes relievers). Fall back to
        // qualified fg-pit.json when the all-pitchers file isn't on disk yet.
        async function loadPit() {
          try {
            const r = await fetch('data/fg-pit-all.json');
            if (r.ok) return r.json();
          } catch (_) {}
          return fetch('data/fg-pit.json').then(r => r.json());
        }
        // rosters.json is optional — if the fetch/parse fails the dashboard
        // still works, it just falls back to FanGraphs team attribution.
        async function loadRosters() {
          try {
            const r = await fetch('data/rosters.json', { cache: 'no-cache' });
            if (r.ok) return r.json();
          } catch (_) {}
          return null;
        }
        const [bat, pit, rosters] = await Promise.all([
          fetch('data/fg-bat.json').then(r => r.json()),
          loadPit(),
          loadRosters(),
        ]);
        _rosters = (rosters && rosters.byPlayer) ? rosters : null;
        _bat = (Array.isArray(bat) ? bat : []).map((r) => ({
          ...r,
          PlayerName: stripHTML(r.PlayerName || r.Name),
          Team:       stripHTML(r.TeamNameAbb || r.Team || ''),
        }));
        _pit = (Array.isArray(pit) ? pit : []).map((r) => ({
          ...r,
          PlayerName: stripHTML(r.PlayerName || r.Name),
          Team:       stripHTML(r.TeamNameAbb || r.Team || ''),
        }));
        aggregate();
        _loaded = true;
      } catch (e) {
        console.error('[teams] data load failed', e);
      }
    })();
    return _loading;
  }

  // ── Aggregate to 30 teams ──
  function aggregate() {
    // FanGraphs returns ONE combined row for a player who changed teams
    // mid-season: Team === "2 Tms"/"3 Tms" (teamid 0). That row still carries
    // `playerTeamId` — the id of the club the player is on NOW. Build a clean
    // teamid→abbr map from the single-team rows, then attribute each traded
    // player to their current team so they appear on the correct card.
    const idMap = new Map();
    for (const r of [..._bat, ..._pit]) {
      const a = r.Team, tid = r.teamid;
      if (a && a.length <= 4 && Number.isInteger(tid) && tid > 0 && !idMap.has(tid)) {
        idMap.set(tid, a);
      }
    }
    // → { team, traded } or null when the player has no current club
    // (playerTeamId ≤ 0 = free agent) and should be dropped.
    function resolveTeam(r) {
      const a = r.Team;
      if (a && a.length <= 4) return { team: a, traded: false };
      const cur = idMap.get(r.playerTeamId);
      return cur ? { team: cur, traded: true } : null;
    }

    // ROSTER VERIFICATION — data/rosters.json (MLB Stats API 40-man) is the
    // authoritative source for which club a player is on RIGHT NOW. Around the
    // trade deadline the stat feed lags; the roster does not. So the roster's
    // team wins when it disagrees with FanGraphs. Join by MLBAM id.
    const byPlayer = _rosters ? _rosters.byPlayer : null;
    let reassigned = 0;

    // → { team, off, origin } | null. `off` = stats don't cleanly belong to
    // this club (traded/reassigned) → keep on roster list, drop from aggregate
    // means. `origin` labels the chip ("2 Tms" or the ex-club abbr).
    function resolve(r) {
      const fg = resolveTeam(r);
      const mid = r.xMLBAMID;
      const rosterTeam = (byPlayer && mid != null) ? byPlayer[String(mid)] : undefined;
      if (rosterTeam) {
        const fgTeam = fg ? fg.team : null;
        const movedByRoster = !!fg && !fg.traded && fgTeam !== rosterTeam;
        if (movedByRoster) reassigned++;
        const off = fg ? (fg.traded || fgTeam !== rosterTeam) : true;
        const origin = fg ? (fg.traded ? '2 Tms' : (movedByRoster ? fgTeam : null)) : null;
        return { team: rosterTeam, off, origin };
      }
      // Not on any current 40-man (FA / DFA / minors): keep FG attribution.
      if (!fg) return null;
      return { team: fg.team, off: fg.traded, origin: fg.traded ? '2 Tms' : null };
    }

    const byTeam = new Map();
    function add(r, side) {
      const res = resolve(r);
      if (!res) return;
      if (!byTeam.has(res.team)) byTeam.set(res.team, { team: res.team, bat: [], pit: [] });
      byTeam.get(res.team)[side].push(
        res.off ? { ...r, _traded: true, _origin: res.origin } : r
      );
    }
    for (const r of _bat) add(r, 'bat');
    for (const r of _pit) add(r, 'pit');
    _teams = [...byTeam.values()].map(buildTeamRow).filter(Boolean);
    _reconStats = _rosters
      ? { reassigned, updatedAt: _rosters.updatedAt, players: _rosters.playerCount || 0 }
      : null;
  }

  function weightedMean(rows, valueKey, weightKey) {
    let n = 0, d = 0;
    for (const r of rows) {
      const v = num(r[valueKey]); const w = num(r[weightKey]);
      if (v != null && w != null && w > 0) { n += v * w; d += w; }
    }
    return d > 0 ? n / d : null;
  }
  function sumOf(rows, k) {
    let s = 0;
    for (const r of rows) { const v = num(r[k]); if (v != null) s += v; }
    return s;
  }

  function buildTeamRow(t) {
    const bat = t.bat, pit = t.pit;
    if (!bat.length && !pit.length) return null;
    // Roster lists (lineup/rotation/relievers) use the full arrays so traded-in
    // players show up; aggregate stat means use only whole-season-here players
    // so a traded player's two-club line doesn't distort the team totals.
    const batAgg = bat.filter(r => !r._traded);
    const pitAgg = pit.filter(r => !r._traded);

    // ── Offense ──
    const totalPA = sumOf(batAgg, 'PA');
    const totalAB = sumOf(batAgg, 'AB');
    const wrcPlus = weightedMean(batAgg, 'wRC+', 'PA');
    const wOBA    = weightedMean(batAgg, 'wOBA', 'PA');
    const avg     = weightedMean(batAgg, 'AVG', 'AB');
    const obp     = weightedMean(batAgg, 'OBP', 'PA');
    const slg     = weightedMean(batAgg, 'SLG', 'AB');
    const iso     = (slg != null && avg != null) ? slg - avg : null;
    const hr      = sumOf(batAgg, 'HR');
    const sb      = sumOf(batAgg, 'SB');
    const batWAR  = sumOf(batAgg, 'WAR');
    const kPct    = weightedMean(batAgg, 'K%', 'PA');
    const bbPct   = weightedMean(batAgg, 'BB%', 'PA');

    // ── Pitching ──
    const totalIP = sumOf(pitAgg, 'IP');
    const era     = weightedMean(pitAgg, 'ERA', 'IP');
    const fip     = weightedMean(pitAgg, 'FIP', 'IP');
    const xFIP    = weightedMean(pitAgg, 'xFIP', 'IP');
    const whip    = weightedMean(pitAgg, 'WHIP', 'IP');
    const kPctP   = weightedMean(pitAgg, 'K%', 'IP');
    const bbPctP  = weightedMean(pitAgg, 'BB%', 'IP');
    const pitWAR  = sumOf(pitAgg, 'WAR');

    // Rough ERA- proxy (relative to league avg ~4.20 for 2026, recalculated below globally)
    const eraMinus = era != null ? Math.round((era / 4.20) * 100) : null;
    const wrcMinus = fip != null ? Math.round((fip / 4.20) * 100) : null;
    const runDiff  = (batWAR != null && pitWAR != null) ? batWAR - pitWAR : null;

    return {
      team: t.team,
      teamName: TEAM_NAME[t.team] || t.team,
      _bat: bat, _pit: pit,
      totalPA, totalAB, totalIP,
      n_bat: bat.length, n_pit: pit.length,
      wrcPlus, wOBA, avg, obp, slg, iso, hr, sb, batWAR, kPct, bbPct,
      era, fip, xFIP, whip, kPctP, bbPctP, pitWAR, eraMinus, wrcMinus,
      runDiff,
    };
  }

  // ── Roster picks ──
  function lineup(team) {
    return team._bat.slice().sort((a, b) => (b.PA || 0) - (a.PA || 0)).slice(0, 9);
  }
  function rotation(team) {
    return team._pit.slice()
      .filter(p => (p.GS || 0) > 0)
      .sort((a, b) => (b.GS || 0) - (a.GS || 0))
      .slice(0, 5);
  }
  function keyRelievers(team) {
    // Names already shown in the Rotation section — never also list a pitcher
    // as a "key reliever" (a swingman with, say, 8 GS / 20 G slips past the
    // GS/G < 0.5 test and, being high-IP, wins the IP-leader pick, so the same
    // arm appeared in BOTH sections — e.g. Manaea, Reynaldo López).
    const starterNames = new Set(rotation(team).map(p => p.PlayerName));
    // Position players who threw mop-up innings pollute fg-pit-all.json: a
    // catcher/INF with a real batting line (>=50 PA) and only a few IP is not
    // a reliever. Their tiny-sample K% can even win the "highest K%" closer
    // fallback below, so exclude them from the staff view entirely.
    const posPlayerPA = new Set(
      team._bat.filter(b => (num(b.PA) || 0) >= 50).map(b => b.PlayerName)
    );
    const isPositionPlayer = (p) =>
      posPlayerPA.has(p.PlayerName) && (num(p.IP) || 0) < 15;

    const relievers = team._pit.filter(p => {
      const g = p.G || 0, gs = p.GS || 0;
      if (g === 0) return false;
      if (starterNames.has(p.PlayerName)) return false;
      if (isPositionPlayer(p)) return false;
      return (gs / g) < 0.5;
    });
    if (relievers.length === 0) return [];
    const out = [];
    const ipLeader = relievers.slice().sort((a, b) => (b.IP || 0) - (a.IP || 0))[0];
    if (ipLeader) out.push({ ...ipLeader, _label: 'IP leader' });
    const svLeader = relievers.slice().sort((a, b) => (b.SV || 0) - (a.SV || 0))[0];
    if (svLeader && (svLeader.SV || 0) > 0 && svLeader.PlayerName !== ipLeader.PlayerName) {
      out.push({ ...svLeader, _label: 'SV leader' });
    } else if (!svLeader || (svLeader.SV || 0) === 0) {
      // No saves yet — pick the highest-K reliever as the de-facto closer
      const kLeader = relievers.slice()
        .filter(r => r.PlayerName !== ipLeader.PlayerName)
        .sort((a, b) => (num(b['K%']) || 0) - (num(a['K%']) || 0))[0];
      if (kLeader) out.push({ ...kLeader, _label: 'highest K%' });
    }
    return out;
  }

  // ── Scatter render ──
  function renderScatter() {
    const svg = $('svg-teams'); if (!svg) return;
    const W = 900, H = 470, PAD = { t: 26, r: 22, b: 50, l: 54 };
    const IW = W - PAD.l - PAD.r, IH = H - PAD.t - PAD.b;
    const xA = axBy(_xKey), yA = axBy(_yKey);
    const pts = _teams.map(t => ({ t, x: num(t[_xKey]), y: num(t[_yKey]) }))
      .filter(p => p.x != null && p.y != null);
    if (pts.length === 0) {
      svg.innerHTML = `<text x="${W/2}" y="${H/2}" text-anchor="middle" fill="#6b88aa"
        font-family="Barlow Condensed" font-size="14" letter-spacing="2">NO DATA</text>`;
      return;
    }
    const xVals = pts.map(p => p.x), yVals = pts.map(p => p.y);
    const xMin = Math.min(...xVals), xMax = Math.max(...xVals);
    const yMin = Math.min(...yVals), yMax = Math.max(...yVals);
    const xPad = (xMax - xMin) * 0.08 || 1, yPad = (yMax - yMin) * 0.08 || 1;
    const xLo = xMin - xPad, xHi = xMax + xPad;
    const yLo = yMin - yPad, yHi = yMax + yPad;
    // Axis orientation: when a stat's "good" direction is LOWER (ERA, FIP,
    // ERA−, K%-against, etc., dir === -1), invert the mapping so elite
    // teams still plot toward the upper-right of the chart. Ticks invert
    // naturally because we generate them from the same domain endpoints.
    const xFlip = xA.dir === -1, yFlip = yA.dir === -1;
    const sx = (v) => xFlip
      ? PAD.l + IW - ((v - xLo) / (xHi - xLo)) * IW
      : PAD.l + ((v - xLo) / (xHi - xLo)) * IW;
    const sy = (v) => yFlip
      ? PAD.t + ((v - yLo) / (yHi - yLo)) * IH
      : PAD.t + IH - ((v - yLo) / (yHi - yLo)) * IH;

    // Means for quadrants
    const xAvg = xVals.reduce((a, b) => a + b, 0) / xVals.length;
    const yAvg = yVals.reduce((a, b) => a + b, 0) / yVals.length;
    const cx = sx(xAvg), cy = sy(yAvg);

    let bg = '';
    // Quadrant guide lines
    bg += `<line x1="${cx}" y1="${PAD.t}" x2="${cx}" y2="${PAD.t + IH}" stroke="rgba(45,36,24,.08)" stroke-width="1" stroke-dasharray="4 3"/>`;
    bg += `<line x1="${PAD.l}" y1="${cy}" x2="${PAD.l + IW}" y2="${cy}" stroke="rgba(45,36,24,.08)" stroke-width="1" stroke-dasharray="4 3"/>`;
    // Frame
    bg += `<rect x="${PAD.l}" y="${PAD.t}" width="${IW}" height="${IH}" fill="none" stroke="rgba(45,36,24,.12)"/>`;
    // Axis ticks (5)
    function ticks(lo, hi, n=5) { const a=[]; for (let i=0;i<=n;i++) a.push(lo + (hi-lo)*i/n); return a; }
    for (const xv of ticks(xLo, xHi)) {
      bg += `<text x="${sx(xv)}" y="${PAD.t + IH + 14}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8a8278">${fmtTick(xv, _xKey)}</text>`;
    }
    for (const yv of ticks(yLo, yHi)) {
      bg += `<text x="${PAD.l - 6}" y="${sy(yv) + 3}" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="#8a8278">${fmtTick(yv, _yKey)}</text>`;
    }
    // Axis labels
    bg += `<text x="${PAD.l + IW/2}" y="${H - 8}" text-anchor="middle" font-family="Barlow Condensed" font-size="11" letter-spacing="2" fill="#5e574e" text-transform="uppercase">${esc(xA.lbl)}</text>`;
    bg += `<text x="${14}" y="${PAD.t + IH/2}" text-anchor="middle" font-family="Barlow Condensed" font-size="11" letter-spacing="2" fill="#5e574e" transform="rotate(-90 14 ${PAD.t + IH/2})">${esc(yA.lbl)}</text>`;

    let dots = '';
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]; const xp = sx(p.x), yp = sy(p.y);
      const col = quadColor(p.x, p.y, xAvg, yAvg, xA.dir, yA.dir);
      // Team abbreviation as label inside the dot
      dots += `<g class="team-dot" data-team="${esc(p.t.team)}" style="cursor:pointer">
        <circle cx="${xp}" cy="${yp}" r="14" fill="${col}" fill-opacity=".82" stroke="#1d1916" stroke-opacity=".4"/>
        <text x="${xp}" y="${yp + 3}" text-anchor="middle" font-family="Barlow Condensed" font-size="9" font-weight="700" letter-spacing="1" fill="#fff">${esc(p.t.team)}</text>
      </g>`;
    }

    svg.innerHTML = `<title>${esc(xA.lbl)} vs ${esc(yA.lbl)}</title>` + bg + dots;
    // Click handlers
    svg.querySelectorAll('.team-dot').forEach((g) => {
      g.addEventListener('click', () => openTeamCard(g.dataset.team));
    });

    // Update title text
    const titleEl = $('t-c-title');
    if (titleEl) titleEl.innerHTML = `${esc(yA.lbl)} <em>vs</em> ${esc(xA.lbl)}`;
    const subEl = $('t-c-sub');
    if (subEl) subEl.textContent = `${pts.length} teams · hover for stats · click any dot or card for roster breakdown`;
  }

  function quadColor(x, y, xAvg, yAvg, xDir, yDir) {
    // Up & right = elite (green), down & left = poor (red), mixed = neutral.
    const xGood = xDir === 1 ? x >= xAvg : x <= xAvg;
    const yGood = yDir === 1 ? y >= yAvg : y <= yAvg;
    if (xGood && yGood) return '#047857';
    if (!xGood && !yGood) return '#b7472a';
    return '#a99e8e';
  }
  function fmtTick(v, key) {
    const a = axBy(key);
    if (['avg', 'obp', 'slg', 'iso', 'wOBA'].includes(a.k)) return v.toFixed(3);
    if (['kPct', 'bbPct', 'kPctP', 'bbPctP'].includes(a.k)) return ((v > 1 ? v : v * 100).toFixed(1));
    return Math.round(v).toString();
  }
  function fmtVal(v, key) {
    if (v == null) return '—';
    const a = axBy(key);
    if (['avg', 'obp', 'slg', 'iso', 'wOBA'].includes(a.k)) return v.toFixed(3);
    if (['era', 'fip', 'xFIP', 'whip'].includes(a.k)) return v.toFixed(2);
    if (['kPct', 'bbPct', 'kPctP', 'bbPctP'].includes(a.k)) return (v > 1 ? v : v * 100).toFixed(1) + '%';
    if (['batWAR', 'pitWAR', 'runDiff'].includes(a.k)) return v.toFixed(1);
    return Math.round(v).toString();
  }

  // ── Team cards grid ──
  function renderGrid() {
    const wrap = $('teams-grid'); if (!wrap) return;
    const sorted = _teams.slice().sort((a, b) => {
      const dir = axBy(_yKey).dir;
      const av = num(a[_yKey]); const bv = num(b[_yKey]);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return dir === 1 ? bv - av : av - bv;
    });
    const yA = axBy(_yKey), xA = axBy(_xKey);
    wrap.innerHTML = sorted.map((t, i) => `
      <button class="team-card" data-team="${esc(t.team)}" type="button">
        <div class="team-card-head">
          <span class="team-abbr">${esc(t.team)}</span>
          <span class="team-name">${esc(t.teamName)}</span>
          <span class="team-rank">#${i + 1}</span>
        </div>
        <div class="team-card-stats">
          <div class="tcs"><span class="tcs-lbl">${esc(yA.lbl)}</span><span class="tcs-val">${fmtVal(num(t[_yKey]), _yKey)}</span></div>
          <div class="tcs"><span class="tcs-lbl">${esc(xA.lbl)}</span><span class="tcs-val">${fmtVal(num(t[_xKey]), _xKey)}</span></div>
        </div>
        <div class="team-card-sub">
          ${t.n_bat} batters · ${t.n_pit} pitchers · ${Math.round(t.totalIP || 0)} IP
        </div>
      </button>
    `).join('');
    wrap.querySelectorAll('.team-card').forEach((btn) => {
      btn.addEventListener('click', () => openTeamCard(btn.dataset.team));
    });
  }

  // ── Team card modal ──
  function openTeamCard(teamAbbr) {
    const t = _teams.find(x => x.team === teamAbbr);
    if (!t) return;
    const lo = lineup(t), rot = rotation(t), rel = keyRelievers(t);
    const content = $('tc-overlay-content');
    content.innerHTML = `
      <div class="tc-head">
        <div>
          <div class="tc-abbr">${esc(t.team)}</div>
          <div class="tc-name">${esc(t.teamName)}</div>
        </div>
        <div class="tc-marks">
          <span class="tcm">wRC+ <b>${fmtVal(t.wrcPlus, 'wrcPlus')}</b></span>
          <span class="tcm">wOBA <b>${fmtVal(t.wOBA, 'wOBA')}</b></span>
          <span class="tcm">ERA <b>${fmtVal(t.era, 'era')}</b></span>
          <span class="tcm">FIP <b>${fmtVal(t.fip, 'fip')}</b></span>
          <span class="tcm">Bat WAR <b>${fmtVal(t.batWAR, 'batWAR')}</b></span>
          <span class="tcm">Pit WAR <b>${fmtVal(t.pitWAR, 'pitWAR')}</b></span>
        </div>
      </div>

      <div class="tc-grid">
        <div class="tc-section">
          <div class="tc-section-h">Starting Lineup <em>(top 9 by PA)</em></div>
          <table class="tc-roster">
            <thead><tr>
              <th>#</th><th>Batter</th><th class="num">PA</th><th class="num">AVG</th>
              <th class="num">OBP</th><th class="num">SLG</th><th class="num">HR</th>
              <th class="num">wRC+</th><th class="num">WAR</th>
            </tr></thead>
            <tbody>${lo.map((b, i) => `<tr>
              <td>${i + 1}</td>
              <td>${esc(b.PlayerName)}${tradedTag(b)}<small>${esc(b.Bats || '?')}HB</small></td>
              <td class="num">${b.PA || 0}</td>
              <td class="num">${(num(b.AVG)||0).toFixed(3)}</td>
              <td class="num">${(num(b.OBP)||0).toFixed(3)}</td>
              <td class="num">${(num(b.SLG)||0).toFixed(3)}</td>
              <td class="num">${b.HR || 0}</td>
              <td class="num">${Math.round(num(b['wRC+'])||0)}</td>
              <td class="num">${(num(b.WAR)||0).toFixed(1)}</td>
            </tr>`).join('') || '<tr><td colspan="9" class="hint">No batters in dataset.</td></tr>'}</tbody>
          </table>
        </div>

        <div class="tc-section">
          <div class="tc-section-h">Rotation <em>(top 5 by GS)</em></div>
          <table class="tc-roster">
            <thead><tr>
              <th>#</th><th>Starter</th><th class="num">GS</th><th class="num">IP</th>
              <th class="num">ERA</th><th class="num">FIP</th><th class="num">K%</th>
              <th class="num">BB%</th><th class="num">WAR</th>
            </tr></thead>
            <tbody>${rot.map((p, i) => `<tr>
              <td>${i + 1}</td>
              <td>${esc(p.PlayerName)}${tradedTag(p)}<small>${esc(p.Throws || '?')}HP</small></td>
              <td class="num">${p.GS || 0}</td>
              <td class="num">${(num(p.IP) || 0).toFixed(1)}</td>
              <td class="num">${(num(p.ERA) || 0).toFixed(2)}</td>
              <td class="num">${(num(p.FIP) || 0).toFixed(2)}</td>
              <td class="num">${pctTxt(p['K%'])}</td>
              <td class="num">${pctTxt(p['BB%'])}</td>
              <td class="num">${(num(p.WAR)||0).toFixed(1)}</td>
            </tr>`).join('') || '<tr><td colspan="9" class="hint">No starters in dataset.</td></tr>'}</tbody>
          </table>
        </div>

        <div class="tc-section">
          <div class="tc-section-h">Key Relievers</div>
          ${rel.length === 0
            ? '<div class="hint" style="padding:8px">No qualifying relievers in current dataset.</div>'
            : `<table class="tc-roster">
              <thead><tr>
                <th>Role</th><th>Pitcher</th><th class="num">G</th><th class="num">IP</th>
                <th class="num">SV</th><th class="num">ERA</th><th class="num">FIP</th>
                <th class="num">K%</th><th class="num">WAR</th>
              </tr></thead>
              <tbody>${rel.map(p => `<tr>
                <td class="tag-cell">${esc(p._label)}</td>
                <td>${esc(p.PlayerName)}${tradedTag(p)}<small>${esc(p.Throws || '?')}HP</small></td>
                <td class="num">${p.G || 0}</td>
                <td class="num">${(num(p.IP) || 0).toFixed(1)}</td>
                <td class="num">${p.SV || 0}</td>
                <td class="num">${(num(p.ERA) || 0).toFixed(2)}</td>
                <td class="num">${(num(p.FIP) || 0).toFixed(2)}</td>
                <td class="num">${pctTxt(p['K%'])}</td>
                <td class="num">${(num(p.WAR)||0).toFixed(1)}</td>
              </tr>`).join('')}</tbody>
            </table>`
          }
        </div>
      </div>
    `;
    $('tc-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function pctTxt(v) {
    const n = num(v); if (n == null) return '—';
    return (n > 1 ? n : n * 100).toFixed(1) + '%';
  }
  // Marks a player attributed here from a mid-season trade — their line is
  // combined across teams, so it's shown on the roster but not in the totals.
  function tradedTag(x) {
    if (!x || !x._traded) return '';
    const label = (x._origin && x._origin !== '2 Tms') ? 'ex-' + x._origin : '2 Tms';
    const title = (x._origin && x._origin !== '2 Tms')
      ? 'Roster-verified move — season stats are from ' + x._origin
      : 'Season stats combined across multiple teams';
    return ' <span class="tc-traded" title="' + esc(title) + '">' + esc(label) + '</span>';
  }
  window.closeTeamCard = function () {
    const ov = $('tc-overlay');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  };
  // Click overlay backdrop or Esc to close
  document.addEventListener('click', (e) => {
    const ov = $('tc-overlay'); if (!ov) return;
    if (e.target === ov) window.closeTeamCard();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeTeamCard();
  });

  // ── Axis pickers (use existing #x-sel and #y-sel; we swap their options) ──
  let _origXOpts, _origYOpts, _origMinV;
  function activateTeamsMode() {
    // Hide player-mode chart/table cards
    document.querySelector('#app-explorer .chart-card').style.display = 'none';
    document.querySelector('#app-explorer .tbl-card').style.display = 'none';
    $('teams-view').hidden = false;

    // Hide filters that don't apply to teams
    const card = (el) => el && el.closest && el.closest('.card');
    [card($('age-mn')), card($('min-v')), card($('role-row')), card($('srch')), card($('tm-sel'))]
      .forEach(c => { if (c) c.style.display = 'none'; });

    // Swap axis options
    const xSel = $('x-sel'), ySel = $('y-sel');
    if (!_origXOpts) { _origXOpts = xSel.innerHTML; _origYOpts = ySel.innerHTML; }
    const opts = AXES.map(a => `<option value="${a.k}">${esc(a.lbl)}</option>`).join('');
    xSel.innerHTML = opts; ySel.innerHTML = opts;
    xSel.value = _xKey; ySel.value = _yKey;

    // Wire onchange to teams render — preserve original later
    xSel.onchange = () => { _xKey = xSel.value; renderScatter(); renderGrid(); };
    ySel.onchange = () => { _yKey = ySel.value; renderScatter(); renderGrid(); };

    // Load data + render
    load().then(() => {
      renderScatter();
      renderGrid();
      renderVerifyBadge();
      const cnt = $('p-cnt'); if (cnt) cnt.textContent = String(_teams.length);
      const lbl = document.querySelector('.count-lbl'); if (lbl) lbl.textContent = 'Teams Shown';
    });
  }

  // Roster-verification badge in the Teams header. Shows the source + how
  // fresh the roster snapshot is, and how many trade moves the reconciliation
  // applied on top of FanGraphs — so it's obvious the cards stay current
  // through the deadline (and obvious when the snapshot goes stale).
  function renderVerifyBadge() {
    const el = $('roster-verify'); if (!el) return;
    if (!_reconStats) {
      el.hidden = false;
      el.className = 'roster-verify rv-warn';
      el.innerHTML = '<span class="rv-dot"></span>Roster check unavailable — showing FanGraphs team data';
      return;
    }
    const upd = new Date(_reconStats.updatedAt);
    const ageH = (Date.now() - upd.getTime()) / 36e5;
    const ageTxt = ageH < 1 ? 'just now'
      : ageH < 36 ? Math.round(ageH) + 'h ago'
      : Math.round(ageH / 24) + 'd ago';
    const dateTxt = isNaN(upd) ? 'unknown' : upd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const stale = ageH > 72;   // >3 days without a refresh
    const moves = _reconStats.reassigned;
    const movesTxt = moves > 0
      ? ` · ${moves} trade move${moves === 1 ? '' : 's'} applied`
      : ' · all rosters current';
    el.hidden = false;
    el.className = 'roster-verify' + (stale ? ' rv-warn' : ' rv-ok');
    el.innerHTML = `<span class="rv-dot"></span>`
      + (stale
          ? `Roster data ${ageTxt} — may lag recent trades`
          : `Rosters verified vs MLB.com · ${dateTxt} (${ageTxt})${movesTxt}`);
  }

  function deactivateTeamsMode() {
    document.querySelector('#app-explorer .chart-card').style.display = '';
    document.querySelector('#app-explorer .tbl-card').style.display = '';
    $('teams-view').hidden = true;
    const rv = $('roster-verify'); if (rv) rv.hidden = true;
    // Restore filter visibility
    document.querySelectorAll('#app-explorer .sidebar .card').forEach(c => { c.style.display = ''; });
    const role = $('role-row'); if (role) role.style.display = 'none'; // explorer manages this
    // Restore axis options
    const xSel = $('x-sel'), ySel = $('y-sel');
    if (_origXOpts && xSel) xSel.innerHTML = _origXOpts;
    if (_origYOpts && ySel) ySel.innerHTML = _origYOpts;
    xSel.onchange = null; ySel.onchange = null;
    if (typeof window.render === 'function') window.render();
    const lbl = document.querySelector('.count-lbl'); if (lbl) lbl.textContent = 'Players Shown';
  }

  // Public hooks
  window.setTeamsMode = function (btn) {
    document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    activateTeamsMode();
  };

  // When user clicks Hitters or Pitchers, deactivate teams mode first.
  // We wrap the existing setModeBtn — defer until after explorer.js loads.
  window.addEventListener('load', () => {
    const orig = window.setModeBtn;
    if (typeof orig !== 'function') return;
    window.setModeBtn = function (btn) {
      if (!$('teams-view').hidden) deactivateTeamsMode();
      return orig(btn);
    };
  });
})();
