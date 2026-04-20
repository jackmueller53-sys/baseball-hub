/* ══════════════════════════════════════════════════════════════════════════
   BASEBALL HUB — MiLB Client Data Loader
   ══════════════════════════════════════════════════════════════════════════
   Shared helper used by per-level MiLB pages (AAA, AA, A+, FSL). Loads JSON
   files from ../data/milb/<level>/ with graceful fallbacks:
     - Missing file  → returns []
     - Invalid JSON  → returns []
     - Network error → returns []
   In all failure modes the page still renders (with an "Updating data..."
   notice) so the live site never shows a broken leaderboard.
   ═══════════════════════════════════════════════════════════════════════════ */

window.MiLBData = (function () {
  'use strict';

  var CACHE_MIN = 15;
  var _cache = {};

  function cacheKey(level, file) { return level + '/' + file; }

  function readCache(key) {
    try {
      var raw = localStorage.getItem('milb-cache:' + key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.t) return null;
      var ageMin = (Date.now() - obj.t) / 60000;
      if (ageMin > CACHE_MIN) return null;
      return obj.d;
    } catch (e) { return null; }
  }

  function writeCache(key, data) {
    try {
      localStorage.setItem('milb-cache:' + key, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) { /* quota, ignore */ }
  }

  function loadJSON(url) {
    return fetch(url, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status + ' ' + url);
        return r.json();
      })
      .catch(function (e) {
        console.warn('[MiLBData] load fail', url, e.message);
        return [];
      });
  }

  function loadLevel(level, files) {
    // files: array of filenames, e.g. ['fg-bat.json', 'sv-bat.json']
    var out = {};
    var promises = files.map(function (f) {
      var key = cacheKey(level, f);
      var cached = _cache[key] || readCache(key);
      if (cached) {
        out[f] = cached;
        _cache[key] = cached;
        return Promise.resolve();
      }
      // MiLB pages live under /pages/, so data is at ../data/milb/<level>/<file>
      var url = '../data/milb/' + level + '/' + f;
      return loadJSON(url).then(function (data) {
        out[f] = Array.isArray(data) ? data : [];
        _cache[key] = out[f];
        writeCache(key, out[f]);
      });
    });
    return Promise.all(promises).then(function () { return out; });
  }

  function loadMeta() {
    return loadJSON('../data/milb/meta-milb.json').then(function (m) {
      return (m && typeof m === 'object') ? m : { enabled: false, counts: {}, errors: ['meta missing'] };
    });
  }

  return {
    loadLevel: loadLevel,
    loadMeta: loadMeta
  };
})();
