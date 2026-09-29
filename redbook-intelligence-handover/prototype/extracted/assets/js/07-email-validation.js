/* ------------------------------------------------------------------
   Every email field on the page answers to the same rule, including the
   one in the request panel. Nothing is posted anywhere yet; a valid entry
   simply acknowledges itself so the field is not a dead end.
   ------------------------------------------------------------------ */
(function(){
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function note(field, cls, msg){
    var row = field.closest('.form-row') || field.parentNode;
    var el = row.querySelector('.form-err, .form-ok');
    if(!msg){ if(el) el.remove(); row.classList.remove('is-bad'); field.removeAttribute('aria-invalid'); return; }
    if(!el){ el = document.createElement('p'); row.appendChild(el); }
    row.classList.toggle('is-bad', cls === 'form-err');
    el.className = cls;
    el.textContent = msg;
    el.setAttribute('role', cls === 'form-err' ? 'alert' : 'status');
    field.setAttribute('aria-invalid', cls === 'form-err' ? 'true' : 'false');
  }

  function check(form){
    var first = null;
    [].slice.call(form.querySelectorAll('input')).forEach(function(f){
      var v = (f.value || '').trim(), msg = '';
      if(f.type === 'email'){
        if(!v) msg = 'Enter your email address';
        else if(!EMAIL.test(v)) msg = 'That does not look like an email address';
      } else if(f.required && !v){
        msg = 'This one is needed';
      }
      note(f, 'form-err', msg);
      if(msg && !first) first = f;
    });
    if(first) first.focus();
    return !first;
  }

  /* capture, so an invalid entry is stopped before any other submit handler
     runs - the request panel must not close on a bad address */
  document.addEventListener('submit', function(e){
    var form = e.target.closest && e.target.closest('form[data-validate]');
    if(!form) return;
    if(!check(form)){ e.preventDefault(); e.stopPropagation(); return; }
    if(!form.id){                       /* the inline bars have nowhere to post */
      e.preventDefault();
      var mail = form.querySelector('input[type="email"]');
      if(mail){ note(mail, 'form-ok', 'Thank you, we will be in touch.'); mail.value = ''; }
    }
  }, true);

  /* a field clears its own complaint as soon as it is put right */
  document.addEventListener('input', function(e){
    var f = e.target;
    if(f && f.tagName === 'INPUT' && f.getAttribute('aria-invalid') === 'true'){
      var v = (f.value || '').trim();
      if(f.type === 'email' ? EMAIL.test(v) : !!v) note(f, '', '');
    }
  });
})();
