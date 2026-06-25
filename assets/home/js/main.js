/* SUPPRESS — main.js : header, menu mobile, reveal, counters, whatsapp */
(function(){
  'use strict';

  var root = document.documentElement;
  root.classList.add('js'); /* reveals start hidden only while JS is alive */

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  function onScroll(){ if(header) header.classList.toggle('is-stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var drawer = document.querySelector('.mobile-nav');
  var scrim  = document.querySelector('.scrim');
  var closeBtn = document.querySelector('.mobile-nav__close');
  function openNav(){ drawer && drawer.classList.add('open'); scrim && scrim.classList.add('show'); if(toggle) toggle.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
  function closeNav(){ drawer && drawer.classList.remove('open'); scrim && scrim.classList.remove('show'); if(toggle) toggle.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  toggle && toggle.addEventListener('click', openNav);
  closeBtn && closeBtn.addEventListener('click', closeNav);
  scrim && scrim.addEventListener('click', closeNav);
  drawer && drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeNav(); });

  /* ---------- Counters ---------- */
  function animateCount(el){
    if(el.dataset.done) return; el.dataset.done = '1';
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var val = target * (1 - Math.pow(1-p, 3));
      el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
      if(p < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------- Scroll reveal (position-based) ----------
     Only wired up once we've confirmed CSS animations actually advance
     in this environment (see probe below). Otherwise content is shown
     statically and we never trigger a transition that could freeze. */
  function setupReveal(){
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var counters  = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    var ticking = false;
    function check(){
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for(var i=revealEls.length-1;i>=0;i--){
        var r = revealEls[i].getBoundingClientRect();
        if(r.top < vh*0.90 && r.bottom > 0){ revealEls[i].classList.add('in'); revealEls.splice(i,1); }
      }
      for(var j=counters.length-1;j>=0;j--){
        var cr = counters[j].getBoundingClientRect();
        if(cr.top < vh*0.95 && cr.bottom > 0){ animateCount(counters[j]); counters.splice(j,1); }
      }
    }
    function requestCheck(){ if(!ticking){ ticking = true; requestAnimationFrame(check); } }
    window.addEventListener('scroll', requestCheck, {passive:true});
    window.addEventListener('resize', requestCheck);
    check();
    setTimeout(check, 400);
  }

  /* ---------- Animation-capability probe ----------
     Some embedded/preview engines freeze the CSS animation clock, which
     would leave reveal elements stuck at opacity:0. Test a tiny
     transition; if it doesn't advance, render everything statically. */
  function startRevealSystem(){
    try{
      var p = document.createElement('span');
      p.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0.01;transition:opacity 30ms linear';
      document.body.appendChild(p);
      void p.offsetWidth;
      p.style.opacity = '1';
      setTimeout(function(){
        var works = parseFloat(getComputedStyle(p).opacity) >= 0.9;
        p.remove();
        if(works){ setupReveal(); }
        else { root.classList.remove('js'); } /* show all statically; counters already show final text */
      }, 90);
    }catch(e){ root.classList.remove('js'); }
  }
  startRevealSystem();

  /* ---------- WhatsApp float after 3s ---------- */
  var wa = document.querySelector('.wa-float');
  if(wa){ setTimeout(function(){ wa.classList.add('show'); }, 3000); }

  /* ---------- Footer year ---------- */
  var y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();

  /* ---------- Antes / Depois slider ---------- */
  (function(){
    var slider = document.querySelector('[data-ba-slider]');
    if(!slider) return;
    var range  = slider.querySelector('[data-ba-range]');
    var after  = slider.querySelector('[data-ba-after]');
    var handle = slider.querySelector('[data-ba-handle]');

    function update(value){
      after.style.clipPath = 'inset(0 ' + (100 - value) + '% 0 0)';
      handle.style.left = value + '%';
    }

    range.addEventListener('input', function(){ update(range.value); });
    update(range.value);
  })();

  /* ---------- Hero next arrow ---------- */
  var heroNext = document.querySelector('.hero-next');
  if(heroNext){
    heroNext.addEventListener('click', function(){
      var t = document.querySelector('#problema');
      if(t){ var top = t.getBoundingClientRect().top + window.scrollY - 100; window.scrollTo({top:top, behavior:'smooth'}); }
    });
  }

  /* ---------- Markets coverflow carousel ---------- */
  (function(){
    var track = document.getElementById('markets-track');
    var stage = document.getElementById('markets');
    var dotsWrap = document.getElementById('markets-dots');
    if(!track || !stage) return;
    var cards = Array.prototype.slice.call(track.querySelectorAll('.market-card'));
    var n = cards.length;
    if(!n) return;
    var active = 0, autoTimer = null;
    var mqMobile = window.matchMedia('(max-width:900px)');

    /* dots */
    var dots = [];
    cards.forEach(function(c, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role','tab');
      b.setAttribute('aria-label', (c.querySelector('h3') ? c.querySelector('h3').textContent : 'Área ' + (i+1)));
      b.addEventListener('click', function(){ go(i); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    function layout(){
      if(mqMobile.matches){
        cards.forEach(function(c){ c.style.transform=''; c.style.filter=''; c.style.opacity=''; c.style.zIndex=''; c.classList.remove('is-active'); });
        return;
      }
      for(var i=0;i<n;i++){
        var raw = i - active;
        if(raw >  n/2) raw -= n;
        if(raw < -n/2) raw += n;
        var abs = Math.abs(raw), sign = raw < 0 ? -1 : 1;
        var c = cards[i], tx, ry, tz, sc, op, zi;
        if(abs === 0){ tx=0; ry=0; tz=0; sc=1; op=1; zi=20; }
        else if(abs === 1){ tx=sign*38; ry=-sign*32; tz=-120; sc=.85; op=.85; zi=12; }
        else if(abs === 2){ tx=sign*68; ry=-sign*36; tz=-250; sc=.75; op=.6; zi=8; }
        else if(abs === 3){ tx=sign*90; ry=-sign*38; tz=-400; sc=.65; op=.4; zi=5; }
        else { tx=sign*105; ry=-sign*38; tz=-520; sc=.58; op=0; zi=1; }
        c.style.transform = 'translate(-50%,-50%) translateX('+tx+'%) translateZ('+tz+'px) rotateY('+ry+'deg) scale('+sc+')';
        c.style.filter = '';
        c.style.opacity = op;
        c.style.zIndex = zi;
        c.style.pointerEvents = op === 0 ? 'none' : 'auto';
        c.classList.toggle('is-active', abs === 0);
      }
      dots.forEach(function(d,i){ d.classList.toggle('active', i === active); });
    }
    function go(i){ active = (i % n + n) % n; layout(); }
    function next(){ go(active + 1); }
    function prev(){ go(active - 1); }

    var prevBtn = document.querySelector('.mk-prev');
    var nextBtn = document.querySelector('.mk-next');
    prevBtn && prevBtn.addEventListener('click', function(){ prev(); rest(); });
    nextBtn && nextBtn.addEventListener('click', function(){ next(); rest(); });

    /* click a side card -> bring to center; active card -> follow link */
    cards.forEach(function(c, i){
      c.addEventListener('click', function(e){
        if(mqMobile.matches) return;
        if(i !== active){ e.preventDefault(); go(i); rest(); }
      });
    });

    /* keyboard */
    stage.setAttribute('tabindex','0');
    stage.addEventListener('keydown', function(e){
      if(e.key === 'ArrowRight'){ e.preventDefault(); next(); rest(); }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); prev(); rest(); }
    });

    /* drag / swipe */
    var sx = 0, dragging = false;
    function down(x){ dragging = true; sx = x; stopAuto(); }
    function up(x){ if(!dragging) return; dragging = false; var d = x - sx; if(Math.abs(d) > 40){ d < 0 ? next() : prev(); } rest(); }
    stage.addEventListener('mousedown', function(e){ if(!mqMobile.matches) down(e.clientX); });
    window.addEventListener('mouseup', function(e){ up(e.clientX); });
    stage.addEventListener('touchstart', function(e){ down(e.touches[0].clientX); }, {passive:true});
    stage.addEventListener('touchend', function(e){ up((e.changedTouches[0]||{}).clientX || sx); });

    /* autoplay (pauses on hover/interaction) */
    function startAuto(){ if(mqMobile.matches) return; stopAuto(); autoTimer = setInterval(next, 4200); }
    function stopAuto(){ if(autoTimer){ clearInterval(autoTimer); autoTimer = null; } }
    function rest(){ stopAuto(); setTimeout(startAuto, 6000); }
    stage.addEventListener('mouseenter', stopAuto);
    stage.addEventListener('mouseleave', startAuto);

    mqMobile.addEventListener && mqMobile.addEventListener('change', layout);
    window.addEventListener('resize', layout);
    layout();
    startAuto();
  })();

  /* ---------- Tilt 3D nos cards (efeito premium no hover) ---------- */
  (function(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(window.matchMedia('(hover: none)').matches) return;
    var cards = document.querySelectorAll('.prod-card, .signal-card');
    var MAX_TILT = 6;
    cards.forEach(function(card){
      var lift = card.classList.contains('prod-card') ? -6 : -4;
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (0.5 - py) * MAX_TILT * 2;
        var ry = (px - 0.5) * MAX_TILT * 2;
        card.style.transition = 'transform .08s linear';
        card.style.transform = 'perspective(900px) translateY(' + lift + 'px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transition = 'transform .5s var(--ease)';
        card.style.transform = '';
      });
    });
  })();

  /* ---------- Equip showcase — arrows only ---------- */
  (function(){
    var viewport = document.querySelector('.equip-viewport');
    var track    = document.getElementById('equip-track');
    if(!track || !viewport) return;

    var slides = Array.prototype.slice.call(track.querySelectorAll('.equip-slide'));
    var n      = slides.length;
    if(!n) return;

    var tagEl  = document.querySelector('.equip-tag');
    var nameEl = document.querySelector('.equip-name');
    var descEl = document.querySelector('.equip-desc');
    var curEl  = document.querySelector('.equip-cur');
    var totEl  = document.querySelector('.equip-tot');
    if(totEl) totEl.textContent = ('0'+n).slice(-2);

    var current = -1;

    function setInfo(i){
      if(i === current) return;
      current = i;
      var s = slides[i];
      if(tagEl)  tagEl.textContent  = s.getAttribute('data-tag')  || '';
      if(nameEl){
        var nm = s.getAttribute('data-name') || '';
        // Destaca o número do modelo em laranja (ex.: SP-<b>150e</b>); nomes sem "SP-" ficam brancos.
        nameEl.innerHTML = nm.replace(/^(SP-)(.+)$/i, '$1<b>$2</b>');
      }
      if(descEl) descEl.textContent = s.getAttribute('data-desc') || '';
      if(curEl)  curEl.textContent  = ('0'+(i+1)).slice(-2);
    }

    function sizeSlides(){
      var sw = viewport.offsetWidth;
      slides.forEach(function(s){
        s.style.width = sw + 'px';
        var sc = s.getAttribute('data-scale') || '0.7';
        s.style.setProperty('--eq-scale', sc);
      });
      track.style.width = (sw * n) + 'px';
    }
    sizeSlides();

    function goTo(i){
      i = Math.max(0, Math.min(n-1, i));
      var sw = viewport.offsetWidth;
      track.style.transform = 'translateX(' + (-i * sw) + 'px)';
      setInfo(i);
    }

    var prevBtn = document.querySelector('.equip-prev');
    var nextBtn = document.querySelector('.equip-next');
    if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(current - 1); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(current + 1); });

    window.addEventListener('resize', function(){ sizeSlides(); goTo(current < 0 ? 0 : current); });
    goTo(0);
  })();

  /* ---------- Equip showcase — "tela deitada" que levanta no scroll ---------- */
  (function(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(window.matchMedia && window.matchMedia('(max-width: 860px)').matches) return;
    var stage   = document.querySelector('.equip-stage');
    var section = document.querySelector('.equip-section');
    if(!stage || !section) return;

    var MAX_TILT = 90;    /* 100% deitado — aparece como uma linha */
    var HOLD     = 0.22;  /* fração inicial do scroll em que fica deitado (delay) */
    var ticking  = false;

    function render(){
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var total = stage.offsetHeight - vh;
      if(total <= 0){ section.style.transform = 'none'; section.style.opacity = 1; return; }

      /* p = quanto já rolamos dentro do palco (0 = topo do palco no topo da tela) */
      var p = -stage.getBoundingClientRect().top / total;
      p = Math.max(0, Math.min(1, p));

      /* delay: mantém deitado até HOLD, depois levanta de forma suave */
      var rise = (p - HOLD) / (1 - HOLD);
      rise = Math.max(0, Math.min(1, rise));
      rise = 1 - Math.pow(1 - rise, 3);   /* easeOutCubic */

      var angle = MAX_TILT * (1 - rise);
      section.style.transform = 'rotateX(' + angle.toFixed(2) + 'deg)';
      section.style.opacity = (0.55 + 0.45 * rise).toFixed(3);
    }
    function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(render); } }

    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
    render();
  })();

  /* ---------- Carrossel de depoimentos (slide horizontal) ---------- */
  (function(){
    var track = document.getElementById('dep-track');
    if(!track) return;
    var slides = track.querySelectorAll('.dep-slide');
    var n = slides.length;
    if(!n) return;
    var cur = 0;
    var autoTimer;

    function go(i){
      cur = ((i % n) + n) % n;
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    }

    var prevBtn = document.querySelector('.dep-prev');
    var nextBtn = document.querySelector('.dep-next');
    if(prevBtn) prevBtn.addEventListener('click', function(){ go(cur - 1); rest(); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ go(cur + 1); rest(); });

    function start(){ stop(); autoTimer = setInterval(function(){ go(cur + 1); }, 6000); }
    function stop(){ clearInterval(autoTimer); }
    function rest(){ stop(); setTimeout(start, 9000); }

    var carousel = document.getElementById('dep-carousel');
    if(carousel){
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
    }
    start();
  })();

  /* ---------- Eraser reveal (antes/depois) ---------- */
  (function(){
    var wrap = document.getElementById('eraser');
    var canvas = document.getElementById('eraser-canvas');
    var hint = document.getElementById('eraser-hint');
    if(!wrap || !canvas) return;
    var ctx = canvas.getContext('2d');
    var beforeImg = new Image();
    beforeImg.src = 'assets/images/antes.jpg';
    var ready = false;
    var erasing = false;
    var RADIUS = 80;
    var resetTimer = null;
    var restoreRAF = null;
    var globalAlpha = 1;

    function init(){
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(beforeImg, 0, 0, canvas.width, canvas.height);
      ready = true;
      globalAlpha = 1;
    }

    function scheduleReset(){
      clearTimeout(resetTimer);
      cancelAnimationFrame(restoreRAF);
      resetTimer = setTimeout(restoreGradually, 5000);
    }

    function restoreGradually(){
      globalAlpha = 0;
      erasing = false;
      wrap.classList.remove('is-erasing');
      function step(){
        globalAlpha += 0.018;
        if(globalAlpha >= 1){
          globalAlpha = 1;
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(beforeImg, 0, 0, canvas.width, canvas.height);
          return;
        }
        ctx.globalAlpha = globalAlpha;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(beforeImg, 0, 0, canvas.width, canvas.height);
        restoreRAF = requestAnimationFrame(step);
      }
      restoreRAF = requestAnimationFrame(step);
    }

    beforeImg.onload = function(){ init(); };
    window.addEventListener('resize', function(){ if(ready){ cancelAnimationFrame(restoreRAF); clearTimeout(resetTimer); init(); } });

    function erase(x, y){
      if(!ready) return;
      cancelAnimationFrame(restoreRAF);
      if(!erasing){ erasing = true; wrap.classList.add('is-erasing'); globalAlpha = 1; }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      scheduleReset();
    }

    function getPos(e){
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    var drawing = false;
    canvas.addEventListener('mouseenter', function(){ drawing = true; });
    canvas.addEventListener('mouseleave', function(){ drawing = false; });
    canvas.addEventListener('mousemove', function(e){
      if(!drawing) return;
      var p = getPos(e);
      erase(p.x, p.y);
    });

    var touching = false;
    canvas.addEventListener('touchstart', function(e){
      touching = true;
      var p = getPos(e.touches[0]);
      erase(p.x, p.y);
      e.preventDefault();
    }, {passive:false});
    canvas.addEventListener('touchmove', function(e){
      if(!touching) return;
      var p = getPos(e.touches[0]);
      erase(p.x, p.y);
      e.preventDefault();
    }, {passive:false});
    canvas.addEventListener('touchend', function(){ touching = false; });
  })();

  /* ---------- Smooth anchor with sticky-header offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length < 2) return;
      var t = document.querySelector(id);
      if(t){ e.preventDefault(); var top = t.getBoundingClientRect().top + window.scrollY - 100; window.scrollTo({top:top, behavior:'smooth'}); }
    });
  });
})();
