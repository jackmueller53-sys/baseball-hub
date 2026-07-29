/* ══════════════════════════════════════════════════════════════════════════
   FETCH ACTIVE ROSTERS — MLB Stats API
   ──────────────────────────────────────────────────────────────────────────
   Writes data/rosters.json: the authoritative current-team membership for
   every player, used by the Teams dashboard to keep rosters accurate through
   the trade deadline. The FanGraphs stat files tell us how a player performed;
   this file tells us which club he is on RIGHT NOW (statsapi updates the moment
   a trade is announced, well before the stat feeds catch up).

   Join key: MLBAM person id (statsapi `person.id`) ↔ FanGraphs `xMLBAMID`.
   We use the 40-man roster so IL / optioned regulars still resolve to their
   real club instead of looking "unrostered".

   Output shape:
     {
       updatedAt: ISO8601,
       source: "statsapi.mlb.com v1 40Man rosters",
       season: 2026,
       teamCount: 30,
       playerCount: <n>,
       teams:    { "<fgAbbr>": { mlbId, mlbAbbr, count } },
       byPlayer: { "<mlbamId>": "<fgAbbr>" }
     }
   ══════════════════════════════════════════════════════════════════════════ */
'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const SEASON = 2026;
const DATA_DIR = path.join(__dirname, '..', 'data');
const TIMEOUT = 20000;

// MLB Stats API abbreviations differ from the FanGraphs / site scheme in 7
// spots. Everything not listed passes through unchanged.
const MLB_TO_FG = {
  AZ: 'ARI', CWS: 'CHW', KC: 'KCR', SD: 'SDP',
  SF: 'SFG', TB: 'TBR', WSH: 'WSN',
};
const fgAbbr = (mlb) => MLB_TO_FG[mlb] || mlb;

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: TIMEOUT, headers: { 'Accept': 'application/json' } }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
        catch (e) { reject(e); }
      });
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

// Small retry so a single flaky call doesn't abort the whole run.
async function getJSONRetry(url, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await getJSON(url); }
    catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 400 * (i + 1))); }
  }
  throw lastErr;
}

function saveJSON(filename, data) {
  const file = path.join(DATA_DIR, filename);
  fs.writeFileSync(file, JSON.stringify(data));
  console.log(`  Saved ${filename}`);
}

async function main() {
  console.log('── Fetching active rosters (MLB Stats API) ──');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // 1) Team list → id + abbreviation
  const teamsResp = await getJSONRetry(
    `https://statsapi.mlb.com/api/v1/teams?sportId=1&season=${SEASON}`
  );
  const teams = (teamsResp.teams || []).filter(t => t && t.id && t.abbreviation);
  console.log(`  ${teams.length} teams`);
  if (teams.length < 30) throw new Error(`Expected 30 teams, got ${teams.length}`);

  // 2) Each team's 40-man roster
  const out = {
    updatedAt: new Date().toISOString(),
    source: 'statsapi.mlb.com v1 40Man rosters',
    season: SEASON,
    teams: {},
    byPlayer: {},
  };
  let playerCount = 0;
  let failed = 0;

  for (const t of teams) {
    const abbr = fgAbbr(t.abbreviation);
    let roster = [];
    try {
      const r = await getJSONRetry(
        `https://statsapi.mlb.com/api/v1/teams/${t.id}/roster?rosterType=40Man&season=${SEASON}`
      );
      roster = Array.isArray(r.roster) ? r.roster : [];
    } catch (e) {
      failed++;
      console.warn(`  ${abbr}: roster fetch failed — ${e.message}`);
      continue;
    }
    let n = 0;
    for (const p of roster) {
      const id = p && p.person && p.person.id;
      if (id == null) continue;
      out.byPlayer[String(id)] = abbr;
      n++; playerCount++;
    }
    out.teams[abbr] = { mlbId: t.id, mlbAbbr: t.abbreviation, count: n };
    console.log(`  ${abbr}: ${n} players`);
    await new Promise((r) => setTimeout(r, 120));  // be polite to the API
  }

  out.teamCount = Object.keys(out.teams).length;
  out.playerCount = playerCount;

  // Guardrail: never overwrite a good rosters.json with a degenerate one.
  // A real 40-man pull is ~1200+ players across 30 teams; treat anything far
  // below that (or any team-fetch failures) as a partial run and preserve the
  // existing file instead.
  const target = path.join(DATA_DIR, 'rosters.json');
  const healthy = out.teamCount === 30 && failed === 0 && playerCount >= 900;
  if (!healthy && fs.existsSync(target)) {
    console.warn(`  ⚠️  Partial roster run (teams=${out.teamCount}, failed=${failed}, players=${playerCount}); preserving existing rosters.json`);
    process.exit(0);
  }

  saveJSON('rosters.json', out);
  console.log(`✅ rosters.json: ${out.teamCount} teams, ${playerCount} players`);
}

main().catch((err) => {
  console.error('❌ fetch-rosters failed:', err.message);
  // Non-fatal: a preserved rosters.json (if any) keeps the feature working.
  // Only fail the job when there is nothing on disk to fall back to.
  const target = path.join(__dirname, '..', 'data', 'rosters.json');
  if (fs.existsSync(target)) {
    console.warn('  Preserving existing rosters.json; exiting 0.');
    process.exit(0);
  }
  process.exit(1);
});
