(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── REVEAL on scroll (fade + slide) ──
  var reveals = document.querySelectorAll('.a-reveal');
  if (reveals.length) {
    reveals.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(.25,.46,.45,.94), transform 0.6s cubic-bezier(.25,.46,.45,.94)';
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  // ── COUNTER animation for result numbers ──
  var counters = document.querySelectorAll('.sector-result-number');
  if (counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.counted) return;
        el.dataset.counted = '1';

        var text = el.textContent.trim();
        var match = text.match(/^([\d.,]+)/);
        if (!match) return;

        var target = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        if (isNaN(target)) return;
        var suffix = text.slice(match[0].length);
        var duration = 1400;
        var start = performance.now();

        function step(now) {
          var p = Math.min((now - start) / duration, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          var current = Math.round(target * ease);
          el.textContent = current + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);

        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  // Imagens estáticas — sem parallax

  // ── STICKY quick-nav highlight ──
  var navBtns = document.querySelectorAll('.sector-nav-btn');
  var sections = [];
  navBtns.forEach(function (btn) {
    var id = btn.getAttribute('href').replace('#', '');
    var sec = document.getElementById(id);
    if (sec) sections.push({ el: sec, btn: btn });
  });

  if (sections.length) {
    window.addEventListener('scroll', function () {
      requestAnimationFrame(function () {
        var scrollY = window.pageYOffset + 200;
        var active = null;
        sections.forEach(function (s) {
          if (s.el.offsetTop <= scrollY) active = s;
        });
        navBtns.forEach(function (b) { b.classList.remove('is-active'); });
        if (active) active.btn.classList.add('is-active');
      });
    }, { passive: true });
  }
})();
