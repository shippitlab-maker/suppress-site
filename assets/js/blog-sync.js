/* SUPPRESS — blog-sync.js
   Mantém a seção "Últimos artigos do blog" da home sempre igual aos
   artigos em destaque de blog.html, sem precisar editar os dois arquivos
   toda vez que um post novo entra em destaque. Se o fetch falhar (ex.:
   aberto via file:// sem servidor), os 3 cards estáticos do HTML
   continuam no lugar como fallback. */
(function () {
  'use strict';

  var grid = document.querySelector('.blog-grid');
  if (!grid) return; // só existe na home

  function text(el) {
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function extractFromFeatured(doc) {
    var posts = [];

    var hero = doc.querySelector('#destaques .article-featured');
    if (hero) {
      var heroImg = hero.querySelector('.article-featured__image img');
      var heroMeta = hero.querySelectorAll('.article-featured__meta span');
      posts.push({
        href: hero.getAttribute('href'),
        img: heroImg ? heroImg.getAttribute('src') : '',
        alt: heroImg ? heroImg.getAttribute('alt') : '',
        cat: text(hero.querySelector('.article-featured__tag')),
        title: text(hero.querySelector('.article-featured__title')),
        excerpt: text(hero.querySelector('.article-featured__excerpt')),
        date: heroMeta.length > 1 ? text(heroMeta[1]) : '',
        readTime: heroMeta.length > 2 ? text(heroMeta[2]).replace(' de leitura', '') : ''
      });
    }

    var secondary = doc.querySelectorAll('#destaques .grid-2 .article-card');
    for (var i = 0; i < secondary.length && posts.length < 3; i++) {
      var card = secondary[i];
      var img = card.querySelector('.article-card__image img');
      var linkEl = card.querySelector('.article-card__title a');
      if (!linkEl) continue;
      posts.push({
        href: linkEl.getAttribute('href'),
        img: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        cat: text(card.querySelector('.article-card__category')),
        title: text(linkEl),
        excerpt: text(card.querySelector('.article-card__excerpt')),
        date: text(card.querySelector('.article-card__meta span:last-child')),
        readTime: text(card.querySelector('.article-card__read-time'))
      });
    }

    return posts.slice(0, 3);
  }

  function cardMarkup(post, delay) {
    return (
      '<article class="post-card" data-delay="' + delay + '">' +
        '<a href="' + post.href + '" style="display:block">' +
          '<div class="post-card__image" style="aspect-ratio:16/10;overflow:hidden">' +
            '<img src="' + post.img + '" alt="' + post.alt + '" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy">' +
          '</div>' +
        '</a>' +
        '<a href="' + post.href + '" class="post-card__body" style="display:block">' +
          '<span class="cat">' + post.cat + '</span>' +
          '<h3>' + post.title + '</h3>' +
          '<p>' + post.excerpt + '</p>' +
          '<div class="meta">' +
            '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ' + post.date + '</span>' +
            '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ' + post.readTime + '</span>' +
          '</div>' +
        '</a>' +
      '</article>'
    );
  }

  fetch('blog.html')
    .then(function (res) { return res.ok ? res.text() : Promise.reject(res.status); })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var posts = extractFromFeatured(doc);
      if (!posts.length) return;
      grid.innerHTML = posts.map(cardMarkup).join('');
    })
    .catch(function (err) {
      console.warn('blog-sync: usando cards estáticos (fallback).', err);
    });
})();
