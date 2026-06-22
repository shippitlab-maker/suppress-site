/* SUPPRESS — forms.js : máscara BR + validação inline (sem libs, sem alert) */
(function(){
  'use strict';
  var form = document.getElementById('form-diagnostico');
  if(!form) return;

  /* Máscara telefone BR (99) 99999-9999 */
  var tel = form.querySelector('input[name="telefone"]');
  if(tel){
    tel.addEventListener('input', function(){
      var v = tel.value.replace(/\D/g,'').slice(0,11);
      var out = '';
      if(v.length > 0) out = '(' + v.slice(0,2);
      if(v.length >= 2) out += ') ';
      if(v.length > 2) out += v.length > 6 ? v.slice(2,7)+'-'+v.slice(7) : v.slice(2);
      tel.value = out.trim();
    });
  }

  function setError(field, on){
    field.classList.toggle('invalid', on);
  }
  function fieldOf(input){ return input.closest('.field') || input.closest('.check-lgpd'); }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(){
    var ok = true;
    form.querySelectorAll('[required]').forEach(function(input){
      var f = fieldOf(input); if(!f) return;
      var bad = false;
      if(input.type === 'checkbox') bad = !input.checked;
      else if(input.name === 'email') bad = !emailRe.test(input.value.trim());
      else if(input.name === 'telefone') bad = input.value.replace(/\D/g,'').length < 10;
      else bad = input.value.trim() === '';
      setError(f, bad);
      if(bad) ok = false;
    });
    return ok;
  }

  /* live-clear errors */
  form.querySelectorAll('input,select,textarea').forEach(function(input){
    input.addEventListener('input', function(){ var f = fieldOf(input); if(f && f.classList.contains('invalid')) f.classList.remove('invalid'); });
    input.addEventListener('change', function(){ var f = fieldOf(input); if(f && f.classList.contains('invalid')) f.classList.remove('invalid'); });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!validate()){
      var first = form.querySelector('.invalid');
      if(first){ var top = first.getBoundingClientRect().top + window.scrollY - 120; window.scrollTo({top:top, behavior:'smooth'}); }
      return;
    }
    /* Sucesso (placeholder — em produção: action Formspree/webhook) */
    var card = document.getElementById('form-card-body');
    var success = document.getElementById('form-success');
    if(card && success){ card.style.display='none'; success.classList.add('show'); }
  });
})();
