/* ══════════════════════════════════════════════════════════════════════════
   BASEBALL HUB — LIVE POSTSEASON
   ──────────────────────────────────────────────────────────────────────────
   A self-contained, client-side live view of the MLB postseason. Fetches the
   public MLB Stats API postseason schedule (CORS-open, no auth, no key) and
   renders a bracket + a live/upcoming games strip, auto-refreshing so scores
   update in-game without a reload. No server pipeline — nothing to break the
   rest of the site.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SEASON = new Date().getUTCFullYear();
  // Allow ?season=YYYY override (useful off-season / for testing).
  var qs = new URLSearchParams(location.search);
  if (qs.get('season')) SEASON = parseInt(qs.get('season'), 10) || SEASON;

  var API = function (s) {
    return 'https://statsapi.mlb.com/api/v1/schedule/postseason?season=' + s +
      '&sportId=1&hydrate=team,linescore,seriesStatus';
  };
  var LOGO = function (id) { return 'https://www.mlbstatic.com/team-logos/' + id + '.svg'; };
  var REFRESH_MS = 45000;
  var _timer = null, _lastGames = null;

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return s == null ? '' : String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };

  var ROUND = { F: 'Wild Card', D: 'Division Series', L: 'Championship Series', W: 'World Series' };
  var ROUND_ORDER = { F: 0, D: 1, L: 2, W: 3 };

  function teamAbbr(t) { return (t && (t.abbreviation || t.teamName || t.name)) || '?'; }
  function leagueOf(desc) {
    if (/^AL/.test(desc)) return 'AL';
    if (/^NL/.test(desc)) return 'NL';
    return 'WS';
  }

  // ── Fetch ──
  function load() {
    return fetch(API(SEASON), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        var games = [];
        (d.dates || []).forEach(function (dt) { (dt.games || []).forEach(function (g) { games.push(g); }); });
        return games;
      });
  }

  // ── Group games into series ──
  function groupSeries(games) {
    var map = {};
    games.forEach(function (g) {
      var a = g.teams.away.team, h = g.teams.home.team;
      var pair = [teamAbbr(a), teamAbbr(h)].sort().join('|');
      var key = g.gameType + '|' + g.seriesDescription + '|' + pair;
      if (!map[key]) {
        map[key] = {
          gameType: g.gameType, desc: g.seriesDescription, league: leagueOf(g.seriesDescription),
          games: [], teamIds: {},
        };
      }
      var s = map[key];
      s.games.push(g);
      s.teamIds[teamAbbr(a)] = a.id; s.teamIds[teamAbbr(h)] = h.id;
    });
    var list = Object.keys(map).map(function (k) { return map[k]; });
    list.forEach(function (s) {
      s.games.sort(function (x, y) { return (x.seriesGameNumber || 0) - (y.seriesGameNumber || 0); });
      var wins = {};
      s.games.forEach(function (g) {
        ['away', 'home'].forEach(function (side) {
          var t = g.teams[side];
          if (t.isWinner) wins[teamAbbr(t.team)] = (wins[teamAbbr(t.team)] || 0) + 1;
        });
      });
      s.wins = wins;
      var ss = (s.games[s.games.length - 1].seriesStatus) || {};
      s.total = ss.totalGames || s.games[0].gamesInSeries || 7;
      s.needed = Math.floor(s.total / 2) + 1;
      s.teams = Object.keys(s.teamIds);
      s.winner = s.teams.find(function (t) { return (wins[t] || 0) >= s.needed; }) || null;
      // placeholder matchups (World Series before teams are set) use "AL"/"NL"
      s.placeholder = s.teams.some(function (t) { return t === 'AL' || t === 'NL' || /Champion/.test(t); });
    });
    return list;
  }

  // ── Game-status helpers ──
  function gameState(g) { return (g.status && g.status.detailedState) || ''; }
  function isLive(g) {
    var st = gameState(g);
    return st === 'In Progress' || st === 'Manager Challenge' || st === 'Warmup' || /Delayed/.test(st);
  }
  function isFinal(g) { return gameState(g) === 'Final' || gameState(g) === 'Game Over' || gameState(g) === 'Completed Early'; }
  function fmtTime(iso) {
    try { return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); }
    catch (e) { return ''; }
  }

  // ── Team chip (logo + abbr). Clickable → team detail when we have a real id ──
  function teamChip(abbr, id, score, isWin, cls) {
    var clickable = id && abbr !== 'AL' && abbr !== 'NL';
    var logo = clickable
      ? '<img class="ps-logo" src="' + LOGO(id) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '';
    var sc = (score != null && score !== '') ? '<span class="ps-score">' + esc(String(score)) + '</span>' : '';
    var attrs = clickable ? ' data-tid="' + id + '" data-tabbr="' + esc(abbr) + '" role="button" tabindex="0" title="View ' + esc(abbr) + ' lineup + playoff stats"' : '';
    return '<div class="ps-team ' + (isWin ? 'ps-win ' : '') + (clickable ? 'ps-clickable ' : '') + (cls || '') + '"' + attrs + '>'
      + logo + '<span class="ps-abbr">' + esc(abbr) + '</span>' + sc + '</div>';
  }

  // ── Series card (bracket) ──
  function seriesCard(s) {
    var t = s.teams;
    // order so the higher-seed / winner reads on top; default to current win leader
    t = t.slice().sort(function (a, b) { return (s.wins[b] || 0) - (s.wins[a] || 0); });
    var ta = t[0], tb = t[1] || '';
    var statusTxt;
    if (s.winner) statusTxt = esc(s.winner) + ' win ' + (s.wins[s.winner] || 0) + '–' + (s.wins[tb === s.winner ? ta : tb] || 0);
    else if (s.placeholder) statusTxt = 'Awaiting teams';
    else {
      var live = s.games.filter(isLive)[0];
      var next = s.games.filter(function (g) { return gameState(g) === 'Scheduled'; })[0];
      if (live) statusTxt = 'Game ' + (live.seriesGameNumber || '?') + ' live';
      else if (next) statusTxt = 'Game ' + (next.seriesGameNumber || '?') + ' · ' + fmtDate(next.gameDate);
      else statusTxt = 'Best of ' + s.total;
    }
    var rowA = teamChip(ta, s.teamIds[ta], s.wins[ta] || 0, s.winner === ta);
    var rowB = tb ? teamChip(tb, s.teamIds[tb], s.wins[tb] || 0, s.winner === tb) : '';
    return '<div class="ps-series' + (s.winner ? ' ps-series-done' : '') + '">'
      + rowA + rowB + '<div class="ps-series-status">' + statusTxt + '</div></div>';
  }

  // ── Live / upcoming game card ──
  function gameCard(g) {
    var a = g.teams.away, h = g.teams.home;
    var ls = g.linescore || {};
    var aRuns = a.score, hRuns = h.score;
    var state = gameState(g), stateLine, cls = '';
    if (isLive(g)) {
      cls = 'ps-game-live';
      var inn = ls.inningState ? (ls.inningState + ' ' + (ls.currentInningOrdinal || ls.currentInning || '')) : state;
      var outs = (ls.outs != null) ? ' · ' + ls.outs + ' out' : '';
      stateLine = '<span class="ps-live-dot"></span>' + esc(inn + outs);
    } else if (isFinal(g)) {
      stateLine = 'Final' + (ls.currentInning && ls.currentInning > 9 ? '/' + ls.currentInning : '');
    } else {
      stateLine = fmtTime(g.gameDate);
      aRuns = hRuns = '';
    }
    var aWin = isFinal(g) && a.isWinner, hWin = isFinal(g) && h.isWinner;
    return '<div class="ps-game ' + cls + '">'
      + '<div class="ps-game-series">' + esc(g.seriesDescription || '') + ' · Gm ' + (g.seriesGameNumber || '?') + '</div>'
      + teamChip(teamAbbr(a.team), a.team.id, aRuns, aWin, 'ps-team-row')
      + teamChip(teamAbbr(h.team), h.team.id, hRuns, hWin, 'ps-team-row')
      + '<div class="ps-game-status">' + stateLine + '</div>'
      + '</div>';
  }

  // ── Render everything ──
  function render(games) {
    _lastGames = games;
    var root = $('ps-root');
    if (!root) return;
    if (!games || !games.length) {
      root.innerHTML = '<div class="ps-empty">No postseason games found for ' + SEASON + '.'
        + ' The bracket populates when the playoffs begin in October.</div>';
      return;
    }
    var series = groupSeries(games);

    // ── Live & upcoming strip: anything live now, else the soonest scheduled day ──
    var liveGames = games.filter(isLive).sort(function (a, b) { return new Date(a.gameDate) - new Date(b.gameDate); });
    var upcoming = [];
    if (!liveGames.length) {
      var sched = games.filter(function (g) { return gameState(g) === 'Scheduled'; })
        .sort(function (a, b) { return new Date(a.gameDate) - new Date(b.gameDate); });
      if (sched.length) {
        var day = sched[0].officialDate;
        upcoming = sched.filter(function (g) { return g.officialDate === day; });
      }
    }
    var recent = games.filter(isFinal).sort(function (a, b) { return new Date(b.gameDate) - new Date(a.gameDate); }).slice(0, 4);

    var topGames = liveGames.length ? liveGames : upcoming;
    var topLabel = liveGames.length ? 'Live Now' : (upcoming.length ? 'Up Next · ' + fmtDate(upcoming[0].gameDate) : '');
    var liveHtml = '';
    if (topGames.length) {
      liveHtml = '<section class="ps-section"><div class="ps-h">' + topLabel + '</div>'
        + '<div class="ps-games">' + topGames.map(gameCard).join('') + '</div></section>';
    }
    var recentHtml = recent.length
      ? '<section class="ps-section"><div class="ps-h">Recent Finals</div><div class="ps-games">' + recent.map(gameCard).join('') + '</div></section>'
      : '';

    // ── Bracket: columns by round; AL on top, NL below, World Series spans ──
    var rounds = ['F', 'D', 'L', 'W'];
    var colsHtml = rounds.map(function (gt) {
      var inRound = series.filter(function (s) { return s.gameType === gt; })
        .sort(function (a, b) { return a.league === b.league ? 0 : (a.league === 'AL' ? -1 : 1); });
      if (!inRound.length) return '';
      return '<div class="ps-col"><div class="ps-col-h">' + ROUND[gt] + '</div>'
        + inRound.map(seriesCard).join('') + '</div>';
    }).join('');

    root.innerHTML = liveHtml
      + '<section class="ps-section"><div class="ps-h">Bracket</div><div class="ps-bracket">' + colsHtml + '</div></section>'
      + recentHtml;

    var upd = $('ps-updated');
    if (upd) upd.textContent = 'Updated ' + new Date().toLocaleTimeString() + ' · live from MLB.com';
  }

  function refresh() {
    load().then(render).catch(function (e) {
      var root = $('ps-root');
      if (root && !_lastGames) root.innerHTML = '<div class="ps-empty">Could not reach the MLB Stats API right now. Retrying… <br><small>' + esc(e.message) + '</small></div>';
    });
  }

  // ══ TEAM DETAIL (projected lineup + postseason statistics) ════════════════
  function teamSchedURL(tid) {
    return 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=' + tid + '&season=' + SEASON
      + '&gameType=F,D,L,W&hydrate=lineups,probablePitcher,team,linescore'
      + '&startDate=' + SEASON + '-09-15&endDate=' + SEASON + '-11-15';
  }
  function teamStatsURL(tid) {
    return 'https://statsapi.mlb.com/api/v1/teams/' + tid + '/stats?stats=season&group=hitting,pitching&gameType=P&season=' + SEASON;
  }

  function sideOf(g, tid) { return g.teams.home.team.id === tid ? 'home' : 'away'; }

  // The projected lineup: prefer the next upcoming game's posted lineup; else
  // fall back to the most recent completed game's lineup (the likely look).
  function pickLineup(games, tid) {
    var up = games.filter(function (g) { return !isFinal(g); })
      .sort(function (a, b) { return new Date(a.gameDate) - new Date(b.gameDate); });
    var done = games.filter(isFinal).sort(function (a, b) { return new Date(b.gameDate) - new Date(a.gameDate); });
    function lineupFrom(g) {
      var side = sideOf(g, tid);
      var pl = (g.lineups || {})[side + 'Players'] || [];
      return pl.length ? { game: g, players: pl } : null;
    }
    for (var i = 0; i < up.length; i++) { var r = lineupFrom(up[i]); if (r) return { posted: true, game: up[i], players: r.players }; }
    for (var j = 0; j < done.length; j++) { var r2 = lineupFrom(done[j]); if (r2) return { posted: false, game: done[j], players: r2.players }; }
    return null;
  }
  function nextGame(games, tid) {
    return games.filter(function (g) { return !isFinal(g); })
      .sort(function (a, b) { return new Date(a.gameDate) - new Date(b.gameDate); })[0] || null;
  }

  function statBlock(statsResp, group) {
    var blk = (statsResp.stats || []).find(function (b) { return (b.group || {}).displayName === group; });
    return (blk && blk.splits && blk.splits[0] && blk.splits[0].stat) || null;
  }

  function renderTeamModal(tid, abbr, sched, stats) {
    var games = [];
    (sched.dates || []).forEach(function (dt) { (dt.games || []).forEach(function (g) { games.push(g); }); });
    var finals = games.filter(isFinal);
    var wl = { w: 0, l: 0 };
    finals.forEach(function (g) {
      var side = sideOf(g, tid), me = g.teams[side];
      if (me.isWinner === true) wl.w++; else if (me.isWinner === false) wl.l++;
    });
    var ng = nextGame(games, tid);
    var teamName = (games[0] && games[0].teams[sideOf(games[0], tid)].team.name) || abbr;

    // ── Projected lineup ──
    var lu = pickLineup(games, tid);
    var luHtml;
    if (lu) {
      var rows = lu.players.map(function (p, i) {
        var pos = (p.primaryPosition || {}).abbreviation || '';
        return '<tr><td class="ps-lu-n">' + (i + 1) + '</td><td class="ps-lu-name">' + esc(p.fullName || p.useName || '') + '</td>'
          + '<td class="ps-lu-pos">' + esc(pos) + '</td></tr>';
      }).join('');
      var srcNote = lu.posted ? 'confirmed for ' + fmtDate(lu.game.gameDate) : 'projected · based on ' + fmtDate(lu.game.gameDate) + ' game';
      luHtml = '<table class="ps-lu">' + rows + '</table><div class="ps-note">' + srcNote + '</div>';
    } else {
      luHtml = '<div class="ps-note">No lineup available yet.</div>';
    }

    // ── Next game context ──
    var ngHtml = '';
    if (ng) {
      var opp = sideOf(ng, tid) === 'home' ? 'away' : 'home';
      var meProb = (ng.teams[sideOf(ng, tid)].probablePitcher || {}).fullName;
      var oppProb = (ng.teams[opp].probablePitcher || {}).fullName;
      ngHtml = '<div class="ps-next">' + esc(ng.seriesDescription || '') + ' · Game ' + (ng.seriesGameNumber || '?')
        + ' · ' + fmtDate(ng.gameDate) + ' ' + fmtTime(ng.gameDate)
        + ' · ' + (sideOf(ng, tid) === 'home' ? 'vs ' : '@ ') + esc(teamAbbr(ng.teams[opp].team))
        + (meProb ? '<br><span class="ps-note">Probable: ' + esc(meProb) + (oppProb ? ' vs ' + esc(oppProb) : '') + '</span>' : '') + '</div>';
    }

    // ── Postseason statistics ──
    var hit = statBlock(stats, 'hitting'), pit = statBlock(stats, 'pitching');
    function statRow(label, val) { return '<div class="ps-stat"><span class="ps-stat-v">' + esc(val == null ? '—' : String(val)) + '</span><span class="ps-stat-l">' + label + '</span></div>'; }
    var statHtml = '';
    if (hit && hit.gamesPlayed) {
      statHtml = '<div class="ps-stat-grp">Hitting <em>· ' + hit.gamesPlayed + ' G</em></div><div class="ps-stats">'
        + statRow('AVG', hit.avg) + statRow('OBP', hit.obp) + statRow('SLG', hit.slg) + statRow('OPS', hit.ops)
        + statRow('Runs', hit.runs) + statRow('HR', hit.homeRuns)
        + statRow('RBI', hit.rbi) + statRow('BB', hit.baseOnBalls) + statRow('K', hit.strikeOuts) + '</div>';
      if (pit) {
        statHtml += '<div class="ps-stat-grp">Pitching <em>· ' + (pit.inningsPitched || '') + ' IP</em></div><div class="ps-stats">'
          + statRow('ERA', pit.era) + statRow('WHIP', pit.whip) + statRow('K', pit.strikeOuts)
          + statRow('BB', pit.baseOnBalls) + statRow('HR', pit.homeRuns) + statRow('SV', pit.saves) + '</div>';
      }
    } else {
      statHtml = '<div class="ps-note">No postseason statistics (team did not reach the ' + SEASON + ' playoffs, or data is not yet posted).</div>';
    }

    var html = '<div class="ps-td-head">'
      + '<img class="ps-td-logo" src="' + LOGO(tid) + '" alt="" onerror="this.style.display=\'none\'">'
      + '<div><div class="ps-td-name">' + esc(teamName) + '</div>'
      + '<div class="ps-td-sub">' + SEASON + ' Postseason · ' + wl.w + '–' + wl.l + '</div></div></div>'
      + ngHtml
      + '<div class="ps-td-h">Projected Lineup</div>' + luHtml
      + '<div class="ps-td-h">Postseason Statistics</div>' + statHtml;
    $('ps-modal-content').innerHTML = html;
  }

  function openTeam(tid, abbr) {
    var modal = $('ps-modal'); if (!modal) return;
    $('ps-modal-content').innerHTML = '<div class="ps-note" style="padding:30px;text-align:center">Loading ' + esc(abbr) + '…</div>';
    modal.hidden = false; document.body.style.overflow = 'hidden';
    Promise.all([
      fetch(teamSchedURL(tid), { cache: 'no-store' }).then(function (r) { return r.json(); }),
      fetch(teamStatsURL(tid), { cache: 'no-store' }).then(function (r) { return r.json(); }).catch(function () { return { stats: [] }; }),
    ]).then(function (res) { renderTeamModal(tid, abbr, res[0], res[1]); })
      .catch(function (e) { $('ps-modal-content').innerHTML = '<div class="ps-note" style="padding:30px;text-align:center">Could not load team data.<br><small>' + esc(e.message) + '</small></div>'; });
  }
  function closeTeam() { var m = $('ps-modal'); if (m) m.hidden = true; document.body.style.overflow = ''; }

  function boot() {
    // Delegated clicks: open team detail from any clickable chip; close controls.
    document.addEventListener('click', function (e) {
      var chip = e.target.closest && e.target.closest('.ps-clickable');
      if (chip) { openTeam(parseInt(chip.getAttribute('data-tid'), 10), chip.getAttribute('data-tabbr')); return; }
      if (e.target.closest && (e.target.closest('.ps-modal-close') || e.target.id === 'ps-modal')) closeTeam();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTeam(); });
    refresh();
    if (_timer) clearInterval(_timer);
    _timer = setInterval(refresh, REFRESH_MS);
    // pause polling when the tab is hidden; refresh immediately on return
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (_timer) { clearInterval(_timer); _timer = null; } }
      else if (!_timer) { refresh(); _timer = setInterval(refresh, REFRESH_MS); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
