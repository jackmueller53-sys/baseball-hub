#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FanGraphs MiLB API probe — diagnostic only, never commits
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The real fetcher (scripts/fetch-milb-2026.js) hit /api/leaders/minor-league/data
 * with levels=1,2 and lg=11,12 — both returned 0 rows. This probe tries a
 * wider matrix of URL shapes and logs raw responses so we can figure out the
 * correct FG MiLB API endpoint + param shape.
 *
 * Runs in the throwaway milb-fg-diagnose branch via workflow_dispatch. Exits 0
 * regardless of probe result. Does NOT write any files. All findings appear
 * in the GitHub Actions log.
 *
 * After this script has told us the working URL shape, patch
 * scripts/fetch-milb-2026.js on a separate branch and open a real PR.
 */

const https = require('https');

const SEASON_CURRENT = 2026;
const SEASON_PRIOR = 2025; // Control — if current year returns empty but prior year returns data, we know the endpoint works
const TIMEOUT_MS = 20000;
const BODY_PREVIEW_BYTES = 500;

// ── Candidate URLs ──────────────────────────────────────────────────────────
// Six shapes plus two control shapes against 2025. We're hunting for which
// endpoint / param combo actually returns the AAA leaderboard for this season.
//
// Reference: the working MLB fetcher uses
//   /api/leaders/major-league/data?pos=all&stats=bat&lg=all&qual=10&type=8
//     &season=2026&season1=2026&ind=0&team=0&pageitems=2000&pagenum=1
// — this is the baseline shape.
function buildProbes(season) {
  const base = (stats, qual = 10, fgType = 8) =>
    `pos=all&stats=${stats}&qual=${qual}&type=${fgType}`
    + `&season=${season}&season1=${season}&ind=0&team=0&pageitems=2000&pagenum=1`;

  return [
    {
      name: `[${season}] current-prod: /minor-league/data + levels=1,2 + lg=all`,
      url: `https://www.fangraphs.com/api/leaders/minor-league/data?${base('bat')}&levels=1,2&lg=all`
    },
    {
      name: `[${season}] /minor-league/data + lg=11,12 + levels=all`,
      url: `https://www.fangraphs.com/api/leaders/minor-league/data?${base('bat')}&lg=11,12&levels=all`
    },
    {
      name: `[${season}] /minor-league/data + no levels/lg (all-MiLB)`,
      url: `https://www.fangraphs.com/api/leaders/minor-league/data?${base('bat')}`
    },
    {
      name: `[${season}] /minor/data (short path)`,
      url: `https://www.fangraphs.com/api/leaders/minor/data?${base('bat')}&levels=1,2&lg=all`
    },
    {
      name: `[${season}] /major-league/data + levels=1,2 (try MLB endpoint with MiLB levels)`,
      url: `https://www.fangraphs.com/api/leaders/major-league/data?${base('bat')}&levels=1,2&lg=all`
    },
    {
      name: `[${season}] /leaders-minor-league/data (hyphenated)`,
      url: `https://www.fangraphs.com/api/leaders-minor-league/data?${base('bat')}&levels=1,2&lg=all`
    },
    {
      name: `[${season}] HTML page — /leaders/minor-league (for scrape fallback)`,
      url: `https://www.fangraphs.com/leaders/minor-league?pos=all&stats=bat&season=${season}&levels=1,2&lg=all`
    },
    {
      name: `[${season}] Prospects API — /api/prospects/leaders`,
      url: `https://www.fangraphs.com/api/prospects/leaders?stats=bat&season=${season}`
    }
  ];
}

// ── HTTP fetch (no redirects-limited, logs headers) ────────────────────────
function probeURL(url) {
  return new Promise((resolve) => {
    const started = Date.now();
    const req = https.get(url, {
      timeout: TIMEOUT_MS,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) BaseballHubDiagnostic/1.0',
        'Accept': 'application/json, text/html, */*'
      }
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          location: res.headers['location'] || null,
          totalBytes: body.length,
          bodyPreview: body.slice(0, BODY_PREVIEW_BYTES),
          body,
          ms: Date.now() - started
        });
      });
      res.on('error', (e) => resolve({ status: 0, err: 'resp-error: ' + e.message, ms: Date.now() - started }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, err: 'timeout', ms: Date.now() - started }); });
    req.on('error', (e) => resolve({ status: 0, err: e.message, ms: Date.now() - started }));
  });
}

