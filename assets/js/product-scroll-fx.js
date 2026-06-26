(function () {
  'use strict';

  var hero = document.querySelector('.pd-hero');
  if (!hero) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Hero: sem parallax — mantém o produto flutuando com a animação CSS original

  // ── 2. REVEAL ANIMADO DOS SPECS (stagger) ──
  var specCards = document.querySelectorAll('.spec-card, .spec-table-v2__row');
  var specSection = document.querySelector('.spec-section');

  if (specCards.length && specSection) {
    specCards.forEach(function (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px)';
      card.style.transition = 'opacity 0.5s cubic-bezier(.25,.46,.45,.94), transform 0.5s cubic-bezier(.25,.46,.45,.94)';
    });

    var specRevealed = false;
    var specObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !specRevealed) {
          specRevealed = true;
          specCards.forEach(function (card, i) {
            setTimeout(function () {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 60);
          });
          specObserver.disconnect();
        }
      });
    }, { threshold: 0.15 });

    specObserver.observe(specSection);
  }

  // ── 3. CONTADOR ANIMADO dos specs bar ──
  var specBarItems = document.querySelectorAll('.pd-specs-bar__item .v');

  function animateCounter(el) {
    var text = el.textContent.trim();
    var match = text.match(/^([\d.,]+)/);
    if (!match) return;

    var raw = match[1].replace(/\./g, '');
    var target = parseFloat(raw.replace(',', '.'));
    if (isNaN(target) || target === 0) return;

    var suffix = text.slice(match[0].length);
    var hasComma = match[1].indexOf(',') !== -1;
    var hasDot = match[1].indexOf('.') !== -1 && !hasComma;
    var duration = 1200;
    var start = performance.now();

    function formatNum(n) {
      if (hasComma) {
        return n.toFixed(1).replace('.', ',');
      }
      if (hasDot) {
        return n.toLocaleString('pt-BR');
      }
      return Math.round(n).toLocaleString('pt-BR');
    }

    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = target * ease;
      el.textContent = formatNum(current) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (specBarItems.length) {
    var barSection = document.querySelector('.pd-specs-bar');
    if (barSection) {
      var counterRevealed = false;
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counterRevealed) {
            counterRevealed = true;
            specBarItems.forEach(function (el) { animateCounter(el); });
            counterObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });

      counterObserver.observe(barSection);
    }
  }

  // ── 4. CROSS-SELL CARDS: reveal com stagger ──
  var crossCards = document.querySelectorAll('.cross-card');
  if (crossCards.length) {
    crossCards.forEach(function (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px) scale(0.96)';
      card.style.transition = 'opacity 0.6s cubic-bezier(.25,.46,.45,.94), transform 0.6s cubic-bezier(.25,.46,.45,.94)';
    });

    var crossSection = document.querySelector('.cross-section');
    if (crossSection) {
      var crossRevealed = false;
      var crossObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !crossRevealed) {
            crossRevealed = true;
            crossCards.forEach(function (card, i) {
              setTimeout(function () {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
              }, i * 150);
            });
            crossObserver.disconnect();
          }
        });
      }, { threshold: 0.15 });

      crossObserver.observe(crossSection);
    }
  }

  // ── 5. SCROLL HINT: desaparece ao scrollar ──
  var scrollHint = document.querySelector('.pd-hero__scroll-hint');
  if (scrollHint) {
    window.addEventListener('scroll', function () {
      scrollHint.style.opacity = Math.max(0, 1 - window.pageYOffset / 200);
    }, { passive: true });
  }

})();
