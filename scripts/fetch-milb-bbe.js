#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Baseball Hub — MiLB Live-Feed Statcast Extractor
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Walks every completed AAA (sportId=11) + FSL (sportId=14, leagueId=123) game
 * for the season, extracts:
 *   1. Per-event Statcast hit_data (BBE) → per-batter shards
 *   2. Per-pitch playEvent.details.type + pitchData → per-pitcher arsenals
 *
 * Why both come from the same live-feed walk:
 *   - The MLB Stats API /stats?stats=pitchArsenal endpoint is deprecated
 *     (returns 0 splits for ALL leagues including MLB itself, probed 2026-05-04).
 *   - Per-game live feeds DO contain per-pitch data with pitch_type and
 *     start_speed, so we aggregate them in-flight.
 *
 * Output:
 *   data/milb/<level>/bbe/<player_id>.json       — hitter BBE shards
 *     {
 *       player_id, name, last_updated,
 *       events: [{ d (date), x, y, ev, la, bb, dist, e (event), s (stand) }, ...],
 *       agg: { n, avg_ev, max_ev, hard_hit_pct, barrel_pct, sweet_spot_pct,
 *              avg_la, gb_pct, ld_pct, fb_pct, pu_pct,
 *              pull_pct, center_pct, oppo_pct }
 *     }
 *
 *   data/milb/<level>/arsenal/<player_id>.json   — pitcher pitch arsenal shards
 *     {
 *       player_id, name, last_updated,
 *       arsenal: [{ code, type, n, pct, velo, whiff_pct, put_away_pct }, ...]
 *     }
 *
 *   data/milb/<level>/bbe-manifest.json     — list of player_ids with BBE data
 *   data/milb/<level>/arsenal-manifest.json — list of player_ids with arsenal data
 *
 * Strategy:
 *   - Stats API /schedule returns gamePk list per (sportId, season, dateRange)
 *   - Stats API /game/<gamePk>/feed/live returns plays with hit_data + pitch data
 *   - Concurrency-limited (8 parallel) to balance throughput vs. rate limits
 *   - Idempotent: re-runs cleanly, all output deterministic
 *
 * Pitch-arsenal aggregation rules:
 *   pct           = pitches of this type / total pitches × 100
 *   velo          = mean(pitchData.startSpeed) for this type
 *   whiff_pct     = swinging strikes of this type / swings of this type × 100
 *   put_away_pct  = strikeouts ending on this type / 2-strike pitches of this type × 100
 *
 * Usage: node scripts/fetch-milb-bbe.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SEASON = 2026;
const ROOT_DATA_DIR = path.join(__dirname, '..', 'data');
const MILB_DIR = path.join(ROOT_DATA_DIR, 'milb');
const TIMEOUT = 30000;
const CONCURRENCY = 8;
const MIN_PITCHES_FOR_ARSENAL = 5;   // suppress noise for pitchers with <5 pitches
const MIN_BBE_FOR_LEAGUE_AVG = 10;   // hitters need >=10 BBE to count toward league avg

const LEVELS = [
  { key: 'aaa', sportId: 11, leagueId: null, label: 'AAA' },
  { key: 'fsl', sportId: 14, leagueId: 123,  label: 'FSL' }
];

const HARD_HIT_MPH = 95.0;
const SWEET_LA_LO = 8;
const SWEET_LA_HI = 32;
function isBarrel(ev, la) {
  if (ev == null || la == null) return false;
  if (ev < 98) return false;
  const extra = Math.max(0, Math.floor(ev - 98));
  const lo = Math.max(8,  26 - extra);
  const hi = Math.min(50, 30 + extra);
  return la >= lo && la <= hi;
}

// ═══════════════════════════════════════════════════════════════════════════
// HTTP FETCH
// ═══════════════════════════════════════════════════════════════════════════

function fetchURL(url, maxRedirects) {
  if (maxRedirects == null) maxRedirects = 5;
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const req = https.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) BaseballHub/1.0',
        'Accept': 'application/json'
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

async function fetchJSON(url) {
  const text = await fetchURL(url);
  return JSON.parse(text);
}

