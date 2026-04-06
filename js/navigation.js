/* ══════════════════════════════════════════════════════════════════════════
   HUB NAVIGATION
   ══════════════════════════════════════════════════════════════════════════ */
function switchApp(appId, btn) {
  // Update tab buttons
  document.querySelectorAll('.hub-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

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
        var ok = loadData();
        if(ok){
          buildSeasonTabs();
          renderTable();
          console.log('[switchApp] Stuff+ data reloaded on tab switch, allRows:', allRows.length);
        }
      });
    }
  }
}

