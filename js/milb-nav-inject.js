/* ══════════════════════════════════════════════════════════════════════════
   BASEBALL HUB — MiLB Tab Injector
   ══════════════════════════════════════════════════════════════════════════
   Runs on index.html. Checks data/milb/meta-milb.json. If the MiLB pipeline
   has produced data (enabled=true), this script injects a "MiLB" tab into
   #hub-nav that links to pages/milb.html. If the meta file is missing, empty,
   or flagged disabled, nothing is injected — the site renders identically to
   before this script existed.

   This is the feature flag. It is the single safety net that prevents an
   ingestion-side failure from affecting the live MLB pages.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function injectTab(meta) {
    try {
      var nav = document.getElementById('hub-nav');
      if (!nav) return;
      // Avoid double-inject
      if (nav.querySelector('[data-milb-tab]')) return;

      var a = document.createElement('a');
      a.className = 'hub-tab';
      a.setAttribute('data-milb-tab', '1');
      a.href = 'pages/milb.html';
      // Match the inline styling of existing tabs (button-like anchor)
      a.style.textDecoration = 'none';
      a.style.display = 'inline-flex';
      a.style.alignItems = 'center';
      a.innerHTML = '<span class="hub-tab-icon">\u26BE</span> MiLB';
      nav.appendChild(a);
    } catch (e) {
      // Silent fail — never throw in the MLB app path
      if (window.console && console.warn) console.warn('[milb-nav-inject]', e);
    }
  }

  function init() {
    // Only fetch on pages that have the hub-nav (index.html)
    if (!document.getElementById('hub-nav')) return;

    // Defensive: don't block the page; fire-and-forget with a short timeout
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var to = setTimeout(function () { if (controller) controller.abort(); }, 4000);

    fetch('data/milb/meta-milb.json', {
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    })
      .then(function (r) {
        clearTimeout(to);
        if (!r.ok) throw new Error('meta http ' + r.status);
        return r.json();
      })
      .then(function (meta) {
        if (meta && meta.enabled === true) injectTab(meta);
      })
      .catch(function (e) {
        // Silent fail — no MiLB tab appears. MLB site unaffected.
        if (window.console && console.info) console.info('[milb-nav-inject] disabled:', e.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
