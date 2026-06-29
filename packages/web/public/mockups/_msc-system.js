/* ============================================================
   MY SECOND COUNTRY — SHARED DESIGN SYSTEM (behaviour)
   Extracted verbatim from broadsheet-ledger-v5.html.

   Citation expand + scroll reveal + image reveal + parallax + hero load.
   All motion is guarded by prefers-reduced-motion. Citation toggles
   work regardless of motion preference (they are functional, not motion).

   Drop into any page with: <script src="_msc-system.js"></script>
   placed just before </body>.
   ============================================================ */
(function () {
  'use strict';

  /* ── Citation chips (both .cite and .cite-inline) ── */
  document.querySelectorAll('.cite, .cite-inline').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      var panelId = this.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;
      expanded = !expanded;
      this.setAttribute('aria-expanded', String(expanded));
      panel.classList.toggle('open', expanded);
    });
  });

  /* ── Mobile nav toggle (global nav, gate 1) ── */
  (function () {
    var t = document.querySelector('.nav-toggle');
    var m = document.getElementById('mobile-menu');
    if (!t || !m) return;
    t.addEventListener('click', function () {
      var open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!open));
      this.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      if (open) { m.setAttribute('hidden', ''); } else { m.removeAttribute('hidden'); }
    });
  }());

  /* ── Sticky nav elevation on scroll ──
     Chrome state (a soft shadow), not vestibular motion, so it runs
     regardless of motion preference; the shadow's transition is gated to
     prefers-reduced-motion: no-preference in CSS. */
  (function () {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () {
      if ((window.scrollY || window.pageYOffset) > 24) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }());

  /* ── Sources list: search + dimension filter (gate 9) ──
     Functional (not motion), so it lives before the reduced-motion
     early return. Inert on any page without the sources markup. */
  (function () {
    var search = document.getElementById('src-search');
    if (!search) return;
    var count = document.getElementById('src-count');
    var empty = document.getElementById('src-empty');
    var pills = Array.prototype.slice.call(document.querySelectorAll('.srcfilter__btn'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('.src-group'));
    var entries = Array.prototype.slice.call(document.querySelectorAll('.src'));
    var total = entries.length;
    var activeDim = 'all';

    function apply() {
      var q = (search.value || '').trim().toLowerCase();
      var shown = 0;
      entries.forEach(function (e) {
        var dimOk = activeDim === 'all' || e.getAttribute('data-dim') === activeDim;
        var textOk = !q || e.getAttribute('data-text').indexOf(q) !== -1;
        var vis = dimOk && textOk;
        e.hidden = !vis;
        if (vis) shown++;
      });
      groups.forEach(function (g) {
        var visibleInGroup = g.querySelectorAll('.src:not([hidden])').length;
        g.hidden = visibleInGroup === 0;
        var badge = g.querySelector('.src-group__count');
        if (badge) badge.textContent = visibleInGroup;
      });
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = 'Showing ' + shown + ' of ' + total + ' sources';
    }

    search.addEventListener('input', apply);
    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        activeDim = p.getAttribute('data-dim');
        pills.forEach(function (x) { x.setAttribute('aria-pressed', String(x === p)); });
        apply();
      });
    });
    apply();
  }());

  /* ── Reduced motion check (single source of truth) ── */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero load sequence ── */
  if (!prefersReduced) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.querySelectorAll('.hero-load').forEach(function (el) {
          el.classList.add('loaded');
        });
        /* Hero photo image reveal fires at same time */
        var heroImgWrap = document.querySelector('.hero-photo-wrap[data-img-reveal]');
        if (heroImgWrap) heroImgWrap.classList.add('img-in');
      });
    });
  }

  /* ── Scroll reveal (IntersectionObserver) ── */
  if (!prefersReduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });

    /* ── Image reveal (separate observer for photo wrappers) ── */
    var imgRevealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('img-in');
          imgRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    /* Observe all img-reveal wrappers EXCEPT the hero photo (handled in load sequence) */
    document.querySelectorAll('[data-img-reveal]').forEach(function (el) {
      if (!el.classList.contains('hero-photo-wrap')) {
        imgRevealObserver.observe(el);
      }
    });
  } else {
    /* Reduced motion: mark everything visible immediately */
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('in');
    });
    document.querySelectorAll('[data-img-reveal]').forEach(function (el) {
      el.classList.add('img-in');
    });
    document.querySelectorAll('.hero-load').forEach(function (el) {
      el.classList.add('loaded');
    });
  }

  /* ── Parallax scroll loop ──
     Single rAF loop; vertical-only (translate3d X always 0).
     Speeds: in-flow photos 0.15, closing-band photo 0.20.
     Travel caps: in-flow ±40px, closing-band ±60px.
     No horizontal shift at any viewport width.
  */
  if (prefersReduced) return;

  var parallaxItems = [];

  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    parallaxItems.push({
      el: el,
      speed: parseFloat(el.getAttribute('data-parallax')) || 0.15,
      isImg: false,
      cap: 40
    });
    el.style.willChange = 'transform';
  });

  document.querySelectorAll('[data-parallax-img]').forEach(function (el) {
    parallaxItems.push({
      el: el,
      speed: parseFloat(el.getAttribute('data-parallax-img')) || 0.20,
      isImg: true,
      cap: 60
    });
    el.style.willChange = 'transform';
  });

  if (parallaxItems.length === 0) return;

  var ticking = false;
  var viewH = window.innerHeight;

  window.addEventListener('resize', function () {
    viewH = window.innerHeight;
  }, { passive: true });

  function applyParallax() {
    var scrollY = window.scrollY || window.pageYOffset;

    parallaxItems.forEach(function (item) {
      var rect = item.el.getBoundingClientRect();
      /* Only update elements near the viewport (+/- 1 viewport height) */
      if (rect.bottom < -viewH || rect.top > viewH * 2) return;

      /* Centre of element relative to viewport centre */
      var elCenter = rect.top + rect.height / 2;
      var vpCenter = viewH / 2;
      var delta = (elCenter - vpCenter) * item.speed;

      /* Cap travel per element type */
      delta = Math.max(-item.cap, Math.min(item.cap, delta));

      /* Vertical only — X is always 0 */
      item.el.style.transform = 'translate3d(0,' + delta.toFixed(2) + 'px,0)';
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyParallax);
  }, { passive: true });

  /* Initial pass */
  requestAnimationFrame(applyParallax);

}());
