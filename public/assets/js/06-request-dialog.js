/* The request panel. Submitting raises a request (/api/forms) - someone at
   RedBook sends the index by email; nothing is delivered from here. */
(function(){
  var open = document.getElementById('reqIndex'),
      dlg  = document.getElementById('reqDlg');
  if(!open || !dlg) return;
  var panel = dlg.querySelector('.dlg__panel'),
      form  = document.getElementById('reqForm'),
      shut  = document.getElementById('reqDlgX'),
      from  = null;

  function show(e){
    if(e) e.preventDefault();
    if(dlg.classList.contains('is-open')) return;
    from = document.activeElement;
    dlg.removeAttribute('hidden');
    void dlg.getBoundingClientRect();
    dlg.classList.add('is-open');
    if(window.rbScrollLock) window.rbScrollLock.on();
    var first = form.querySelector('input');
    if(first) first.focus();
  }
  function hide(){
    if(!dlg.classList.contains('is-open')) return;   /* or the lock unbalances */
    dlg.classList.remove('is-open');
    setTimeout(function(){ dlg.setAttribute('hidden',''); }, 360);
    if(window.rbScrollLock) window.rbScrollLock.off();
    if(from && from.focus) from.focus();
  }
  open.addEventListener('click', show);
  shut.addEventListener('click', hide);
  dlg.addEventListener('mousedown', function(e){ if(!panel.contains(e.target)) hide(); });
  document.addEventListener('keydown', function(e){
    if(!dlg.classList.contains('is-open')) return;
    if(e.key === 'Escape') { hide(); return; }
    /* keep Tab inside the panel while it is open */
    if(e.key === 'Tab'){
      var f = [].slice.call(panel.querySelectorAll('button, input:not([data-hp])')).filter(function(x){ return !x.disabled; });
      if(!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  /* validation has already run (07, capture phase); a bad entry never gets here */
  var busy = false;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(busy || !window.rbPostForm) return;
    busy = true;
    var btn = form.querySelector('button[type="submit"]');
    var mail = form.querySelector('input[type="email"]');
    if(btn) btn.disabled = true;
    window.rbPostForm(form).then(function(){
      window.rbFormNote(mail, 'form-ok', form.getAttribute('data-ok') || 'Thank you.');
      setTimeout(function(){
        hide();
        form.reset();
        window.rbFormNote(mail, '', '');
      }, 1600);
    }, function(err){
      window.rbFormNote(mail, 'form-err', err.message);
    }).then(function(){
      busy = false;
      if(btn) btn.disabled = false;
    });
  });
})();
