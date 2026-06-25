/* ================================================================
   SUPPRESS — Showcase de Produtos (carrossel 1-a-1)
   Atualiza o painel de info, a imagem ativa, o número-fantasma,
   as thumbnails e o contador. Navegação por setas, thumbs,
   teclado (←/→) e swipe no mobile.
   ================================================================ */
(function () {
  'use strict';

  var showcase = document.querySelector('.product-showcase');
  if (!showcase) return;

  // Dados dos produtos — de uma ilha JSON (#ps-products) se existir; senão, embutidos.
  var dataEl = document.getElementById('ps-products');
  var PRODUCTS = dataEl ? JSON.parse(dataEl.textContent) : [
    {
      num: '15', line: 'Pequeno Porte',
      tagline: 'Controle de poeira em espaços confinados, obras e pátios de pequeno porte.',
      specs: [['Alcance', '30 m'], ['Vazão', '15 m³/h'], ['Alimentação', '220 V'], ['Rotação', '360°']],
      tags: ['Construção', 'Demolição', 'Pátios', 'Confinados'], ghost: '15'
    },
    {
      num: '35', line: 'Médio Porte',
      tagline: 'Ideal para pátios de médio porte, usinas de beneficiamento e britagem.',
      specs: [['Alcance', '35 m'], ['Vazão', '35 m³/h'], ['Alimentação', '380 V'], ['Rotação', '360°']],
      tags: ['Mineração', 'Britagem', 'Siderurgia'], ghost: '35'
    },
    {
      num: '35t', line: 'Médio Porte · Telescópico',
      tagline: 'Versão telescópica do SP-35 para instalação em altura com maior alcance vertical.',
      specs: [['Alcance', '35+ m'], ['Vazão', '35 m³/h'], ['Haste', 'até 6 m'], ['Alimentação', '380 V']],
      tags: ['Mineração', 'Portos', 'Pátios de Estocagem'], ghost: '35'
    },
    {
      num: '55', line: 'Grande Porte',
      tagline: 'Cobertura ampla para pátios de estocagem, mineração e aciarias.',
      specs: [['Alcance', '55 m'], ['Vazão', '55 m³/h'], ['Potência', '15 kW'], ['Rotação', '360°']],
      tags: ['Mineração', 'Siderurgia', 'Portos'], ghost: '55'
    },
    {
      num: '65', line: 'Grande Porte',
      tagline: 'Longo alcance para grandes pátios e operações de mineração a céu aberto.',
      specs: [['Alcance', '65 m'], ['Vazão', '65 m³/h'], ['Potência', '22 kW'], ['Rotação', '360°']],
      tags: ['Mineração', 'Barragens', 'Terminais'], ghost: '65'
    },
    {
      num: '150', line: 'Grande Porte',
      tagline: 'Alcance máximo para imensos pátios de estocagem e mineração a céu aberto.',
      specs: [['Alcance', '150 m'], ['Vazão', '150 m³/h'], ['Potência', '55 kW'], ['Rotação', '360°']],
      tags: ['Mineração a céu aberto', 'Grandes pátios'], ghost: '150'
    },
    {
      num: '65e', line: 'Alta Vazão',
      tagline: 'Booster de alta pressão com controle remoto incluso para poeira intensa.',
      specs: [['Alcance', 'até 65 m'], ['Vazão', '65 m³/h+'], ['Booster', 'Alta pressão'], ['Controle', 'Remoto']],
      tags: ['Alta poeira', 'Automação', 'Mineração'], ghost: '65'
    },
    {
      num: '150e', line: 'Alta Vazão',
      tagline: 'Booster de alta pressão, controle remoto e estação meteorológica integrada.',
      specs: [['Alcance', 'até 150 m'], ['Vazão', '150 m³/h+'], ['Booster', 'Alta pressão'], ['Extra', 'Est. meteorológica']],
      tags: ['Grandes complexos', 'Automação', 'Siderurgia'], ghost: '150'
    },
    {
      name: 'Conjunto Móvel', line: 'Solução Móvel',
      tagline: 'Unidade autônoma sobre carreta com reservatório integrado — pronto para operar em qualquer local.',
      specs: [['Tipo', 'Autônomo'], ['Base', 'Carreta'], ['Reservatório', 'Integrado'], ['Mobilidade', 'Total']],
      tags: ['Obras', 'Projetos temporários', 'Mineração'], ghost: ''
    }
  ];

  var imgs    = Array.prototype.slice.call(showcase.querySelectorAll('.ps-img'));
  var thumbs  = Array.prototype.slice.call(showcase.querySelectorAll('.ps-thumb'));
  var info    = showcase.querySelector('.ps-info');
  var elLine  = showcase.querySelector('[data-line]');
  var elName  = showcase.querySelector('[data-name]');
  var elTag   = showcase.querySelector('[data-tagline]');
  var elSpecs = showcase.querySelector('[data-specs]');
  var elTags  = showcase.querySelector('[data-tags]');
  var elCta   = showcase.querySelector('[data-cta]');
  var elCtaTx = showcase.querySelector('.ps-info__cta-txt');
  var elGhost = showcase.querySelector('[data-ghost]');
  var elCount = showcase.querySelector('[data-current]');
  var btnPrev = showcase.querySelector('.ps-nav--prev');
  var btnNext = showcase.querySelector('.ps-nav--next');

  var total   = PRODUCTS.length;
  var current = 0;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function updateInfo(p) {
    if (elLine) elLine.textContent = p.line || '';
    if (elName) {
      elName.innerHTML = p.name
        ? p.name.replace(/^(SP-)(.+)$/i, '$1<b>$2</b>')
        : 'SP-<b>' + p.num + '</b>';
    }
    if (elTag) elTag.textContent = p.tagline || '';

    // specs/tags são opcionais (o Home não usa) — só renderiza se existirem.
    if (elSpecs && p.specs) {
      elSpecs.innerHTML = p.specs.map(function (s) {
        return '<li><span class="k">' + s[0] + '</span><span class="v">' + s[1] + '</span></li>';
      }).join('');
    }
    if (elTags && p.tags) {
      elTags.innerHTML = p.tags.map(function (t) {
        return '<span class="ps-tag">' + t + '</span>';
      }).join('');
    }

    if (elCtaTx) {
      elCtaTx.textContent = p.cta
        ? p.cta
        : 'Solicitar Proposta para ' + (p.name || ('SP-' + p.num));
    }
    if (elGhost) elGhost.textContent = (p.ghost != null) ? p.ghost : '';
  }

  function retriggerSwap() {
    if (prefersReduced) return;
    info.classList.remove('is-swap');
    /* força reflow para reiniciar a animação */
    void info.offsetWidth;
    info.classList.add('is-swap');
  }

  function goTo(index) {
    index = (index + total) % total;
    if (index === current && imgs[index].classList.contains('is-active')) {
      // já ativo (chamada inicial roda mesmo assim na 1ª vez)
    }
    var p = PRODUCTS[index];

    imgs.forEach(function (img, i) { img.classList.toggle('is-active', i === index); });
    thumbs.forEach(function (th, i) {
      var on = i === index;
      th.classList.toggle('is-active', on);
      th.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    updateInfo(p);
    retriggerSwap();

    if (elCount) elCount.textContent = pad(index + 1);
    current = index;

    // Centraliza a thumb ativa SOMENTE dentro da própria faixa.
    // NÃO usar scrollIntoView aqui: como .product-showcase tem overflow:hidden,
    // o scrollIntoput rolaria a seção inteira (texto + imagem) para a esquerda.
    var activeThumb = thumbs[index];
    var strip = activeThumb && activeThumb.parentElement;
    if (strip) {
      var target = Math.max(0, activeThumb.offsetLeft - (strip.clientWidth - activeThumb.offsetWidth) / 2);
      if (strip.scrollTo) strip.scrollTo({ left: target, behavior: prefersReduced ? 'auto' : 'smooth' });
      else strip.scrollLeft = target;
    }

    // Trava de segurança: a seção nunca pode ficar deslocada horizontalmente.
    showcase.scrollLeft = 0;
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (btnNext) btnNext.addEventListener('click', next);
  if (btnPrev) btnPrev.addEventListener('click', prev);

  thumbs.forEach(function (th) {
    th.addEventListener('click', function () {
      goTo(parseInt(th.getAttribute('data-thumb'), 10));
    });
  });

  // Teclado: só quando o foco está dentro do showcase
  showcase.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  // Swipe no touch
  var startX = null;
  var stage = showcase.querySelector('.ps-stage');
  if (stage) {
    stage.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); }
      startX = null;
    }, { passive: true });
  }

  // Estado inicial
  goTo(0);
})();
