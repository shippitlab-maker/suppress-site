/* SUPPRESS — scroll-fx.js
   Efeitos de rolagem: parallax do hero (suavizado/lerp), barra de
   progresso e parallax leve de blocos marcados com [data-parallax].
   Não sequestra o scroll nativo — apenas aplica transforms em rAF,
   mantendo trackpad/touch fluidos. Respeita prefers-reduced-motion. */
(function(){
  'use strict';
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var progress = document.querySelector('.scroll-progress');
  var hero = document.querySelector('.hero');
  var layers = {
    bg   : document.querySelector('.hero__bg img'),
    content: document.querySelector('.hero__content')
  };
  var parEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

  /* mede a posição-base (sem transform) de cada elemento de parallax */
  function measure(){
    parEls.forEach(function(el){
      el.style.transform = '';
      var r = el.getBoundingClientRect();
      el.__base = r.top + (window.scrollY||window.pageYOffset||0) + r.height/2;
      el.__speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
    });
  }
  measure();

  var target = window.scrollY || window.pageYOffset || 0;
  var cur = target;
  var running = false;

  function render(){
    var vh = window.innerHeight || document.documentElement.clientHeight;

    /* barra de progresso (segue o scroll real, sem lerp) */
    if(progress){
      var max = document.documentElement.scrollHeight - vh;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(target/max, 1) : 0) + ')';
    }

    /* parallax do hero — usa valor suavizado (lerp) p/ sensação fluida */
    if(hero){
      var hh = hero.offsetHeight;
      if(cur < hh + 240){
        var s = cur;
        if(layers.bg) layers.bg.style.setProperty('--py', (s * 0.18) + 'px');
        if(layers.content){
          layers.content.style.transform = 'translateY(' + (s * 0.18) + 'px)';
          layers.content.style.opacity = Math.max(0, 1 - s / (hh * 0.6));
        }
      }
    }

    /* parallax leve de blocos marcados */
    for(var i=0;i<parEls.length;i++){
      var el = parEls[i];
      var rel = (target + vh/2) - el.__base;   /* distância ao centro da viewport */
      el.style.transform = 'translate3d(0,' + (rel * el.__speed) + 'px,0)';
    }
  }

  function loop(){
    cur += (target - cur) * 0.12;
    if(Math.abs(target - cur) < 0.35) cur = target;
    render();
    if(cur !== target){ requestAnimationFrame(loop); }
    else { running = false; }
  }
  function onScroll(){
    target = window.scrollY || window.pageYOffset || 0;
    if(!running){ running = true; requestAnimationFrame(loop); }
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', function(){ measure(); onScroll(); });
  window.addEventListener('load', function(){ measure(); render(); });
  render();
})();
