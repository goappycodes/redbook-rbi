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
    levelCardTitles();
  });

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
  levelCardTitles();
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ requestAnimationFrame(levelCardTitles); });
  }
  var ctT = null;
  window.addEventListener('resize', function(){
    clearTimeout(ctT); ctT = setTimeout(levelCardTitles, 140);
  });
})();
