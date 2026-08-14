/* =========================================================
   LUMENA GROUP — Neon cursor
   Desktop-with-a-real-mouse only, dark theme only (matches the hero
   particle/glow gating elsewhere), respects prefers-reduced-motion.
   ========================================================= */
(function () {
  "use strict";

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.innerWidth < 900) return;

  var cursor = document.createElement("div");
  cursor.className = "neon-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML =
    '<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<g stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
    '<line x1="14" y1="1" x2="14" y2="7"/>' +
    '<line x1="5" y1="4" x2="9" y2="9"/>' +
    '<line x1="23" y1="4" x2="19" y2="9"/>' +
    '<line x1="1" y1="13" x2="7" y2="13"/>' +
    '<line x1="27" y1="13" x2="21" y2="13"/>' +
    "</g>" +
    '<path d="M10 10 L10 34 L16.5 28.5 L21 38 L25 36 L20.5 26.5 L29 26.5 Z" fill="rgba(11,164,242,0.14)" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>' +
    "</svg>";
  document.body.appendChild(cursor);
  document.documentElement.classList.add("has-neon-cursor");

  var targetX = -100, targetY = -100, curX = -100, curY = -100;
  var raf = null;
  var HOTSPOT = 8; // px offset so the SVG's arrow tip (not the box corner) tracks the real pointer

  function tick() {
    curX += (targetX - curX) * 0.35;
    curY += (targetY - curY) * 0.35;
    cursor.style.transform = "translate(" + (curX - HOTSPOT) + "px," + (curY - HOTSPOT) + "px)";
    if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  }

  window.addEventListener("mousemove", function (e) {
    targetX = e.clientX;
    targetY = e.clientY;
    if (raf === null) raf = requestAnimationFrame(tick);
  }, { passive: true });

  var HOVER_SELECTOR = "a, button, .btn, input, textarea, select, .logo-cloud-item, .card, .lang-toggle button";
  document.addEventListener("mouseover", function (e) {
    if (e.target.closest(HOVER_SELECTOR)) cursor.classList.add("is-hover");
  }, true);
  document.addEventListener("mouseout", function (e) {
    if (e.target.closest(HOVER_SELECTOR)) cursor.classList.remove("is-hover");
  }, true);

  document.addEventListener("mousedown", function () { cursor.classList.add("is-down"); });
  document.addEventListener("mouseup", function () { cursor.classList.remove("is-down"); });

  document.addEventListener("mouseleave", function () { cursor.classList.add("is-hidden"); });
  document.addEventListener("mouseenter", function () { cursor.classList.remove("is-hidden"); });
})();
