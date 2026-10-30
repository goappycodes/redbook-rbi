(function(){
  'use strict';
  /* Anchor scrolling, offset for the fixed section bar.

     Two problems this fixes:
      1. On a first load of a URL with a #hash, the browser's own fragment jump
         fires while the page is still growing (images, reveals, web fonts), so
         it lands short - usually at the very top. We re-apply the jump until the
         layout settles.
      2. The on-load jump, in-page #links and address-bar hash changes would all
         otherwise tuck the section under the fixed .sec-nav bar. We scroll to
         the target minus a fixed offset so its heading clears the bar. */
  var OFFSET = 56; /* keep in step with html{scroll-padding-top} in 02-page.css */
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function targetY(el){
    return Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - OFFSET);
  }
  function jump(y){ window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'instant' }); }

  /* --- smooth scroll, hand-rolled ----------------------------------------
     Native programmatic smooth scrolling does not work on this page, and a
     requestAnimationFrame loop of instant steps is swallowed too (something
     else reclaims the frame), so the animation is driven on a timer instead -
     that always lands. A token retires any run still in flight; a real wheel,
     touch or key hands control straight back to the reader. */
  var animId = 0;
  function glide(y){
    y = Math.max(0, Math.round(y));
    animId++;
    var mine = animId, start = window.pageYOffset, dist = y - start;
    if(!dist) return;
    if(REDUCE){ jump(y); return; }
    var dur = Math.min(700, Math.max(260, Math.abs(dist) * 0.5)), t0 = performance.now();
    ['wheel','touchstart','keydown'].forEach(function(ev){
      window.addEventListener(ev, function(){ animId++; }, { passive:true, once:true });
    });
    function ease(p){ return p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2) / 2; }
    var iv = setInterval(function(){
      if(mine !== animId){ clearInterval(iv); return; }   /* superseded or handed back */
      var p = Math.min(1, (performance.now() - t0) / dur);
      jump(start + dist * ease(p));
      if(p >= 1) clearInterval(iv);
    }, 16);
  }

  /* The on-load settle loop keeps nudging to the target while late layout shifts
     move it, then stops. Any new navigation intent (a link, the address bar) or
     a real scroll gesture ends it, so it never fights the reader or a later nav. */
  var endSettle = null;
  function settleToHash(){
    var id = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    var el;
    try { el = id && document.getElementById(id); } catch(e){ el = null; }
    if(!el) return;
    jump(targetY(el));
    var elapsed = 0, lastTop = null, stable = 0, iv;
    endSettle = function(){ if(iv) clearInterval(iv); iv = null; endSettle = null; };
    ['wheel','touchstart','pointerdown','keydown'].forEach(function(ev){
      window.addEventListener(ev, function(){ if(endSettle) endSettle(); }, { passive:true, once:true });
    });
    iv = setInterval(function(){
      elapsed += 120;
      var top = Math.round(el.getBoundingClientRect().top);
      if(top === lastTop) stable++; else { stable = 0; lastTop = top; }
      if(stable >= 3 || elapsed >= 3000){ endSettle(); return; }
      jump(targetY(el));
    }, 120);
  }

  /* A link or address-bar navigation: end any on-load settling first, then go. */
  function go(id, smooth){
    if(!id) return false;
    var el;
    try { el = document.getElementById(id); } catch(e){ return false; }
    if(!el) return false;
    if(endSettle) endSettle();
    var y = targetY(el);
    if(smooth) glide(y); else jump(y);
    return true;
  }

  if(document.readyState === 'complete') settleToHash();
  else window.addEventListener('load', settleToHash);

  /* Same-document hash changes (the address bar, or arriving at #section from
     another route without a full reload) don't re-run the on-load handler. Our
     own link clicks preventDefault and use pushState, which does not fire this,
     so there is no double scroll. */
  window.addEventListener('hashchange', function(){
    var id = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if(id) go(id, true);
  });

  /* In-page #links (e.g. the section bar). Placeholder (href="#") and JS-driven
     buttons are left alone. */
  document.addEventListener('click', function(e){
    var t = e.target;
    if(t && t.nodeType === 3) t = t.parentElement;
    var a = t && t.closest ? t.closest('a[href^="#"]') : null;
    if(!a) return;
    var href = a.getAttribute('href');
    if(!href || href === '#') return;
    var id = decodeURIComponent(href.slice(1));
    if(go(id, true)){
      e.preventDefault();
      if(history.pushState) history.pushState(null, '', '#' + id);
    }
  });

  /* Coming back from a RedBook page - the browser's Back, or an article's BACK
     button, which steps back in history when the reader came from here. The
     browser does restore the scroll position, but only once and early: if the
     page isn't fully laid out by then it settles at the top. So the position is
     kept as the page is left and re-applied once the page has loaded, briefly
     re-checked while late images settle, and dropped the moment the reader
     scrolls. A page restored whole from the back/forward cache needs none of
     this - this script doesn't run again then. */
  var LEFT_AT = 'rbi:leftAt:' + location.pathname + location.search;
  window.addEventListener('pagehide', function(){
    try { sessionStorage.setItem(LEFT_AT, String(Math.round(window.pageYOffset))); } catch(e){}
  });
  function restoreOnBack(){
    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
    /* reload too: browsers keep the place on a reload as well, and a reload can
       stand in for the Back (the dev server forces one, for instance) */
    if((nav.type !== 'back_forward' && nav.type !== 'reload') || location.hash) return;
    var y;
    try { y = parseInt(sessionStorage.getItem(LEFT_AT), 10); } catch(e){ return; }
    if(!(y > 0)) return;
    jump(y);
    var n = 0, done = false;
    ['wheel','touchstart','pointerdown','keydown'].forEach(function(ev){
      window.addEventListener(ev, function(){ done = true; }, { passive:true, once:true });
    });
    var iv = setInterval(function(){
      if(done || ++n > 8){ clearInterval(iv); return; }
      if(Math.abs(window.pageYOffset - y) > 2) jump(y);
    }, 150);
  }
  if(document.readyState === 'complete') restoreOnBack();
  else window.addEventListener('load', restoreOnBack);
})();
