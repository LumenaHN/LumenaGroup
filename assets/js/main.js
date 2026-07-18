/* =========================================================
   LUMENA GROUP — main.js
   Navbar, theme toggle, mobile menu, scroll reveals, accordion
   ========================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  var THEME_KEY = "lumena_theme";
  function getTheme() {
    try { return localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { return "dark"; }
  }
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    document.querySelectorAll(".theme-toggle use").forEach(function (use) {
      use.setAttribute("href", theme === "dark" ? "#icon-sun" : "#icon-moon");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.setAttribute("data-theme", getTheme());
    document.querySelectorAll(".theme-toggle use").forEach(function (use) {
      use.setAttribute("href", getTheme() === "dark" ? "#icon-sun" : "#icon-moon");
    });
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTheme(getTheme() === "dark" ? "light" : "dark");
      });
    });

    /* ---------- Mobile nav ---------- */
    var navToggle = document.querySelector(".nav-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");
    if (navToggle && mobilePanel) {
      navToggle.addEventListener("click", function () {
        var isOpen = mobilePanel.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.style.overflow = isOpen ? "hidden" : "";
        var useEl = navToggle.querySelector("use");
        if (useEl) useEl.setAttribute("href", isOpen ? "#icon-close" : "#icon-menu");
      });
      mobilePanel.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          mobilePanel.classList.remove("is-open");
          document.body.style.overflow = "";
          var useEl = navToggle.querySelector("use");
          if (useEl) useEl.setAttribute("href", "#icon-menu");
        });
      });
    }

    /* ---------- Navbar scroll state ---------- */
    var navbar = document.querySelector(".navbar");
    if (navbar) {
      var onScroll = function () {
        navbar.classList.toggle("is-scrolled", window.scrollY > 12);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---------- Active nav link ---------- */
    var currentPage = (location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll(".nav-links a, .mobile-panel a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === currentPage || (currentPage === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });

    /* ---------- Footer year ---------- */
    document.querySelectorAll(".current-year").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* ---------- Accordion (FAQ) ---------- */
    document.querySelectorAll(".accordion-item").forEach(function (item) {
      var trigger = item.querySelector(".accordion-trigger");
      var panel = item.querySelector(".accordion-panel");
      if (!trigger || !panel) return;
      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        item.parentElement.querySelectorAll(".accordion-item").forEach(function (other) {
          other.classList.remove("is-open");
          other.querySelector(".accordion-panel").style.maxHeight = null;
          other.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          panel.style.maxHeight = panel.scrollHeight + "px";
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });

    /* ---------- Visibility-triggered effects (reveal / clip-reveal / timeline / count-up) ----------
       Uses IntersectionObserver as the primary mechanism, plus a manual scroll/resize/load
       fallback checker. Belt-and-suspenders: some environments (older browsers, certain
       automation/embedded contexts) never fire IO callbacks, and content that never appears
       is a worse failure than a redundant check. Each element is only triggered once. */
    var triggered = new WeakSet();

    function elementInView(el, thresholdRatio) {
      var rect = el.getBoundingClientRect();
      if (rect.height === 0 && rect.width === 0) return false;
      var visibleTop = Math.max(rect.top, 0);
      var visibleBottom = Math.min(rect.bottom, window.innerHeight);
      var visibleHeight = Math.max(0, visibleBottom - visibleTop);
      return visibleHeight / Math.min(rect.height, window.innerHeight || rect.height) >= thresholdRatio;
    }

    function runCountUp(el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var prefix = el.getAttribute("data-count-prefix") || "";
      var suffix = el.getAttribute("data-count-suffix") || "";
      var decimals = el.getAttribute("data-count-decimals") ? parseInt(el.getAttribute("data-count-decimals"), 10) : 0;
      if (prefersReducedMotion || isNaN(target)) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }
      var duration = 1400;
      var start = Date.now();
      function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
      function step() {
        var progress = Math.min((Date.now() - start) / duration, 1);
        var value = target * easeOutExpo(progress);
        el.textContent = prefix + value.toFixed(decimals) + suffix;
        if (progress < 1) setTimeout(step, 16);
      }
      step();
    }

    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal, .reveal-clip"));
    var timelines = Array.prototype.slice.call(document.querySelectorAll(".timeline"));
    var countEls = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));

    function fireReveal(el, index) {
      if (triggered.has(el)) return;
      triggered.add(el);
      var delay = el.getAttribute("data-reveal-delay") || ((index % 4) * 60);
      setTimeout(function () { el.classList.add("is-visible"); }, delay);
    }
    function fireTimeline(el) {
      if (triggered.has(el)) return;
      triggered.add(el);
      el.classList.add("is-drawn");
    }
    function fireCount(el) {
      if (triggered.has(el)) return;
      triggered.add(el);
      runCountUp(el);
    }

    if (prefersReducedMotion) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
      timelines.forEach(function (el) { el.classList.add("is-drawn"); });
      countEls.forEach(function (el) {
        el.textContent = (el.getAttribute("data-count-prefix") || "") + el.getAttribute("data-count-to") + (el.getAttribute("data-count-suffix") || "");
      });
    } else {
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry, index) { if (entry.isIntersecting) { fireReveal(entry.target, index); io.unobserve(entry.target); } });
        }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
        revealEls.forEach(function (el) { io.observe(el); });

        var timelineIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (entry.isIntersecting) { fireTimeline(entry.target); timelineIo.unobserve(entry.target); } });
        }, { threshold: 0.4 });
        timelines.forEach(function (el) { timelineIo.observe(el); });

        var countIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (entry.isIntersecting) { fireCount(entry.target); countIo.unobserve(entry.target); } });
        }, { threshold: 0.5 });
        countEls.forEach(function (el) { countIo.observe(el); });
      }

      /* Manual fallback: catches anything IO misses (or environments where it never fires) */
      var manualCheckScheduled = false;
      function manualCheck() {
        manualCheckScheduled = false;
        revealEls.forEach(function (el, index) { if (!triggered.has(el) && elementInView(el, 0.15)) fireReveal(el, index); });
        timelines.forEach(function (el) { if (!triggered.has(el) && elementInView(el, 0.3)) fireTimeline(el); });
        countEls.forEach(function (el) { if (!triggered.has(el) && elementInView(el, 0.4)) fireCount(el); });
      }
      function scheduleManualCheck() {
        if (manualCheckScheduled) return;
        manualCheckScheduled = true;
        setTimeout(manualCheck, 50);
      }
      window.addEventListener("scroll", scheduleManualCheck, { passive: true });
      window.addEventListener("resize", scheduleManualCheck);
      window.addEventListener("load", scheduleManualCheck);
      scheduleManualCheck();
      setTimeout(scheduleManualCheck, 400);

      /* Extra safety net: short-lived poll in case scroll/resize events are unavailable
         (some embedded/automation contexts never dispatch them). Chained setTimeout rather
         than setInterval — more consistently honored across odd host environments. */
      var pollCount = 0;
      function pollTick() {
        manualCheck();
        pollCount++;
        if (pollCount < 20) setTimeout(pollTick, 500);
      }
      setTimeout(pollTick, 500);
    }

    /* ---------- Hero parallax tilt (fine pointer, desktop, motion allowed) ---------- */
    var heroVisual = document.querySelector(".hero-visual");
    var pointerFine = window.matchMedia("(pointer: fine)").matches;
    if (heroVisual && pointerFine && !prefersReducedMotion && window.innerWidth > 640) {
      var heroSection = document.querySelector(".hero");
      heroSection.addEventListener("mousemove", function (e) {
        var rect = heroSection.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width - 0.5;
        var relY = (e.clientY - rect.top) / rect.height - 0.5;
        heroVisual.style.transform = "translate3d(" + (relX * -14) + "px," + (relY * -10) + "px,0)";
      });
      heroSection.addEventListener("mouseleave", function () {
        heroVisual.style.transform = "translate3d(0,0,0)";
      });
    }
  });
})();