// ── Shape the findings ─────────────────────────────────────────────────────
function summarizeBody(res) {
  const { contentType = '', body = '', bodyPreview = '' } = res;
  if (!body) return { kind: 'empty' };

  const ctLower = contentType.toLowerCase();

  if (ctLower.includes('application/json') || body.trim().startsWith('{') || body.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed)) {
        return {
          kind: 'json-array',
          length: parsed.length,
          firstKeys: parsed.length > 0 ? Object.keys(parsed[0]).slice(0, 20) : [],
          firstName: parsed.length > 0 ? (parsed[0].PlayerName || parsed[0].Name || parsed[0].playerName || '<no name field>') : null
        };
      }
      const keys = Object.keys(parsed);
      const dataArr = parsed.data || parsed.records || parsed.players || null;
      return {
        kind: 'json-object',
        topKeys: keys.slice(0, 20),
        dataArrayLength: Array.isArray(dataArr) ? dataArr.length : null,
        dataArrayFirstKeys: Array.isArray(dataArr) && dataArr.length > 0 ? Object.keys(dataArr[0]).slice(0, 20) : null,
        dataArrayFirstName: Array.isArray(dataArr) && dataArr.length > 0 ? (dataArr[0].PlayerName || dataArr[0].Name || '<no name>') : null
      };
    } catch (e) {
      return { kind: 'json-parse-failed', err: e.message, preview: bodyPreview };
    }
  }

  if (ctLower.includes('text/html') || body.trim().startsWith('<')) {
    const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
    return {
      kind: 'html',
      title: titleMatch ? titleMatch[1].trim() : null,
      hasLeaderboard: /leaderboard|player-name|name-col/i.test(body)
    };
  }

  return { kind: 'other', preview: bodyPreview };
}

// ── MAIN ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('');
  console.log('⚾ FanGraphs MiLB API Probe');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(` Timestamp: ${new Date().toISOString()}`);
  console.log(` Running from: ${process.env.GITHUB_RUN_ID ? 'GitHub Actions' : 'local'}`);
  console.log('');

  const allProbes = [...buildProbes(SEASON_CURRENT), ...buildProbes(SEASON_PRIOR)];

  for (const p of allProbes) {
    console.log('─── ' + p.name + ' ───');
    console.log('URL: ' + p.url);
    const res = await probeURL(p.url);
    if (res.err) {
      console.log(`  ✗ ${res.err} (${res.ms}ms)`);
    } else {
      console.log(`  HTTP ${res.status} ${res.contentType} — ${res.totalBytes} bytes (${res.ms}ms)${res.location ? '\n  Location: ' + res.location : ''}`);
      const summary = summarizeBody(res);
      console.log('  Shape: ' + JSON.stringify(summary));
      if (summary.kind === 'json-array' && summary.length > 0) {
        console.log('  >>> HIT: ' + summary.length + ' rows, first player: ' + summary.firstName);
      } else if (summary.kind === 'json-object' && summary.dataArrayLength > 0) {
        console.log('  >>> HIT: ' + summary.dataArrayLength + ' rows in data[], first player: ' + summary.dataArrayFirstName);
      } else {
        console.log('  Body preview (first ' + BODY_PREVIEW_BYTES + ' chars):');
        console.log('  ' + (res.bodyPreview || '').replace(/\n/g, '\n  ').slice(0, BODY_PREVIEW_BYTES));
      }
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' Probe complete. Scan the log for ">>> HIT:" lines — those are');
  console.log(' the working URL shapes we should patch into fetch-milb-2026.js.');
  console.log('');
})();
