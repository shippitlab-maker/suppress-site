/* ================================================================
   SUPPRESS — Main JavaScript
   Navigation, scroll behavior, intersection observer, smooth scroll
   ================================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     STICKY HEADER
     ---------------------------------------------------------------- */
  const header = document.querySelector('.site-header');

  if (header) {
    const isTransparent = header.classList.contains('site-header--transparent');

    function updateHeader() {
      if (window.scrollY > 60) {
        header.classList.add('site-header--scrolled');
        if (isTransparent) header.classList.remove('site-header--transparent');
      } else {
        header.classList.remove('site-header--scrolled');
        if (isTransparent) header.classList.add('site-header--transparent');
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ----------------------------------------------------------------
     MOBILE NAVIGATION
     ---------------------------------------------------------------- */
  const hamburger    = document.querySelector('.nav__hamburger');
  const mobileMenu   = document.querySelector('.nav__mobile-menu');
  const mobileLinks  = document.querySelectorAll('.nav__mobile-link, .nav__mobile-cta .btn');

  if (hamburger && mobileMenu) {
    function openMenu() {
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });

    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ----------------------------------------------------------------
     ACTIVE NAV LINK
     ---------------------------------------------------------------- */
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPage = href.split('/').pop();
      if (linkPage === currentPage ||
          (currentPage === '' && linkPage === 'index.html') ||
          (currentPage === 'index.html' && (linkPage === '' || linkPage === 'index.html'))) {
        link.classList.add('active');
      }
    });
  }

  setActiveNavLink();

  /* ----------------------------------------------------------------
     SMOOTH SCROLL (anchor links)
     ---------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------------
     INTERSECTION OBSERVER — fade-in animations
     ---------------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-scale, .fade-in-blur');

  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    );

    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ----------------------------------------------------------------
     VIDEO HERO — load & play
     ---------------------------------------------------------------- */
  const heroVideo = document.querySelector('.hero__video');

  if (heroVideo) {
    heroVideo.addEventListener('loadeddata', () => {
      heroVideo.classList.add('loaded');
    });

    // Start loading after page is interactive
    if (document.readyState === 'complete') {
      heroVideo.src = heroVideo.dataset.src || heroVideo.src;
    } else {
      window.addEventListener('load', () => {
        if (heroVideo.dataset.src) heroVideo.src = heroVideo.dataset.src;
      });
    }
  }

  /* ----------------------------------------------------------------
     WHATSAPP FLOATING BUTTON — delayed appearance
     ---------------------------------------------------------------- */
  const waFab = document.querySelector('.whatsapp-fab');
  if (waFab) {
    setTimeout(() => waFab.classList.add('visible'), 3000);
  }

  /* ----------------------------------------------------------------
     FILTER BUTTONS (Cases and Blog)
     ---------------------------------------------------------------- */
  const filterBars = document.querySelectorAll('.filter-bar');

  filterBars.forEach(bar => {
    const buttons = bar.querySelectorAll('.filter-btn');
    const targetSelector = bar.dataset.target;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (!targetSelector) return;

        const filterValue = btn.dataset.filter;
        const items = document.querySelectorAll(targetSelector);

        items.forEach(item => {
          if (filterValue === 'all' || !filterValue) {
            item.style.display = '';
          } else {
            const itemSectors = item.dataset.sector || '';
            item.style.display = itemSectors.includes(filterValue) ? '' : 'none';
          }
        });
      });
    });
  });

  /* ----------------------------------------------------------------
     BLOG SEARCH — filtra os artigos pelo título e resumo
     ---------------------------------------------------------------- */
  const blogSearchInput = document.getElementById('blog-search-input');
  const articlesGrid = document.getElementById('articles-grid');

  if (blogSearchInput && articlesGrid) {
    const articleCards = articlesGrid.querySelectorAll('.article-card');
    const emptyMsg = document.getElementById('articles-empty');
    const resetLink = document.getElementById('articles-empty-reset');

    const normalize = (str) => str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');

    const runSearch = () => {
      const query = normalize(blogSearchInput.value.trim());
      let visibleCount = 0;

      articleCards.forEach(card => {
        const title = card.querySelector('.article-card__title')?.textContent || '';
        const excerpt = card.querySelector('.article-card__excerpt')?.textContent || '';
        const category = card.querySelector('.article-card__category')?.textContent || '';
        const haystack = normalize(title + ' ' + excerpt + ' ' + category);

        const matches = !query || haystack.includes(query);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      if (emptyMsg) emptyMsg.classList.toggle('hidden', visibleCount > 0);
    };

    blogSearchInput.addEventListener('input', runSearch);
    blogSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runSearch();
      }
    });

    const searchBtn = document.querySelector('.blog-search__btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        runSearch();
      });
    }

    if (resetLink) {
      resetLink.addEventListener('click', (e) => {
        e.preventDefault();
        blogSearchInput.value = '';
        runSearch();
        blogSearchInput.focus();
      });
    }
  }

  /* ----------------------------------------------------------------
     SCROLL INDICATOR CLICK (legacy)
     ---------------------------------------------------------------- */
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const nextSection = document.querySelector('.hero + section, .hero + .section');
      if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------------
     HERO MEGA — arrow buttons
     ---------------------------------------------------------------- */
  const heroArrows = document.querySelectorAll('.hero__arrow');
  if (heroArrows.length === 2) {
    heroArrows[0].addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    heroArrows[1].addEventListener('click', () => {
      const next = document.querySelector('.hero + section, .hero ~ section');
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------------
     PHONE MASK (BR format)
     ---------------------------------------------------------------- */
  function applyPhoneMask(input) {
    input.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').substring(0, 11);
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d+)$/, '($1) $2');
      }
      this.value = v;
    });
  }

  document.querySelectorAll('input[type="tel"]').forEach(applyPhoneMask);

})();
