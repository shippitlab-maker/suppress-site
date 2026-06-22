/* ================================================================
   SUPPRESS — Forms JavaScript
   Validation, submission, feedback
   ================================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     VALIDATION HELPERS
     ---------------------------------------------------------------- */
  const validators = {
    required: (v) => v.trim() !== '',
    email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone:    (v) => v.replace(/\D/g, '').length >= 10,
    minlen:   (v, n) => v.trim().length >= Number(n),
  };

  function getError(input) {
    const value = input.value;
    const rules = (input.dataset.validate || '').split('|').filter(Boolean);

    for (const rule of rules) {
      const [name, arg] = rule.split(':');
      if (!validators[name]) continue;
      if (!validators[name](value, arg)) {
        return input.dataset[`error${name.charAt(0).toUpperCase() + name.slice(1)}`]
          || getDefaultError(name, arg);
      }
    }
    return null;
  }

  function getDefaultError(rule, arg) {
    const messages = {
      required: 'Este campo é obrigatório.',
      email:    'Digite um e-mail válido.',
      phone:    'Digite um telefone válido com DDD.',
      minlen:   `Mínimo de ${arg} caracteres.`,
    };
    return messages[rule] || 'Campo inválido.';
  }

  function showError(input, message) {
    input.classList.add('form__input--error');
    input.setAttribute('aria-invalid', 'true');
    let msgEl = input.parentElement.querySelector('.form__error-msg');
    if (!msgEl) {
      msgEl = document.createElement('span');
      msgEl.className = 'form__error-msg';
      msgEl.setAttribute('role', 'alert');
      input.parentElement.appendChild(msgEl);
    }
    msgEl.textContent = message;
    msgEl.classList.add('visible');
  }

  function clearError(input) {
    input.classList.remove('form__input--error');
    input.setAttribute('aria-invalid', 'false');
    const msgEl = input.parentElement.querySelector('.form__error-msg');
    if (msgEl) {
      msgEl.classList.remove('visible');
      msgEl.textContent = '';
    }
  }

  function validateInput(input) {
    const error = getError(input);
    if (error) {
      showError(input, error);
      return false;
    }
    clearError(input);
    return true;
  }

  /* ----------------------------------------------------------------
     LIVE VALIDATION (on blur)
     ---------------------------------------------------------------- */
  document.querySelectorAll('[data-validate]').forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('form__input--error')) {
        validateInput(input);
      }
    });
  });

  /* ----------------------------------------------------------------
     FORM SUBMISSION
     ---------------------------------------------------------------- */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validate all fields
      const inputs = Array.from(form.querySelectorAll('[data-validate]'));
      const lgpdCheckbox = form.querySelector('[data-lgpd]');
      let valid = inputs.map(inp => validateInput(inp)).every(Boolean);

      // Check LGPD checkbox
      if (lgpdCheckbox && !lgpdCheckbox.checked) {
        showError(lgpdCheckbox, 'Você precisa aceitar para continuar.');
        valid = false;
      }

      if (!valid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Loading state
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" class="spin" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Enviando...
        `;
      }

      // Build form data
      const formData = new FormData(form);
      const action   = form.action || '#';

      try {
        // Try to submit (Formspree or similar)
        if (action && action !== '#' && action !== window.location.href) {
          const res = await fetch(action, {
            method:  'POST',
            body:    formData,
            headers: { 'Accept': 'application/json' },
          });

          if (!res.ok) throw new Error('Server error');
        } else {
          // Demo mode: simulate success
          await new Promise(resolve => setTimeout(resolve, 1200));
        }

        showSuccess(form);
      } catch (err) {
        // Restore button on error
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showFormError(form, 'Ocorreu um erro. Tente novamente ou entre em contato pelo WhatsApp.');
      }
    });
  });

  function showSuccess(form) {
    const successEl = form.parentElement.querySelector('.form__success');
    if (successEl) {
      form.style.display = 'none';
      successEl.classList.add('visible');
      successEl.focus();
    } else {
      // Inline success message
      const msg = document.createElement('div');
      msg.className = 'form__success visible';
      msg.setAttribute('tabindex', '-1');
      msg.innerHTML = `
        <div class="form__success-title">Mensagem enviada!</div>
        <p class="form__success-text">
          Obrigado! Nossa equipe entrará em contato em até 48h.
          Você também pode nos acionar pelo WhatsApp para agilizar.
        </p>
      `;
      form.parentElement.insertBefore(msg, form);
      form.remove();
      msg.focus();
    }
  }

  function showFormError(form, message) {
    let errorBanner = form.querySelector('.form__banner-error');
    if (!errorBanner) {
      errorBanner = document.createElement('div');
      errorBanner.className = 'form__banner-error';
      errorBanner.style.cssText = `
        background: rgba(231,76,60,0.12);
        border: 1px solid #E74C3C;
        border-radius: 4px;
        padding: 12px 16px;
        font-size: 0.875rem;
        color: #E74C3C;
        margin-bottom: 16px;
      `;
      form.prepend(errorBanner);
    }
    errorBanner.textContent = message;
  }

  /* ----------------------------------------------------------------
     SPIN ANIMATION for loading button
     ---------------------------------------------------------------- */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.8s linear infinite; }
  `;
  document.head.appendChild(style);

})();