async function pmap(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try { out[i] = await fn(items[i], i); }
      catch (e) { out[i] = null; console.warn('  pmap fail [' + i + ']: ' + e.message); }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function listCompletedGames(level) {
  const url = 'https://statsapi.mlb.com/api/v1/schedule'
    + '?sportId=' + level.sportId
    + '&season=' + SEASON
    + '&gameType=R'
    + (level.leagueId ? '&leagueId=' + level.leagueId : '');
  const json = await fetchJSON(url);
  const dates = json.dates || [];
  const out = [];
  for (const d of dates) {
    for (const g of (d.games || [])) {
      const codedState = g.status && g.status.codedGameState;
      if (codedState === 'F' || codedState === 'D') {
        out.push({ gamePk: g.gamePk, gameDate: g.gameDate });
      }
    }
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// LIVE FEED → BBE rows + per-pitch rows
// ═══════════════════════════════════════════════════════════════════════════
//
// Returns { bbe: [...], pitches: [...] }. We keep these flat per-game; the
// processLevel step groups them by player.

async function fetchGameData(gamePk, gameDate) {
  const url = 'https://statsapi.mlb.com/api/v1.1/game/' + gamePk + '/feed/live';
  const json = await fetchJSON(url);
  const allPlays = (json.liveData && json.liveData.plays && json.liveData.plays.allPlays) || [];
  // gameData.players holds pitchHand per player — pitcher matchup objects
  // often omit it. Build a quick id → code map.
  const gamePlayers = (json.gameData && json.gameData.players) || {};
  const pitchHandByPid = {};
  for (const k of Object.keys(gamePlayers)) {
    const ph = gamePlayers[k].pitchHand;
    if (ph && ph.code) pitchHandByPid[gamePlayers[k].id] = ph.code;
  }
  const bbe = [];
  const pitches = [];
  for (const play of allPlays) {
    const matchup = play.matchup || {};
    const batter = matchup.batter || {};
    const pitcher = matchup.pitcher || {};
    const stand = matchup.batSide && matchup.batSide.code;
    const event = play.result && play.result.event;
    const eventType = play.result && play.result.eventType;
    const isStrikeout = /strikeout/i.test(eventType || '');
    const playEvents = play.playEvents || [];
    // Track 2-strike count for put-away% (a 2-strike pitch that ends the AB
    // as a strikeout counts toward put-away on the pitch type that delivered
    // the K).
    let firstHitDataSeen = false;
    for (let pi = 0; pi < playEvents.length; pi++) {
      const pe = playEvents[pi];
      // ── BBE (only the play-ending hitData) ──
      if (pe.hitData && !firstHitDataSeen) {
        firstHitDataSeen = true;
        const c = pe.hitData.coordinates || {};
        bbe.push({
          batter_id: batter.id,
          batter_name: batter.fullName || '',
          pitcher_id: pitcher.id,
          d: gameDate.slice(0, 10),
          x: c.coordX,
          y: c.coordY,
          ev: pe.hitData.launchSpeed,
          la: pe.hitData.launchAngle,
          bb: pe.hitData.trajectory,
          dist: pe.hitData.totalDistance,
          e: event,
          stand: stand
        });
      }
      // ── Per-pitch (only events with pitch_type + pitch_data) ──
      const t = pe.details && pe.details.type;
      const pd = pe.pitchData;
      if (!t || !t.code || !pd) continue;
      // Pre-pitch count snapshot (count BEFORE this pitch)
      const preBalls = pe.count && pe.count.balls;
      const preStrikes = pe.count && pe.count.strikes;
      // Determine swing / whiff / in-play
      const callCode = pe.details && pe.details.code;
      // Stats API codes:
      //   'B' = ball, 'S' = called strike, 'C' = called strike (alt),
      //   'F' = foul, 'L' = bunt foul,
      //   '*' = swinging miss / pitchout / etc.
      //   'X' = in play, 'D' = in play (no out), 'E' = in play (run),
      //   'M' = missed bunt, 'W' = swinging strike (alt), 'T' = foul tip,
      //   'I' = intentional ball, 'P' = pitchout, 'V' = called strike?
      // Heuristic: check details.isInPlay / isStrike / description.
      const desc = (pe.details && (pe.details.description || '')).toLowerCase();
      const isInPlay = !!(pe.details && pe.details.isInPlay) || /in play/i.test(desc);
      const isFoul   = /foul/i.test(desc) && !/foul tip/i.test(desc);
      const isWhiff  = /swinging strike|missed bunt|foul tip/i.test(desc);
      const isCalled = /called strike/i.test(desc);
      const isBall   = /^ball|hit by pitch|pitchout|intent ball/i.test(desc);
      const isSwing  = isInPlay || isFoul || isWhiff;
      // Last pitch of an AB? Only the final pitch should count for put-away
      const isLastPitchOfPA = (pi === playEvents.length - 1) || playEvents.slice(pi + 1).every(p2 => !p2.details || !p2.details.type);
      // Movement data — MLB Stats API gives pfxX / pfxZ already in INCHES
      // (catcher's perspective). aggregateArsenal flips pfx_x sign for the
      // pitcher's perspective; no unit conversion.
      const pCoord = pd.coordinates || {};
      const throwsCode = (pitcher.pitchHand && pitcher.pitchHand.code)
        || pitchHandByPid[pitcher.id] || null;
      // Zone classification — Stats API plate location is pX (ft, catcher's
      // view) ± .708 ft half-width; pZ from sz_bot to sz_top. We use a stable
      // proxy: |pX| <= 0.83 AND 1.5 <= pZ <= 3.5 (the league-avg strike zone).
      const pX = typeof pCoord.pX === 'number' ? pCoord.pX : null;
      const pZ = typeof pCoord.pZ === 'number' ? pCoord.pZ : null;
      const isInZone = (pX != null && pZ != null)
        ? (Math.abs(pX) <= 0.83 && pZ >= 1.5 && pZ <= 3.5)
        : null;
      pitches.push({
        pitcher_id: pitcher.id,
        pitcher_name: pitcher.fullName || '',
        batter_id: batter.id,
        batter_name: batter.fullName || '',
        throws: throwsCode,
        d: gameDate.slice(0, 10),
        code: t.code,
        type: t.description || t.code,
        velo: pd.startSpeed,
        // pfxX / pfxZ: feet, catcher's perspective. NULLs handled downstream.
        pfx_x: typeof pCoord.pfxX === 'number' ? pCoord.pfxX : null,
        pfx_z: typeof pCoord.pfxZ === 'number' ? pCoord.pfxZ : null,
        in_zone: isInZone,
        is_swing: isSwing,
        is_whiff: isWhiff,
        is_in_play: isInPlay,
        // 2-strike before this pitch
        was_two_strike: (preStrikes != null && preStrikes >= 2),
        // PA-ending strikeout? (putaway eligibility)
        is_putaway: !!(isStrikeout && isLastPitchOfPA && (preStrikes != null && preStrikes >= 2))
      });
    }
  }
  return { bbe, pitches };
}

// ═══════════════════════════════════════════════════════════════════════════
// HITTER BBE AGGREGATE
// ═══════════════════════════════════════════════════════════════════════════

function classifySpray(x, stand) {
  if (x == null) return null;
  const dx = x - 125;
  const absDx = Math.abs(dx);
  if (absDx < 30) return 'center';
  if (stand === 'L') return dx > 0 ? 'pull' : 'oppo';
  return dx < 0 ? 'pull' : 'oppo';
}

function aggregateForBatter(events) {
  if (!events.length) return { n: 0 };
  const evs = events.filter(e => e.ev != null && !isNaN(e.ev)).map(e => e.ev);
  const las = events.filter(e => e.la != null && !isNaN(e.la)).map(e => e.la);
  const sum = a => a.reduce((s, v) => s + v, 0);
  const mean = a => a.length ? sum(a) / a.length : null;
  const max = a => a.length ? Math.max.apply(null, a) : null;
  const pct = (n, d) => d ? +(100 * n / d).toFixed(1) : null;

  const n = events.length;
  const hardHit = evs.filter(v => v >= HARD_HIT_MPH).length;
  const sweetSpot = events.filter(e => e.la != null && e.la >= SWEET_LA_LO && e.la <= SWEET_LA_HI).length;
  const barrels = events.filter(e => isBarrel(e.ev, e.la)).length;

  const bbCounts = { ground_ball: 0, line_drive: 0, fly_ball: 0, popup: 0 };
  for (const e of events) if (e.bb && bbCounts.hasOwnProperty(e.bb)) bbCounts[e.bb]++;
  const bbTotal = bbCounts.ground_ball + bbCounts.line_drive + bbCounts.fly_ball + bbCounts.popup;

  const sprayCounts = { pull: 0, center: 0, oppo: 0 };
  for (const e of events) {
    const s = classifySpray(e.x, e.s || e.stand);
    if (s) sprayCounts[s]++;
  }
  const sprayTotal = sprayCounts.pull + sprayCounts.center + sprayCounts.oppo;

  return {
    n,
    avg_ev: mean(evs) != null ? +mean(evs).toFixed(1) : null,
    max_ev: max(evs) != null ? +max(evs).toFixed(1) : null,
    hard_hit_pct: pct(hardHit, evs.length),
    sweet_spot_pct: pct(sweetSpot, las.length),
    barrel_pct: pct(barrels, n),
    avg_la: mean(las) != null ? +mean(las).toFixed(1) : null,
    gb_pct: pct(bbCounts.ground_ball, bbTotal),
    ld_pct: pct(bbCounts.line_drive,  bbTotal),
    fb_pct: pct(bbCounts.fly_ball,    bbTotal),
    pu_pct: pct(bbCounts.popup,       bbTotal),
    pull_pct:   pct(sprayCounts.pull,   sprayTotal),
    center_pct: pct(sprayCounts.center, sprayTotal),
    oppo_pct:   pct(sprayCounts.oppo,   sprayTotal)
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PITCHER ARSENAL AGGREGATE
// ═══════════════════════════════════════════════════════════════════════════

function aggregateArsenal(pitches) {
  if (!pitches.length) return null;
  const total = pitches.length;
  // Group by pitch code; track movement (pfx_x/pfx_z) samples for mean+SD.
  const byCode = {};
  for (const p of pitches) {
    if (!p.code) continue;
    if (!byCode[p.code]) {
      byCode[p.code] = {
        code: p.code, type: p.type || p.code,
        n: 0, sumVelo: 0, nVelo: 0,
        swings: 0, whiffs: 0, twoStrike: 0, putaway: 0,
        // Movement raw samples (FEET, catcher's perspective)
        hbVals: [], vbVals: [],
      };
    }
    const r = byCode[p.code];
    r.n++;
    if (p.velo != null && !isNaN(p.velo)) { r.sumVelo += p.velo; r.nVelo++; }
    if (p.is_swing) r.swings++;
    if (p.is_whiff) r.whiffs++;
    if (p.was_two_strike) r.twoStrike++;
    if (p.is_putaway) r.putaway++;
    if (typeof p.pfx_x === 'number' && typeof p.pfx_z === 'number') {
      r.hbVals.push(p.pfx_x);
      r.vbVals.push(p.pfx_z);
    }
  }
  const arsenal = Object.values(byCode)
    .filter(r => r.n >= 1)
    .map(r => {
      // Movement: pfx_x / pfx_z already in INCHES (catcher's perspective).
      // Flip pfx_x sign so + = arm side (pitcher's perspective convention).
      let avg_hb_in = null, avg_ivb_in = null, sd_hb_in = null, sd_ivb_in = null, n_mov = 0;
      let samples = [];   // raw [hb,vb] pairs in pitcher-perspective inches
      if (r.hbVals.length >= 3) {
        const hbIn = r.hbVals.map(v => -v);   // flip sign only — already inches
        const vbIn = r.vbVals.slice();
        // Round to .1in to save bytes (still visually identical at 300px)
        samples = hbIn.map((h, k) => [+h.toFixed(1), +vbIn[k].toFixed(1)]);
        const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
        const sd   = (a, m) => Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length);
        avg_hb_in  = +mean(hbIn).toFixed(2);
        avg_ivb_in = +mean(vbIn).toFixed(2);
        sd_hb_in   = +sd(hbIn, avg_hb_in).toFixed(2);
        sd_ivb_in  = +sd(vbIn, avg_ivb_in).toFixed(2);
        n_mov = hbIn.length;
      }
      return {
        code: r.code,
        type: r.type,
        n: r.n,
        pct:  +(100 * r.n / total).toFixed(1),
        velo: r.nVelo ? +(r.sumVelo / r.nVelo).toFixed(1) : null,
        whiff_pct:    r.swings    ? +(100 * r.whiffs  / r.swings).toFixed(1)    : null,
        put_away_pct: r.twoStrike ? +(100 * r.putaway / r.twoStrike).toFixed(1) : null,
        // Movement (pitcher's perspective, inches). null when sample <3.
        avg_hb_in, avg_ivb_in, sd_hb_in, sd_ivb_in, n_mov,
        // Per-pitch HB/IVB samples for the dot scatter; rounded to .1in.
        mov_samples: samples,
      };
    })
    .sort((a, b) => b.pct - a.pct);
  return arsenal;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function processLevel(level) {
  console.log('\n══ ' + level.label + ' ══');
  const t0 = Date.now();
  console.log('  Listing completed games...');
  const games = await listCompletedGames(level);
  console.log('  ' + games.length + ' completed games');

  console.log('  Fetching live feeds (' + CONCURRENCY + 'x parallel)...');
  const fetched = await pmap(games, CONCURRENCY, async (g) => {
    return await fetchGameData(g.gamePk, g.gameDate);
  });
  const allBBE = [];
  const allPitches = [];
  for (const r of fetched) {
    if (!r) continue;
    allBBE.push.apply(allBBE, r.bbe);
    allPitches.push.apply(allPitches, r.pitches);
  }
  console.log('  ' + allBBE.length + ' batted-ball events, ' + allPitches.length + ' pitches extracted');

  // ── Group BBE by batter_id ──
  const byBatter = {};
  for (const e of allBBE) {
    if (!e.batter_id) continue;
    if (!byBatter[e.batter_id]) byBatter[e.batter_id] = { name: e.batter_name, events: [] };
    if (!byBatter[e.batter_id].name && e.batter_name) byBatter[e.batter_id].name = e.batter_name;
    byBatter[e.batter_id].events.push({
      d: e.d, x: e.x, y: e.y, ev: e.ev, la: e.la, bb: e.bb, dist: e.dist, e: e.e, s: e.stand
    });
  }
  // ── Per-batter pitch-discipline aggregate (Z-Con%, O-Con%, Chase%) ──
  // Built from the same per-pitch records the arsenal aggregator uses;
  // gives the hitter card a true zone-vs-chase contact split.
  const batterDiscByPid = {};
  for (const p of allPitches) {
    if (!p.batter_id) continue;
    const d = batterDiscByPid[p.batter_id] || (batterDiscByPid[p.batter_id] = {
      z_sw: 0, z_wh: 0, o_sw: 0, o_wh: 0,
      z_pit: 0, o_pit: 0,
    });
    if (p.in_zone === true)  { d.z_pit++; if (p.is_swing) { d.z_sw++; if (p.is_whiff) d.z_wh++; } }
    if (p.in_zone === false) { d.o_pit++; if (p.is_swing) { d.o_sw++; if (p.is_whiff) d.o_wh++; } }
  }
  function batterDisc(pid) {
    const d = batterDiscByPid[pid]; if (!d) return null;
    const pct = (n, t) => t > 0 ? +(100 * n / t).toFixed(1) : null;
    return {
      z_contact_pct: pct(d.z_sw - d.z_wh, d.z_sw),
      o_contact_pct: pct(d.o_sw - d.o_wh, d.o_sw),
      chase_pct:     pct(d.o_sw, d.o_pit),
      n_pitches_seen: d.z_pit + d.o_pit,
    };
  }

  // Write BBE shards
  const bbeDir = path.join(MILB_DIR, level.key, 'bbe');
  if (!fs.existsSync(bbeDir)) fs.mkdirSync(bbeDir, { recursive: true });
  let bbeWritten = 0;
  const allAggs = [];   // per-player aggregates feeding the league average
  for (const [pid, rec] of Object.entries(byBatter)) {
    const agg = aggregateForBatter(rec.events);
    const disc = batterDisc(parseInt(pid, 10));
    if (agg && disc) {
      // Surface the three disc fields on the agg object so the existing
      // league-average aggregator (which reads agg.*) picks them up too.
      agg.z_contact_pct = disc.z_contact_pct;
      agg.o_contact_pct = disc.o_contact_pct;
      agg.chase_pct     = disc.chase_pct;
    }
    const data = {
      player_id: parseInt(pid, 10),
      name: rec.name,
      last_updated: new Date().toISOString(),
      agg: agg,
      events: rec.events
    };
    fs.writeFileSync(path.join(bbeDir, pid + '.json'), JSON.stringify(data));
    bbeWritten++;
    if (agg && agg.n >= MIN_BBE_FOR_LEAGUE_AVG) allAggs.push(agg);
  }

  // ── Per-pitcher BBE shards (events the pitcher allowed) ──
  // Same shape as batter shards: { player_id, agg, events }. Feeds the new
  // pitcher-card Spray Chart panel; the pitcher card's own bbe_against block
  // on the arsenal shard still drives the bar chart.
  const bbePitDir = path.join(MILB_DIR, level.key, 'bbe-pit');
  if (!fs.existsSync(bbePitDir)) fs.mkdirSync(bbePitDir, { recursive: true });
  const eventsByPitcher = {};
  for (const e of allBBE) {
    if (!e.pitcher_id) continue;
    const key = String(e.pitcher_id);
    if (!eventsByPitcher[key]) eventsByPitcher[key] = [];
    eventsByPitcher[key].push({
      d: e.d, x: e.x, y: e.y, ev: e.ev, la: e.la, bb: e.bb,
      dist: e.dist, e: e.e, s: e.stand
    });
  }
  let bbePitWritten = 0;
  for (const [pid, events] of Object.entries(eventsByPitcher)) {
    if (events.length === 0) continue;
    const agg = aggregateForBatter(events);   // same trajectory/spray math
    const data = {
      player_id: parseInt(pid, 10),
      last_updated: new Date().toISOString(),
      agg: agg,
      events: events
    };
    fs.writeFileSync(path.join(bbePitDir, pid + '.json'), JSON.stringify(data));
    bbePitWritten++;
  }
  // ── League-average summary (consumed by the card QoC "vs Avg" column) ──
  // Mean of each Quality-of-Contact metric across players with a meaningful
  // batted-ball sample, written once per level so cards never aggregate
  // client-side.
  const LG_KEYS = ['avg_ev','max_ev','hard_hit_pct','barrel_pct','sweet_spot_pct',
                   'avg_la','gb_pct','ld_pct','fb_pct','pu_pct',
                   'pull_pct','center_pct','oppo_pct',
                   'z_contact_pct','o_contact_pct','chase_pct'];
  const lgAvg = {};
  for (const k of LG_KEYS) {
    const vals = allAggs.map(a => a[k]).filter(v => v != null && !isNaN(v));
    lgAvg[k] = vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : null;
  }
  fs.writeFileSync(
    path.join(MILB_DIR, level.key, 'bbe-league-avg.json'),
    JSON.stringify({
      last_updated: new Date().toISOString(),
      season: SEASON,
      level: level.label,
      n_players: allAggs.length,
      min_bbe: MIN_BBE_FOR_LEAGUE_AVG,
      avg: lgAvg
    })
  );
  fs.writeFileSync(
    path.join(MILB_DIR, level.key, 'bbe-manifest.json'),
    JSON.stringify({
      last_updated: new Date().toISOString(),
      season: SEASON,
      level: level.label,
      games_processed: games.length,
      events_total: allBBE.length,
      players: Object.keys(byBatter).map(pid => parseInt(pid, 10)).sort((a, b) => a - b)
    })
  );

  // ── Group pitches by pitcher_id, build arsenals ──
  const byPitcher = {};
  for (const p of allPitches) {
    if (!p.pitcher_id) continue;
    if (!byPitcher[p.pitcher_id]) byPitcher[p.pitcher_id] = { name: p.pitcher_name, pitches: [] };
    if (!byPitcher[p.pitcher_id].name && p.pitcher_name) byPitcher[p.pitcher_id].name = p.pitcher_name;
    byPitcher[p.pitcher_id].pitches.push(p);
  }
  // Write arsenal shards
  const arsenalDir = path.join(MILB_DIR, level.key, 'arsenal');
  if (!fs.existsSync(arsenalDir)) fs.mkdirSync(arsenalDir, { recursive: true });
  let arsenalWritten = 0;
  const arsenalPlayers = [];
  // ── Per-pitcher BBE-allowed (gb/ld/fb/pu trajectory %) ──
  // Group hit events by the pitcher who threw them, then compute the same
  // trajectory mix we already compute for batters.
  const pitcherBBE = {};
  for (const e of allBBE) {
    if (!e.pitcher_id || !e.bb) continue;
    const key = String(e.pitcher_id);
    const rec = pitcherBBE[key] || (pitcherBBE[key] = { gb: 0, ld: 0, fb: 0, pu: 0, n: 0 });
    if (e.bb === 'ground_ball') rec.gb++;
    else if (e.bb === 'line_drive') rec.ld++;
    else if (e.bb === 'fly_ball') rec.fb++;
    else if (e.bb === 'popup') rec.pu++;
    rec.n++;
  }

  for (const [pid, rec] of Object.entries(byPitcher)) {
    if (rec.pitches.length < MIN_PITCHES_FOR_ARSENAL) continue;
    const arsenal = aggregateArsenal(rec.pitches);
    if (!arsenal || !arsenal.length) continue;
    // Consensus pitcher handedness — pick the majority `throws` code across
    // the pitches we saw (occasionally feeds drop the hand on isolated pitches).
    let rH = 0, lH = 0;
    for (const p of rec.pitches) {
      if (p.throws === 'R') rH++;
      else if (p.throws === 'L') lH++;
    }
    const throws = rH >= lH ? (rH > 0 ? 'R' : null) : 'L';
    // Pitcher batted-ball summary for the new Batted-Ball Profile panel.
    const bb = pitcherBBE[pid];
    const bbe_against = bb && bb.n >= 10 ? {
      n: bb.n,
      gb_pct: +(100 * bb.gb / bb.n).toFixed(1),
      ld_pct: +(100 * bb.ld / bb.n).toFixed(1),
      fb_pct: +(100 * bb.fb / bb.n).toFixed(1),
      pu_pct: +(100 * bb.pu / bb.n).toFixed(1),
    } : null;
    const data = {
      player_id: parseInt(pid, 10),
      name: rec.name,
      throws: throws,
      last_updated: new Date().toISOString(),
      total_pitches: rec.pitches.length,
      arsenal: arsenal,
      bbe_against: bbe_against,
    };
    fs.writeFileSync(path.join(arsenalDir, pid + '.json'), JSON.stringify(data));
    arsenalWritten++;
    arsenalPlayers.push(parseInt(pid, 10));
  }
  fs.writeFileSync(
    path.join(MILB_DIR, level.key, 'arsenal-manifest.json'),
    JSON.stringify({
      last_updated: new Date().toISOString(),
      season: SEASON,
      level: level.label,
      games_processed: games.length,
      pitches_total: allPitches.length,
      players: arsenalPlayers.sort((a, b) => a - b)
    })
  );

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('  ' + bbeWritten + ' BBE shards, ' + arsenalWritten + ' arsenal shards (' + dt + 's)');
}

(async () => {
  if (!fs.existsSync(MILB_DIR)) fs.mkdirSync(MILB_DIR, { recursive: true });
  for (const level of LEVELS) {
    try {
      await processLevel(level);
    } catch (e) {
      console.error('  ' + level.label + ' failed: ' + e.message);
    }
  }
  console.log('\n✓ Done.');
})();
