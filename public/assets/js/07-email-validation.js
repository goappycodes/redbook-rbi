/* ------------------------------------------------------------------
   Every email field on the page answers to the same rule, including the
   one in the request panel. A valid entry is posted to /api/forms, which
   stores it in Supabase and sends the notification email.
   ------------------------------------------------------------------ */
(function(){
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var BASE = document.body.getAttribute('data-base') || '';
  var LOADED = Date.now();

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
    [].slice.call(form.querySelectorAll('input:not([data-hp])')).forEach(function(f){
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

  /* One way in for all four forms. Resolves on success, rejects with a
     message worth showing. */
  function post(form){
    var body = { source: form.getAttribute('data-source'), elapsed: Date.now() - LOADED,
                 page: location.href, referrer: document.referrer };
    [].slice.call(form.querySelectorAll('input[name]')).forEach(function(f){ body[f.name] = f.value.trim(); });
    var qs = new URLSearchParams(location.search), utm = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(function(k){ if(qs.get(k)) utm[k] = qs.get(k); });
    body.utm = utm;
    return fetch(BASE + '/api/forms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(function(res){
      return res.json().catch(function(){ return {}; }).then(function(j){
        if(!res.ok || !j.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
        return j;
      });
    }, function(){ throw new Error('Could not send. Check your connection and try again.'); });
  }
  window.rbPostForm = post;
  window.rbFormNote = note;

  /* capture, so an invalid entry is stopped before any other submit handler
     runs - the request panel must not close on a bad address */
  document.addEventListener('submit', function(e){
    var form = e.target.closest && e.target.closest('form[data-validate]');
    if(!form) return;
    if(!check(form)){ e.preventDefault(); e.stopPropagation(); return; }
    if(form.id) return;                 /* the request panel posts for itself */
    e.preventDefault();
    var mail = form.querySelector('input[type="email"]');
    var btn = form.querySelector('button[type="submit"]');
    if(form.classList.contains('is-busy')) return;
    form.classList.add('is-busy'); if(btn) btn.disabled = true;
    post(form).then(function(){
      if(mail){
        note(mail, 'form-ok', form.getAttribute('data-ok') || 'Thank you, we will be in touch.');
        mail.value = '';
      }
    }, function(err){
      if(mail) note(mail, 'form-err', err.message);
    }).then(function(){
      form.classList.remove('is-busy'); if(btn) btn.disabled = false;
    });
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
