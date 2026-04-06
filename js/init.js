/* ══════════════════════════════════════════════════════════════════════════
   COMBINED INIT — runs after both JS blocks are loaded
   ══════════════════════════════════════════════════════════════════════════ */
window.addEventListener("load", function() {
  // ── Diagnostic banner ──
  console.log("%c⚾ Baseball Hub Loaded", "font-size:14px;font-weight:bold;color:#047857");
  console.log("[init] Protocol:", location.protocol, "| Host:", location.hostname || "(file)");
  console.log("[init] Server proxy:", _localProxy ? "YES → " + _localProxy : "NO (using CORS proxy chain)");
  console.log("[init] file:// mode:", _isFileProtocol ? "YES — direct fetch disabled, using CORS proxies" : "NO");
  if(_isFileProtocol){
    console.log("%c[TIP] For best results, run: npx serve .  (from the baseball-hub folder)", "color:#f5a623;font-weight:bold");
    console.log("[TIP] Then open http://localhost:3000 — this eliminates all CORS issues.");
  }

  // Wire player search input
  var ps = document.getElementById("player-search");
  if (ps && typeof debounceSearch === 'function') {
    ps.addEventListener("input", debounceSearch);
  }
});
