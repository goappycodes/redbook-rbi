/* The header's "Menu" on phones. The nav links are hidden below 980px, so this
   slides them in as an overlay. Mirrors the request dialog: is-open + scroll
   lock + focus trap + close on Escape / backdrop / link / resize to desktop. */
(function(){
  var btn  = document.getElementById('menuBtn'),
      menu = document.getElementById('mobileMenu');
  if(!btn || !menu) return;
  var panel = menu.querySelector('.mnav__panel'),
      shut  = document.getElementById('menuClose'),
      from  = null;

  function show(e){
    if(e) e.preventDefault();
    if(menu.classList.contains('is-open')) return;
    from = document.activeElement;
    menu.removeAttribute('hidden');
    void menu.getBoundingClientRect();
    menu.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    if(window.rbScrollLock) window.rbScrollLock.on();
    if(shut) shut.focus();
  }
  function hide(){
    if(!menu.classList.contains('is-open')) return;   /* or the lock unbalances */
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(function(){ menu.setAttribute('hidden',''); }, 360);
    if(window.rbScrollLock) window.rbScrollLock.off();
    if(from && from.focus) from.focus();
  }

  btn.addEventListener('click', show);
  if(shut) shut.addEventListener('click', hide);
  menu.addEventListener('mousedown', function(e){ if(!panel.contains(e.target)) hide(); });
  /* picking a destination closes the menu */
  panel.addEventListener('click', function(e){
    if(e.target.closest && e.target.closest('a')) hide();
  });
  document.addEventListener('keydown', function(e){
    if(!menu.classList.contains('is-open')) return;
    if(e.key === 'Escape'){ hide(); return; }
    if(e.key === 'Tab'){
      var f = [].slice.call(panel.querySelectorAll('a[href], button')).filter(function(x){ return !x.disabled; });
      if(!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  /* if the viewport grows past the mobile break, drop the overlay */
  window.addEventListener('resize', function(){
    if(window.innerWidth > 980) hide();
  });
})();
