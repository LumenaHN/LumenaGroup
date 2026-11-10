/* =========================================================
   LUMENA GROUP — particles-bg.js
   Flow-field particle overlay for the hero section, drawn on
   top of the generated hero artwork. Ported from a React/canvas
   component to plain JS/Canvas — this site has no build step or
   framework, and the effect itself never actually depended on
   React (no state/JSX, just useEffect + the Canvas API).

   Trail fade uses globalCompositeOperation "destination-out" to
   erase old particle pixels by *reducing their alpha*, instead of
   painting an opaque rect in a hardcoded color over the canvas
   every frame. That earlier approach is what caused a real bug:
   the hardcoded dark fill covered the hero's background regardless
   of the active theme, making light-theme text unreadable. This
   version never paints a solid background color at all, so the
   artwork/gradient behind the canvas always stays visible no
   matter what theme is active — the bug is structurally impossible
   now, not just avoided by restricting to one theme.

   Runs only in dark theme + desktop (matches the hero artwork's
   own gating) and reacts live to theme toggles via MutationObserver,
   starting/stopping without needing a page reload.
   ========================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COLORS = ["#0BA4F2", "#5DC7FF", "#C062D6"];
  var PARTICLE_COUNT = 110;
  var TRAIL_FADE = 0.055;
  var MOUSE_RADIUS = 130;

  function Particle(width, height) {
    this.reset(width, height, true);
  }
  Particle.prototype.reset = function (width, height, initial) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : Math.random() < 0.5 ? 0 : height;
    this.vx = 0;
    this.vy = 0;
    this.age = 0;
    this.life = Math.random() * 220 + 140;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  };
  Particle.prototype.update = function (width, height, mouse) {
    var angle = (Math.cos(this.x * 0.004) + Math.sin(this.y * 0.004)) * Math.PI;
    this.vx += Math.cos(angle) * 0.16;
    this.vy += Math.sin(angle) * 0.16;

    var dx = mouse.x - this.x;
    var dy = mouse.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_RADIUS) {
      var force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      this.vx -= dx * force * 0.045;
      this.vy -= dy * force * 0.045;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.94;
    this.vy *= 0.94;

    this.age++;
    if (this.age > this.life) this.reset(width, height, false);
    if (this.x < 0) this.x = width; else if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height; else if (this.y > height) this.y = 0;
  };
  Particle.prototype.draw = function (ctx) {
    var t = this.age / this.life;
    var alpha = Math.max(1 - Math.abs(t - 0.5) * 2, 0);
    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 1.3, 0, Math.PI * 2);
    ctx.fill();
  };

  function ParticleField(canvas) {
    this.canvas = canvas;
    this.section = canvas.closest(".hero") || canvas.parentElement;
    this.ctx = canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };
    this.running = false;
    this._bindHandlers();
  }
  ParticleField.prototype._bindHandlers = function () {
    var self = this;
    this._onMouseMove = function (e) {
      var rect = self.section.getBoundingClientRect();
      self.mouse.x = e.clientX - rect.left;
      self.mouse.y = e.clientY - rect.top;
    };
    this._onMouseLeave = function () {
      self.mouse.x = -9999;
      self.mouse.y = -9999;
    };
    this._onVisibility = function () {
      if (document.hidden) return;
      if (self.running) self._loop();
    };
    var resizeTimer = null;
    this._onResize = function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (self.running) self._resize();
      }, 150);
    };
  };
  ParticleField.prototype._resize = function () {
    this.width = this.section.clientWidth;
    this.height = this.section.clientHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };
  ParticleField.prototype._build = function () {
    this.particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) this.particles.push(new Particle(this.width, this.height));
  };
  ParticleField.prototype._loop = function () {
    if (!this.running || document.hidden) return;
    var ctx = this.ctx;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0," + TRAIL_FADE + ")";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = "source-over";

    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.width, this.height, this.mouse);
      this.particles[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(this._loop.bind(this));
  };
  ParticleField.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this._resize();
    this._build();
    this.section.addEventListener("mousemove", this._onMouseMove);
    this.section.addEventListener("mouseleave", this._onMouseLeave);
    window.addEventListener("resize", this._onResize);
    document.addEventListener("visibilitychange", this._onVisibility);
    requestAnimationFrame(this._loop.bind(this));
  };
  ParticleField.prototype.stop = function () {
    if (!this.running) return;
    this.running = false;
    this.section.removeEventListener("mousemove", this._onMouseMove);
    this.section.removeEventListener("mouseleave", this._onMouseLeave);
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("visibilitychange", this._onVisibility);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  function shouldRun() {
    return document.documentElement.getAttribute("data-theme") === "dark" && window.innerWidth >= 768;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (prefersReducedMotion) return;
    var canvas = document.querySelector("[data-particles-bg]");
    if (!canvas || !canvas.getContext) return;

    var field = new ParticleField(canvas);
    if (shouldRun()) field.start();

    var resizeCheckTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeCheckTimer);
      resizeCheckTimer = setTimeout(function () {
        if (shouldRun()) field.start(); else field.stop();
      }, 150);
    });

    var observer = new MutationObserver(function () {
      if (shouldRun()) field.start(); else field.stop();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  });
})();
