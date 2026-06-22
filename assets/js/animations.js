/* ================================================================
   SUPPRESS — Animations
   Animated counters, staggered reveals
   ================================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     ANIMATED COUNTER
     ---------------------------------------------------------------- */
  function animateCounter(el) {
    const target     = parseFloat(el.dataset.target) || 0;
    const suffix     = el.dataset.suffix || '';
    const prefix     = el.dataset.prefix || '';
    const duration   = parseInt(el.dataset.duration) || 1800;
    const decimals   = (String(target).split('.')[1] || '').length;
    const startTime  = performance.now();
    const startValue = 0;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function updateCounter(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const current  = startValue + (target - startValue) * eased;

      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /* ----------------------------------------------------------------
     TRIGGER COUNTERS WHEN IN VIEWPORT
     ---------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    // Fallback: show final values
    counters.forEach(el => {
      const target  = parseFloat(el.dataset.target) || 0;
      const suffix  = el.dataset.suffix || '';
      const prefix  = el.dataset.prefix || '';
      const decimals = (String(target).split('.')[1] || '').length;
      el.textContent = prefix + target.toFixed(decimals) + suffix;
    });
  }

  /* ----------------------------------------------------------------
     STAGGERED GRID ITEMS
     ---------------------------------------------------------------- */
  const staggerGroups = document.querySelectorAll('[data-stagger]');

  if (staggerGroups.length && 'IntersectionObserver' in window) {
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const children = entry.target.children;
            Array.from(children).forEach((child, i) => {
              child.style.transitionDelay = `${i * 100}ms`;
              child.classList.add('visible');
            });
            staggerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    staggerGroups.forEach(group => {
      // Prepare children for animation
      Array.from(group.children).forEach(child => {
        child.classList.add('fade-in');
      });
      staggerObserver.observe(group);
    });
  }

  /* ----------------------------------------------------------------
     PROGRESS BAR ON BLOG / ARTICLE PAGES
     ---------------------------------------------------------------- */
  const progressBar = document.querySelector('.reading-progress');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled   = window.pageYOffset;
      const pct        = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(pct, 100)}%`;
    }, { passive: true });
  }

  /* ----------------------------------------------------------------
     PARALLAX EFFECT on hero image (subtle)
     ---------------------------------------------------------------- */
  const parallaxEl = document.querySelector('[data-parallax]');

  if (parallaxEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const speed = parseFloat(parallaxEl.dataset.parallax) || 0.3;

    window.addEventListener('scroll', () => {
      const offset = window.pageYOffset * speed;
      parallaxEl.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
  }

})();
