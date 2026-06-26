(function () {
  'use strict';

  var overlay = document.getElementById('modal-proposta');
  if (!overlay) return;

  var modal = overlay.querySelector('.modal');
  var closeBtn = overlay.querySelector('.modal__close');
  var form = overlay.querySelector('form');
  var formBody = overlay.querySelector('.modal__body');
  var formSuccess = overlay.querySelector('.form-success');
  var productInput = overlay.querySelector('[name="produto"]');
  var productBadge = overlay.querySelector('.modal__product-badge span');

  function open(productName) {
    if (productInput && productName) productInput.value = productName;
    if (productBadge && productName) productBadge.textContent = productName;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var first = form && form.querySelector('input, select, textarea');
    if (first) setTimeout(function () { first.focus(); }, 350);
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', close);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  document.querySelectorAll('[data-open-proposta]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      open(btn.getAttribute('data-product-name') || '');
    });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      form.querySelectorAll('[required]').forEach(function (el) {
        var field = el.closest('.field') || el.parentElement;
        if (!el.value.trim() || (el.type === 'checkbox' && !el.checked)) {
          if (field) field.classList.add('invalid');
          valid = false;
        } else {
          if (field) field.classList.remove('invalid');
        }
      });

      if (!valid) return;

      if (formBody) formBody.style.display = 'none';
      if (formSuccess) formSuccess.classList.add('show');
    });
  }
})();
