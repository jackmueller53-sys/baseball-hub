/* ══════════════════════════════════════════════════════════════════════════
   COMBINED INIT — runs after all other scripts (defer guarantees order)
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Lightweight error telemetry ──
  // Capture uncaught errors + promise rejections to a ring buffer accessible
  // via window.__errors() for debugging on the deployed site.
  var _errorBuf = [];
  function recordErr(kind, payload) {
    var entry = { t: new Date().toISOString(), kind: kind, msg: payload };
    _errorBuf.push(entry);
    if (_errorBuf.length > 50) _errorBuf.shift();
  }
  window.addEventListener('error', function (e) {
    recordErr('error', (e.message || String(e.error)) + ' @ ' + (e.filename || '?') + ':' + (e.lineno || '?'));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    recordErr('rejection', r && (r.message || r.toString && r.toString()) || String(r));
  });
  window.__errors = function () { return _errorBuf.slice(); };

  // ── Init hook ──
  window.addEventListener('load', function () {
    // Single concise diagnostic line.
    console.log('%c⚾ Baseball Hub loaded', 'font-weight:bold;color:#047857',
      '| protocol=' + location.protocol + ' host=' + (location.hostname || 'file'));

    if (typeof _isFileProtocol !== 'undefined' && _isFileProtocol) {
      console.info('[init] file:// mode — direct fetch disabled, using CORS proxies. ' +
        'For best results: `npx serve .` then open http://localhost:3000');
    }

    // Wire player search input if a global handler is defined elsewhere.
    var ps = document.getElementById('player-search');
    if (ps && typeof debounceSearch === 'function') {
      ps.addEventListener('input', debounceSearch);
    }
  });
})();
