/* ══════════════════════════════════════════════════════════════════════════
   FETCH TEAM RECORDS + PLAYOFF ODDS
   ──────────────────────────────────────────────────────────────────────────
   Writes data/team-records.json for the Teams dashboard's team cards:
     • Live W-L record + standings picture  → MLB Stats API (statsapi.mlb.com)
     • Playoff odds (make playoffs / win div / win WS)  → FanGraphs

   Both are public, unauthenticated endpoints. Keyed by the site's FanGraphs
   abbreviation scheme so teams.js can join directly.

   Output:
     {
       updatedAt, sources: { record, odds },
       teams: { "<fgAbbr>": {
         w, l, pct, divRank, gamesBack, wcGamesBack, streak,
         divisionLeader, clinched, magicNumber,        // MLB
         playoffPct, divisionPct, worldSeriesPct        // FanGraphs (0..1)
       } }
     }
   ══════════════════════════════════════════════════════════════════════════ */
'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const SEASON = 2026;
const DATA_DIR = path.join(__dirname, '..', 'data');
const TIMEOUT = 25000;

// MLB Stats API abbreviations → FanGraphs/site scheme (7 differ).
const MLB_TO_FG = { AZ: 'ARI', CWS: 'CHW', KC: 'KCR', SD: 'SDP', SF: 'SFG', TB: 'TBR', WSH: 'WSN' };
const fgAbbr = (mlb) => MLB_TO_FG[mlb] || mlb;

function get(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: TIMEOUT, headers: headers || { 'Accept': 'application/json' } }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { reject(e); } });
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}
async function getRetry(url, headers, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await get(url, headers); }
    catch (e) { last = e; await new Promise((r) => setTimeout(r, 500 * (i + 1))); }
  }
  throw last;
}

async function main() {
  console.log('── Fetching team records + playoff odds ──');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const teams = {};
  const ensure = (abbr) => (teams[abbr] = teams[abbr] || {});

  // ── 1) MLB Stats API standings → W-L + standings picture ──
  let recordOk = 0;
  try {
    const st = await getRetry(
      `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${SEASON}&standingsTypes=regularSeason`
    );
    // Build MLB id → fg abbr once (teams endpoint has abbreviations).
    const teamList = await getRetry(`https://statsapi.mlb.com/api/v1/teams?sportId=1&season=${SEASON}`);
    const id2abbr = {};
    for (const t of (teamList.teams || [])) if (t.id && t.abbreviation) id2abbr[t.id] = fgAbbr(t.abbreviation);

    for (const rec of (st.records || [])) {
      for (const tr of (rec.teamRecords || [])) {
        const abbr = id2abbr[tr.team && tr.team.id];
        if (!abbr) continue;
        const T = ensure(abbr);
        T.w = tr.wins; T.l = tr.losses; T.pct = tr.winningPercentage;
        T.divRank = tr.divisionRank != null ? Number(tr.divisionRank) : null;
        T.gamesBack = tr.gamesBack;            // "-" when leading
        T.wcGamesBack = tr.wildCardGamesBack;
        T.divisionLeader = !!tr.divisionLeader;
        T.clinched = !!tr.clinched;
        T.magicNumber = tr.magicNumber || null;
        T.streak = tr.streak && tr.streak.streakCode || null;
        recordOk++;
      }
    }
    console.log(`  MLB standings: ${recordOk} teams`);
  } catch (e) {
    console.warn(`  MLB standings failed: ${e.message}`);
  }

  // ── 2) FanGraphs playoff odds → probabilities ──
  // Honest non-browser UA (FanGraphs 403s browser-impersonation; see the
  // baseball-hub fetch note). abbName already matches the FG/site scheme.
  let oddsOk = 0;
  try {
    const odds = await getRetry(
      'https://www.fangraphs.com/api/playoff-odds/odds?dateEnd=&dateStart=&projectionMode=2&standingsType=div',
      { 'User-Agent': 'baseball-hub-fetch/1.0', 'Accept': 'application/json' }
    );
    for (const row of (Array.isArray(odds) ? odds : [])) {
      const abbr = fgAbbr(row.abbName || '');
      if (!abbr) continue;
      const ed = row.endData || {};
      const T = ensure(abbr);
      T.playoffPct = ed.poffTitle != null ? ed.poffTitle : null;
      T.divisionPct = ed.divTitle != null ? ed.divTitle : null;
      T.worldSeriesPct = ed.wsWin != null ? ed.wsWin : null;
      oddsOk++;
    }
    console.log(`  FanGraphs playoff odds: ${oddsOk} teams`);
  } catch (e) {
    console.warn(`  FanGraphs playoff odds failed: ${e.message}`);
  }

  const out = {
    updatedAt: new Date().toISOString(),
    season: SEASON,
    sources: {
      record: 'MLB Stats API (statsapi.mlb.com/api/v1/standings)',
      odds: 'FanGraphs (fangraphs.com playoff odds)',
    },
    teams,
  };

  // Preserve prior file if this run produced nothing usable.
  const target = path.join(DATA_DIR, 'team-records.json');
  if (recordOk === 0 && oddsOk === 0 && fs.existsSync(target)) {
    console.warn('  ⚠️  Both sources failed — preserving existing team-records.json');
    process.exit(0);
  }
  fs.writeFileSync(target, JSON.stringify(out));
  console.log(`✅ team-records.json: ${Object.keys(teams).length} teams (record ${recordOk}, odds ${oddsOk})`);
}

main().catch((err) => {
  console.error('❌ fetch-team-records failed:', err.message);
  const target = path.join(__dirname, '..', 'data', 'team-records.json');
  if (fs.existsSync(target)) { console.warn('  Preserving existing team-records.json'); process.exit(0); }
  process.exit(1);
});
