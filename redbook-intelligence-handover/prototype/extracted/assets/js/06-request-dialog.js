/* The request panel. There is no backend yet, so submitting only closes it;
   the fields are real inputs so the wiring is a matter of posting them. */
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
    if(e.key === 'Escape' && dlg.classList.contains('is-open')) hide();
  });
  form.addEventListener('submit', function(e){ e.preventDefault(); hide(); });
})();
