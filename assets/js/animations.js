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
     SCROLL PARALLAX for inner pages
     ---------------------------------------------------------------- */
  const parallaxEls = document.querySelectorAll('[data-scroll-speed]');
  if (parallaxEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let pTicking = false;
    function updateParallax() {
      pTicking = false;
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const speed = parseFloat(el.dataset.scrollSpeed) || 0.05;
        const center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = 'translateY(' + (center * speed * -1).toFixed(1) + 'px)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!pTicking) { pTicking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
    updateParallax();
  }

  /* ----------------------------------------------------------------
     PAGE HERO parallax (background fades/shifts on scroll)
     ---------------------------------------------------------------- */
  const pageHero = document.querySelector('.page-hero');
  if (pageHero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let hTicking = false;
    function heroParallax() {
      hTicking = false;
      const s = window.pageYOffset;
      const h = pageHero.offsetHeight;
      if (s > h + 200) return;
      pageHero.style.transform = 'translateY(' + (s * 0.3).toFixed(1) + 'px)';
      pageHero.style.opacity = Math.max(0, 1 - s / (h * 0.8)).toFixed(3);
    }
    window.addEventListener('scroll', function () {
      if (!hTicking) { hTicking = true; requestAnimationFrame(heroParallax); }
    }, { passive: true });
  }

  /* ----------------------------------------------------------------
     SECTION SCALE-IN on scroll (sections grow from 95% to 100%)
     ---------------------------------------------------------------- */
  const scaleSections = document.querySelectorAll('[data-scroll-scale]');
  if (scaleSections.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const scaleObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transform = 'scale(1)';
          entry.target.style.opacity = '1';
          scaleObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    scaleSections.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) return;
      el.style.transform = 'scale(0.96)';
      el.style.opacity = '0.5';
      el.style.transition = 'transform 0.8s cubic-bezier(.4,0,.2,1), opacity 0.8s ease';
      scaleObs.observe(el);
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
