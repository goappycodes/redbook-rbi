(function(){
  var sel=document.getElementById('repYear');
  if(!sel) return;
  var groups=[].slice.call(document.querySelectorAll('[data-repyear]'));
  sel.addEventListener('change',function(){
    groups.forEach(function(g){
      var on = g.getAttribute('data-repyear')===sel.value;
      g.hidden = !on;
      /* the reveal observer never saw these while hidden, so settle them visible */
      if(on){
        if(g.hasAttribute('data-reveal')) g.classList.add('is-in');
        [].slice.call(g.querySelectorAll('[data-reveal]')).forEach(function(el){
          el.classList.add('is-in');
        });
      }
    });
    fillReportRows();
    levelCardTitles();
  });

  /* A year whose first row is short of reports gets greyed "Coming soon" cards
     to complete that row. Only the first row is ever filled - four reports at
     three across leave the second row as it is - and only for editions from the
     current year on; earlier years show exactly what was published. Columns are read from the
     live grid, so the fill is right at three across and at two across. */
  /* "the current year onwards": an edition (e.g. 2026/27) qualifies while its
     first year is this year or later, so placeholders never show on past years */
  var SOON_FROM = new Date().getFullYear();
  /* Placeholders are added after the page's reveal observer (02-page.js) has
     started, so they get their own with the same settings - otherwise they'd
     show at once while the real cards are still fading in. Each takes the next
     stagger step after the real cards, so it arrives last, in sequence. */
  var soonIO = ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches)
    ? new IntersectionObserver(function(es){
        es.forEach(function(e){ e.target.classList.toggle('is-in', e.isIntersecting); });
      }, { rootMargin:'0px 0px -12% 0px', threshold:0.12 })
    : null;
  function soonCard(i){
    var w = document.createElement('div');
    w.className = 'is-soon';
    w.style.setProperty('--i', i);
    w.setAttribute('data-reveal', '');
    w.innerHTML = '<div class="cover cover--soon" aria-label="Report coming soon">'
      + '<span class="cover__plate" aria-hidden="true"></span>'
      + '<span class="cover__cap"><span class="cover__n cover__n--label">RBi Report</span>'
      + '<span class="cover__t">Coming soon</span><span class="cover__d">&nbsp;</span></span></div>';
    if(soonIO) soonIO.observe(w); else w.classList.add('is-in');
    return w;
  }
  function fillReportRows(){
    [].slice.call(document.querySelectorAll('#reports .grid.g-3[data-repyear]')).forEach(function(grid){
      [].slice.call(grid.querySelectorAll(':scope > .is-soon')).forEach(function(el){
        if(soonIO) soonIO.unobserve(el);
        el.remove();
      });
      if(grid.hidden) return;
      if(parseInt(grid.getAttribute('data-repyear'), 10) < SOON_FROM) return;
      var n = grid.children.length;
      if(!n) return;
      var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 3;
      for(var i = n; i < cols; i++) grid.appendChild(soonCard(i));
    });
  }

  /* Titles are editable, so one of them may run longer than the rest and leave
     the cards in a year at different heights. Rather than reserving space for a
     length nobody is using, every title in the year on show is raised to the
     tallest of them. The CSS floor of two lines is what applies when this does
     not run. */
  function levelCardTitles(){
    var grid = document.querySelector('#reports .grid.g-3:not([hidden])');
    if(!grid) return;
    var titles = [].slice.call(grid.querySelectorAll('.cover__t'));
    if(!titles.length) return;
    titles.forEach(function(t){ t.style.minHeight = ''; });
    var tallest = titles.reduce(function(h, t){ return Math.max(h, t.offsetHeight); }, 0);
    titles.forEach(function(t){ t.style.minHeight = tallest + 'px'; });
  }
  fillReportRows();
  levelCardTitles();
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ requestAnimationFrame(levelCardTitles); });
  }
  var ctT = null;
  window.addEventListener('resize', function(){
    clearTimeout(ctT); ctT = setTimeout(function(){ fillReportRows(); levelCardTitles(); }, 140);
  });
  /* the reports grid drops to two across on narrow screens (02-page.css); refill
     whenever the section's width actually changes, even if no resize event comes
     with it (rotation, zoom, emulated viewports). Width only - adding the
     placeholder cards changes the height, which must not retrigger this. */
  var repHost = document.getElementById('reports');
  if(repHost && 'ResizeObserver' in window){
    var lastW = 0;
    new ResizeObserver(function(es){
      var w = Math.round(es[0].contentRect.width);
      if(w === lastW) return;
      lastW = w;
      fillReportRows(); levelCardTitles();
    }).observe(repHost);
  }
})();
