/* ══════════════════════════════════════════════════════════════════════════
   HUB NAVIGATION
   ══════════════════════════════════════════════════════════════════════════ */
function switchApp(appId, btn) {
  // Update tab buttons + ARIA state
  document.querySelectorAll('.hub-tab').forEach(function(t){
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
  });
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');
  }

  // Toggle sections
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('app-visible'));
  document.getElementById('app-' + appId).classList.add('app-visible');

  // Toggle sub-controls
  const explorerCtl  = document.getElementById('sub-explorer-controls');
  const stuffplusCtl = document.getElementById('sub-stuffplus-controls');
  const srcBar       = document.getElementById('explorer-src-bar');
  const fetchWrap    = document.getElementById('fetch-wrap');

  if (appId === 'explorer') {
    explorerCtl.style.display  = 'flex';
    stuffplusCtl.style.display = 'none';
    srcBar.style.display       = '';
    // Trigger a re-render if needed
    if (typeof render === 'function') render();
  } else {
    explorerCtl.style.display  = 'none';
    stuffplusCtl.style.display = 'flex';
    srcBar.style.display       = 'none';
    fetchWrap.classList.add('hidden');
    // Trigger stuff+ render AFTER the section becomes visible (display:block),
    // using requestAnimationFrame so the browser has resolved layout dimensions
    // for the histogram SVG and table elements.
    if (typeof renderTable === 'function' && typeof allRows !== 'undefined' && allRows.length) {
      requestAnimationFrame(function(){
        renderTable();
        console.log('[switchApp] Stuff+ re-rendered after tab switch, allRows:', allRows.length);
      });
    } else if (typeof loadData === 'function') {
      // Fallback: if allRows is empty, try loading data again
      requestAnimationFrame(function(){
        Promise.resolve(loadData()).then(function(ok){
          if(ok){
            buildSeasonTabs();
            renderTable();
            console.log('[switchApp] Stuff+ data reloaded on tab switch, allRows:', allRows.length);
          }
        });
      });
    }
  }
}

// Arrow-key navigation for the hub tablist (WAI-ARIA Authoring Practices).
document.addEventListener('DOMContentLoaded', function(){
  var nav = document.getElementById('hub-nav');
  if (!nav) return;
  nav.addEventListener('keydown', function(e){
    var tabs = Array.prototype.slice.call(nav.querySelectorAll('[role="tab"]'));
    var i = tabs.indexOf(document.activeElement);
    if (i === -1) return;
    var next = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });
});
