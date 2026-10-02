(function(){
  'use strict';
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal on scroll ---------------------------------------- */
  var targets = document.querySelectorAll('[data-reveal], .h-display');
  if(REDUCE || !('IntersectionObserver' in window)){
    targets.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    /* reversible: elements settle in on the way down, run back out when they
       leave the viewport, and play again on re-entry - so scrolling up
       rewinds the page rather than leaving everything already arrived */
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        e.target.classList.toggle('is-in', e.isIntersecting);
      });
    }, { rootMargin:'0px 0px -12% 0px', threshold:0.12 });
    targets.forEach(function(el){ io.observe(el); });
  }

  /* ---------- the RedBook Index: region, series picker, chart, stats -----
     Eleven series, each with a London and a Country reading. Four may be
     plotted at once and the overall index is one of them permanently, so the
     picker really offers three slots. getTotalLength() reports user-space
     length, but preserveAspectRatio="none" plus non-scaling-stroke means the
     dash pattern is measured on screen; those disagree, so the length is
     computed from the rendered geometry instead. */
  /* The payload is written into the page by the server (#rbIndexData) from the
     published index_datasets row - see 02-index-data.md. Everything is driven
     from its `meta`: the regions, the number of readings, the axis, the locked
     series and the selection limit. */
  var DATA = (function(){
    var el = document.getElementById('rbIndexData');
    try { return el ? JSON.parse(el.textContent) : null; } catch(e){ return null; }
  })() || { meta:{ readings:['',''], axis:{foot:100,head:150}, regions:[{key:'a',label:''},{key:'b',label:''}], locked:'', max_selected:1 }, order:[], series:{} };
  var META = DATA.meta;
  var SERIES = DATA.series || {};
  var REGIONS = META.regions.map(function(r){ return r.key; });
  var READINGS = META.readings;

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function lastOf(a){ for(var i = a.length - 1; i >= 0; i--) if(a[i] != null) return i; return -1; }
  function pct(from, to){ return (from == null || to == null || !from) ? null : (to / from - 1) * 100; }
  /* v, y and b are restatements of `a`, so they are worked out rather than
     required; an editorial override in the payload wins. */
  Object.keys(SERIES).forEach(function(key){
    REGIONS.forEach(function(rk){
      var d = SERIES[key][rk];
      if(!d || !d.a) { SERIES[key][rk] = d = { a: READINGS.map(function(){ return null; }) }; }
      var a = d.a, n = a.length;
      if(typeof d.v !== 'number'){ var li = lastOf(a); d.v = li > -1 ? a[li] : null; }
      if(typeof d.y !== 'number') d.y = pct(a[n - 2], a[n - 1]);
      if(typeof d.b !== 'number') d.b = pct(a[0], a[n - 1]);
    });
  });

  /* Plain-English notes on what each index actually measures, from the payload. */
  function infoMark(key){
    var note = SERIES[key] && SERIES[key].note;
    if(!note) return '';
    return '<span class="info" tabindex="0" role="note" aria-label="What this index measures">i' +
           '<span class="info__t">' + esc(note) + '</span></span>';
  }
  var LOCKED = META.locked;
  var ORDER = (DATA.order || Object.keys(SERIES)).filter(function(k){ return SERIES[k]; });
  var MAX = META.max_selected;
  var MAIN_COLOUR = '#6F2123';
  /* RB Secondary 1, RB Index 3, RB Index 4 - the three swatches that stay
     furthest apart from each other and from the overall index's red */
  var SLOTS = ['#7F7D62','#CB5255','#DE9194'];   /* colour by slot, not by series */

  var region = REGIONS[0];
  var picked = SERIES[LOCKED] ? [LOCKED] : [];

  /* a fixed frame, set in the payload: the scale never shifts under the reader
     and lines can be compared between selections */
  var AXIS_FOOT = META.axis.foot, AXIS_HEAD = META.axis.head;
  function coordsFor(key){
    var a = SERIES[key][region].a, k = 300 / (AXIS_HEAD - AXIS_FOOT);
    var step = 600 / Math.max(1, a.length - 1);  /* one reading per year mark */
    return a.map(function(v, i){
      return v == null ? null : [i * step, 300 - (v - AXIS_FOOT) * k];
    });
  }
  /* straight between readings, so every year-on-year move is a plain line
     with a visible change of direction at each year mark; a missing reading
     breaks the line rather than inventing a value */
  function pathFor(key){
    var out = [], pen = false;
    coordsFor(key).forEach(function(q){
      if(!q){ pen = false; return; }
      out.push((pen ? 'L' : 'M') + q[0].toFixed(2) + ',' + q[1].toFixed(2));
      pen = true;
    });
    return out.join(' ') || 'M0,300';
  }
  var chart    = document.querySelector('.chart');
  var lineHost = document.getElementById('clines');
  var legend   = document.getElementById('chartLegend');
  var statHost = document.getElementById('statRows');
  var cxRows   = document.getElementById('cxRows');
  var cxNote   = document.getElementById('cxNote');

  function ordered(){ return ORDER.filter(function(k){ return picked.indexOf(k) > -1; }); }
  /* a colour is held for as long as a series is on show, so the lines that
     stay put keep theirs when others come and go */
  var held = {};
  function assignColours(){
    Object.keys(held).forEach(function(k){
      if(picked.indexOf(k) < 0) delete held[k];
    });
    ordered().forEach(function(key){
      if(key === LOCKED || held[key]) return;
      for(var i = 0; i < SLOTS.length; i++){
        var c = SLOTS[i], taken = false;
        for(var k in held){ if(held[k] === c){ taken = true; break; } }
        if(!taken){ held[key] = c; return; }
      }
    });
  }
  function colourOf(key){
    return key === LOCKED ? MAIN_COLOUR : (held[key] || SLOTS[SLOTS.length - 1]);
  }

  /* getTotalLength() reports user-space length, but preserveAspectRatio="none"
     plus non-scaling-stroke means the dash pattern is measured on screen. The
     two disagree, so the curve is sampled and measured in screen units. */
  function renderedLength(el){
    var svg = el.ownerSVGElement; if(!svg) return 0;
    var vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
    if(!vb.width || !vb.height || !r.width) return 0;
    var sx = r.width / vb.width, sy = r.height / vb.height;
    var L = el.getTotalLength(), N = 140, total = 0, prev = null;
    for(var i = 0; i <= N; i++){
      var q = el.getPointAtLength(L * i / N);
      var x = q.x * sx, y = q.y * sy;
      if(prev) total += Math.sqrt(Math.pow(x - prev[0], 2) + Math.pow(y - prev[1], 2));
      prev = [x, y];
    }
    return total;
  }
  function drawLine(pl, animate){
    var len = renderedLength(pl); if(!len) return;
    pl.style.transition = 'none';
    pl.style.strokeDasharray = len + 1;
    pl.style.strokeDashoffset = animate ? len + 1 : 0;
    void pl.getBoundingClientRect();
    if(animate && !REDUCE){
      pl.style.transition = 'stroke-dashoffset 2.1s cubic-bezier(.16,1,.3,1)';
      pl.style.strokeDashoffset = 0;
    } else { pl.style.transition = ''; }
  }

  /* Only what changed is touched: a line already on the chart is left exactly
     as it is, a newly chosen one draws itself in, and a dropped one fades out.
     `rebuild` forces the lot, which is what a change of region needs. */
  var lineEls = {}, hitEls = {};
  function makeLine(key){
    var pl = document.createElementNS('http://www.w3.org/2000/svg','path');
    pl.setAttribute('class','cline');
    pl.setAttribute('data-series', key);
    pl.setAttribute('data-on','1');
    pl.setAttribute('d', pathFor(key));
    pl.setAttribute('fill','none');
    pl.setAttribute('stroke', colourOf(key));
    /* the headline reads a touch heavier than the rest, not twice as heavy */
    pl.setAttribute('stroke-width', key === LOCKED ? '2.2' : '1.7');
    pl.setAttribute('vector-effect','non-scaling-stroke');
    return pl;
  }
  function makeHit(key){
    var pl = document.createElementNS('http://www.w3.org/2000/svg','path');
    pl.setAttribute('class','cline-hit');
    pl.setAttribute('data-series', key);
    pl.setAttribute('d', pathFor(key));
    pl.setAttribute('vector-effect','non-scaling-stroke');
    return pl;
  }
  function dropLine(key){
    var el = lineEls[key], hit = hitEls[key];
    delete lineEls[key]; delete hitEls[key];
    if(hit && hit.parentNode) hit.parentNode.removeChild(hit);
    if(!el) return;
    if(REDUCE){ if(el.parentNode) el.parentNode.removeChild(el); return; }
    el.style.transition = 'opacity .32s ease';
    el.style.opacity = '0';
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 340);
  }
  function paintChart(rebuild, animate){
    if(!lineHost) return;
    assignColours();
    var want = ordered();
    if(rebuild){
      Object.keys(lineEls).forEach(function(k){ delete lineEls[k]; });
      Object.keys(hitEls).forEach(function(k){ delete hitEls[k]; });
      lineHost.textContent = '';
    } else {
      Object.keys(lineEls).forEach(function(k){
        if(want.indexOf(k) < 0) dropLine(k);
      });
    }
    want.forEach(function(key){
      if(lineEls[key]) return;                 /* already drawn - leave it be */
      var pl = makeLine(key);
      lineHost.appendChild(pl);
      lineEls[key] = pl;
      drawLine(pl, animate);
      var hit = makeHit(key);
      lineHost.appendChild(hit);
      hitEls[key] = hit;
    });
    if(legend){
      legend.innerHTML = want.map(function(key){
        return '<span><i style="background:' + colourOf(key) + '"></i>' + esc(SERIES[key].label) + '</span>';
      }).join('');
    }
  }

  function sign(n){ return n == null ? '—' : (n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }
  function num(n){ return n == null ? '—' : n.toFixed(1); }
  function paintStats(){
    if(!statHost) return;
    /* the sub-indices read downwards to the overall index, which holds the foot */
    var rows = ordered().filter(function(k){ return k !== LOCKED; }).concat([LOCKED]);
    statHost.innerHTML = rows.map(function(key){
      var d = SERIES[key][region], main = key === LOCKED;
      return '<div class="stat' + (main ? ' stat--main' : '') + '" data-series="' + key + '">' +
        '<p class="stat__num' + (main ? '' : ' stat__num--sub') + '">' + num(d.v) + '</p>' +
        '<span class="stat__d">' + sign(d.y) + '</span>' +
        '<span class="stat__d">' + sign(d.b) + '</span>' +
        '<p class="stat__l">' + esc(SERIES[key].label) + infoMark(key) + '</p></div>';
    }).join('');
  }

  /* the rows are built once; a change only re-flags them, so the control the
     user just clicked is never torn out from under them and focus survives */
  function buildPicker(){
    if(!cxRows) return;
    cxRows.innerHTML = ORDER.filter(function(k){ return k !== LOCKED; }).map(function(key){
      return '<label class="cx__row">' +
        /* autocomplete off, or the browser restores the previous session's
           ticks on reload and quietly overrides the default view */
        '<input type="checkbox" autocomplete="off" data-series="' + key + '">' +
        '<span class="cx__name">' + esc(SERIES[key].label) + '</span>' + infoMark(key) +
      '</label>';
    }).join('');
  }
  function syncPicker(){
    if(!cxRows) return;
    var full = picked.length >= MAX;
    [].slice.call(cxRows.querySelectorAll('input[data-series]')).forEach(function(box){
      var on = picked.indexOf(box.dataset.series) > -1;
      box.checked = on;
      box.disabled = !on && full;
      box.parentNode.classList.toggle('is-spent', !on && full);
    });
    if(cxNote){
      /* both notes are CMS copy, carried on the element */
      cxNote.textContent = full
        ? (cxNote.getAttribute('data-full') || 'Three selected. Turn one off to choose another.')
        : (cxNote.getAttribute('data-note') || 'Select up to ' + (MAX - picked.length) + ' more');
      cxNote.classList.toggle('is-full', full);
    }
    var clear = document.getElementById('cxClear');
    if(clear) clear.disabled = picked.length <= 1;
  }

  function repaint(rebuild, animate){ clearFocus(); paintChart(rebuild, animate); paintStats(); syncPicker(); }

  buildPicker();
  if(chart){
    repaint(true, false);
    if(!(REDUCE || !('IntersectionObserver' in window))){
      new IntersectionObserver(function(es, obs){
        if(!es[0].isIntersecting) return;
        obs.disconnect();
        paintChart(true, true);
      }, { threshold:0.3 }).observe(chart);
    }
    window.addEventListener('resize', function(){
      clearTimeout(window.__chT);
      window.__chT = setTimeout(function(){
        Object.keys(lineEls).forEach(function(k){ drawLine(lineEls[k], false); });
      }, 160);
    });
  }

  /* the name of a line, on hovering it. The visible stroke is too thin to aim
     at, so each line carries an invisible fat one that takes the pointer. */
  var chartTip = document.getElementById('chartTip');
  if(lineHost && chartTip && chart){
    lineHost.addEventListener('mouseover', function(e){
      var hit = e.target.closest ? e.target.closest('.cline-hit') : null;
      if(!hit) return;
      var key = hit.getAttribute('data-series');
      if(!SERIES[key]) return;
      chartTip.textContent = SERIES[key].label;
      chartTip.classList.add('is-on');
    });
    lineHost.addEventListener('mousemove', function(e){
      if(!chartTip.classList.contains('is-on')) return;
      var r = chart.getBoundingClientRect();
      var w = chartTip.offsetWidth / 2 + 4;
      chartTip.style.left = Math.min(Math.max(e.clientX - r.left, w), r.width - w) + 'px';
      chartTip.style.top  = (e.clientY - r.top) + 'px';
    });
    lineHost.addEventListener('mouseout', function(e){
      var hit = e.target.closest ? e.target.closest('.cline-hit') : null;
      if(hit) chartTip.classList.remove('is-on');
    });
  }

  /* ---------- pointing at the table lights up the chart -----------------
     A row brings its whole line forward. The "From '25" column is the year
     just gone, so that one lights only the stretch between the last two
     points on the axis. */
  var SVGNS = 'http://www.w3.org/2000/svg';
  /* where the penultimate reading sits on the x axis */
  var YEAR_X = 600 * (READINGS.length - 2) / Math.max(1, READINGS.length - 1);
  var segEl = null;

  /* the dash pattern is measured on screen because of non-scaling-stroke, so
     the split has to be measured there too */
  function screenSplit(el, xAt){
    var svg = el.ownerSVGElement; if(!svg) return null;
    var vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
    if(!vb.width || !r.width) return null;
    var sx = r.width / vb.width, sy = r.height / vb.height;
    var L = el.getTotalLength(), N = 300, prev = null, total = 0, before = 0, past = false;
    for(var i = 0; i <= N; i++){
      var p = el.getPointAtLength(L * i / N);
      var x = p.x * sx, y = p.y * sy;
      if(prev) total += Math.sqrt(Math.pow(x - prev[0], 2) + Math.pow(y - prev[1], 2));
      if(!past && p.x >= xAt){ before = total; past = true; }
      prev = [x, y];
    }
    return { before: before, total: total };
  }

  function clearFocus(){
    if(!chart) return;
    chart.classList.remove('is-focus');
    Object.keys(lineEls).forEach(function(k){ lineEls[k].classList.remove('is-hot'); });
    if(segEl && segEl.parentNode) segEl.parentNode.removeChild(segEl);
    segEl = null;
  }
  function focusSeries(key, lastYearOnly){
    if(!chart || !lineEls[key]) return;
    clearFocus();
    chart.classList.add('is-focus');
    if(!lastYearOnly){ lineEls[key].classList.add('is-hot'); return; }
    var base = lineEls[key], cut = screenSplit(base, YEAR_X);
    if(!cut){ lineEls[key].classList.add('is-hot'); return; }
    segEl = document.createElementNS(SVGNS, 'path');
    segEl.setAttribute('class', 'cline-seg');
    segEl.setAttribute('d', base.getAttribute('d'));
    segEl.setAttribute('stroke', colourOf(key));
    segEl.setAttribute('vector-effect', 'non-scaling-stroke');
    /* nothing, then a gap to the split, then the stretch, then nothing again */
    segEl.setAttribute('stroke-dasharray',
      '0 ' + cut.before.toFixed(1) + ' ' + (cut.total - cut.before).toFixed(1) + ' ' + cut.total.toFixed(1));
    lineHost.appendChild(segEl);
  }
  if(statHost && chart){
    /* Which column the pointer is in decides what lights up, so the whole
       height of the From '25 column counts, not just the figure sitting in it. */
    var lastKey = null, lastYear = null;
    function aim(e){
      var rowEl = e.target.closest ? e.target.closest('.stat') : null;
      if(!rowEl){ return; }
      var cell = rowEl.querySelector('.stat__d');
      var key = rowEl.getAttribute('data-series'), yearOnly = false;
      if(cell){
        var r = cell.getBoundingClientRect();          /* plus half the column gap */
        yearOnly = e.clientX >= r.left - 5 && e.clientX <= r.right + 5;
      }
      if(key === lastKey && yearOnly === lastYear) return;   /* nothing new to draw */
      lastKey = key; lastYear = yearOnly;
      focusSeries(key, yearOnly);
    }
    statHost.addEventListener('mouseover', aim);
    statHost.addEventListener('mousemove', aim);
    statHost.addEventListener('mouseout', function(e){
      if(!e.relatedTarget || !statHost.contains(e.relatedTarget)){
        lastKey = null; lastYear = null;
        clearFocus();
      }
    });
  }

  /* region toggle */
  var seg = document.getElementById('regionSeg');
  if(seg){
    seg.addEventListener('click', function(e){
      var b = e.target.closest('button[data-region]');
      if(!b || b.dataset.region === region) return;
      region = b.dataset.region;
      [].slice.call(seg.children).forEach(function(x){
        var on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      repaint(true, true);
    });
  }

  /* customise-your-view menu */
  var cx = document.getElementById('cx');
  /* Reference-counted, because the picker and the dialog can both want it and
     whichever closes first must not hand scrolling back to the other one. */
  window.rbScrollLock = (function(){
    var depth = 0;
    function block(e){
      var t = e.target;
      if(t && t.closest && t.closest('.cx__panel, .dlg__panel')) return;
      e.preventDefault();          /* iOS keeps scrolling without this */
    }
    return {
      on: function(){
        if(depth++) return;
        document.documentElement.classList.add('is-locked');
        document.addEventListener('touchmove', block, { passive:false });
      },
      off: function(){
        if(depth > 0) depth--;
        if(depth) return;
        document.documentElement.classList.remove('is-locked');
        document.removeEventListener('touchmove', block, { passive:false });
      }
    };
  })();

  /* Anything that floats has to start below the bars pinned to the top of the
     screen, since it is painted underneath them. Each slides away when it is not
     wanted, which puts its bottom edge above zero, so it stops counting. */
  window.rbTopGuard = (function(){
    var bars = ['siteHeader', 'secNav'];
    return function(){
      var g = 12;
      for(var i = 0; i < bars.length; i++){
        var el = document.getElementById(bars[i]);
        if(!el) continue;
        var cs = getComputedStyle(el);
        if(cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
        var r = el.getBoundingClientRect();
        if(r.height && r.bottom > 0) g = Math.max(g, r.bottom + 8);
      }
      return g;
    };
  })();

  var cxBtn = document.getElementById('cxBtn');
  var cxPanel = document.getElementById('cxPanel');
  if(cx && cxBtn && cxPanel){
    /* The panel is fixed, so it has to be placed against the button rather than
       flowing under it. Where the whole of it will not fit beneath, it rides up
       over the button instead of running off the bottom of the screen - which is
       what the close control is there for. Below 620 the stylesheet makes it a
       sheet and the inline positions are left off. */
    var SHEET = window.matchMedia('(max-width:620px)');
    /* the parchment card, not the chart tile: the picker runs the full height of
       the section, from above the Customise button to below the actions */
    var idxCard = document.getElementById('index');
    var panelLocked = false;
    function openPanel(){
      cxPanel.removeAttribute('hidden');
      cxBtn.setAttribute('aria-expanded','true');
      placePanel();
      /* on a phone the sheet owns the screen, so the page behind it holds still */
      if(SHEET.matches){ window.rbScrollLock.on(); panelLocked = true; }
    }
    function closePanel(){
      cxPanel.setAttribute('hidden','');
      cxBtn.setAttribute('aria-expanded','false');
      if(panelLocked){ window.rbScrollLock.off(); panelLocked = false; }
    }
    function placePanel(){
      if(cxPanel.hasAttribute('hidden')) return;
      if(SHEET.matches){
        cxPanel.style.left = ''; cxPanel.style.top = ''; cxPanel.style.maxHeight = '';
        return;
      }
      var b = cxBtn.getBoundingClientRect();
      var vw = document.documentElement.clientWidth;
      var vh = document.documentElement.clientHeight;
      var c  = idxCard ? idxCard.getBoundingClientRect() : null;
      var g  = window.rbTopGuard ? window.rbTopGuard() : 12;
      /* never taller than the room under the bars, nor than the card it belongs to */
      var room = vh - g - 12;
      cxPanel.style.maxHeight =
        Math.round(Math.max(160, c ? Math.min(room, c.height) : room)) + 'px';
      var pw = cxPanel.offsetWidth, ph = cxPanel.offsetHeight;   /* after the cap */
      var left = Math.min(Math.max(12, b.right - pw), vw - pw - 12);
      var top  = b.bottom + 8;
      if(top + ph > vh - 12) top = vh - ph - 12;   /* show all of it where we can */
      if(top < g) top = g;                         /* and clear of the bars */
      /* It is locked to the parchment card: it reaches the card's top and its
         bottom and no further, so it never carries over onto another section,
         and it does not close itself. Clamping against the card's whole rect
         rather than its visible part is what keeps that movement smooth as the
         card scrolls away. */
      if(c) top = Math.min(Math.max(top, c.top), c.bottom - ph);
      cxPanel.style.left = Math.round(left) + 'px';
      cxPanel.style.top  = Math.round(top) + 'px';
    }
    cxBtn.addEventListener('click', function(e){
      e.stopPropagation();
      if(cxPanel.hasAttribute('hidden')) openPanel(); else closePanel();
    });
    window.addEventListener('scroll', placePanel, true);
    var cxRT = null;
    window.addEventListener('resize', function(){ clearTimeout(cxRT); cxRT = setTimeout(placePanel, 80); });
    if(SHEET.addEventListener) SHEET.addEventListener('change', placePanel);
    else if(SHEET.addListener) SHEET.addListener(placePanel);
    document.addEventListener('click', function(e){
      if(!cx.contains(e.target) && !cxPanel.contains(e.target)) closePanel();
    });
    var cxClose = document.getElementById('cxClose');
    if(cxClose) cxClose.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      closePanel();
      cxBtn.focus();
    });
    /* the note sits inside the label, so a click on it would flip the box */
    cxPanel.addEventListener('click', function(e){
      if(e.target.closest('.info')){ e.preventDefault(); e.stopPropagation(); }
    });
    var cxClear = document.getElementById('cxClear');
    if(cxClear) cxClear.addEventListener('click', function(e){
      e.stopPropagation();
      if(picked.length <= 1) return;
      picked = SERIES[LOCKED] ? [LOCKED] : [];   /* the overall index cannot be cleared */
      repaint(false, true);
    });
    cxPanel.addEventListener('change', function(e){
      var box = e.target.closest('input[data-series]');
      if(!box) return;
      var key = box.dataset.series;
      if(key === LOCKED){ box.checked = true; return; }
      if(box.checked){
        if(picked.length >= MAX){ box.checked = false; return; }
        picked.push(key);
      } else {
        picked = picked.filter(function(k){ return k !== key; });
      }
      repaint(false, true);
    });
  }

  /* ---------- export: the chart as drawn, and the table as CSV -----------
     Both open, neither gated (09-decisions.md). One click saves both files. */
  function regionLabel(){
    for(var i = 0; i < META.regions.length; i++) if(META.regions[i].key === region) return META.regions[i].label;
    return region;
  }
  function slug(){ return 'redbook-index-' + String(META.year || '').replace(/\//g, '-') + '-' + region; }
  function save(blob, name){
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
  function exportCsv(){
    var head = document.querySelector('.stat-head');
    var cols = head ? [].slice.call(head.children).slice(1).map(function(s){ return s.textContent.trim(); }) : ['Last year', 'From base'];
    var q = function(v){ v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var rows = [['Index', 'Region'].concat(READINGS, cols)];
    ordered().forEach(function(key){
      var d = SERIES[key][region];
      rows.push([SERIES[key].label, regionLabel()]
        .concat(d.a.map(function(v){ return v == null ? '' : v; }))
        .concat([d.y == null ? '' : d.y.toFixed(1) + '%', d.b == null ? '' : d.b.toFixed(1) + '%']));
    });
    save(new Blob(['﻿' + rows.map(function(r){ return r.map(q).join(','); }).join('\r\n')], { type:'text/csv;charset=utf-8' }), slug() + '.csv');
  }
  /* The chart SVG as a bitmap, plus title, axis labels and a colour legend -
     the shared top of both the PNG (unused now) and the PDF. P/TOP/FOOT frame
     it; returns the y just below the legend so a caller can carry on. */
  var EXP = { P: 48, TOP: 84, FOOT: 40, S: 2 };
  function legendBottom(H){ return EXP.TOP + H + EXP.FOOT + 12 + ordered().length * 26; }
  function drawExportChart(g, img, W, H){
    var P = EXP.P, TOP = EXP.TOP, FOOT = EXP.FOOT;
    g.fillStyle = '#2B0815'; g.font = '500 20px Barlow, sans-serif'; g.textAlign = 'left';
    g.fillText('The RedBook Index — ' + regionLabel(), P, 38);
    g.fillStyle = '#8B857F'; g.font = '400 13px Barlow, sans-serif';
    g.fillText(READINGS[0] + ' – ' + READINGS[READINGS.length - 1] + ', base 100', P, 60);
    g.strokeStyle = '#E2DDD8'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(P, TOP + 0.5); g.lineTo(P + W, TOP + 0.5); g.moveTo(P, TOP + H - 0.5); g.lineTo(P + W, TOP + H - 0.5); g.stroke();
    g.drawImage(img, P, TOP, W, H);
    g.fillStyle = '#8B857F'; g.font = '400 11px Barlow, sans-serif'; g.textAlign = 'right';
    g.fillText(String(AXIS_HEAD), P - 8, TOP + 4); g.fillText(String(AXIS_FOOT), P - 8, TOP + H);
    READINGS.forEach(function(lbl, i){
      g.textAlign = i === 0 ? 'left' : (i === READINGS.length - 1 ? 'right' : 'center');
      g.fillText(lbl, P + W * i / Math.max(1, READINGS.length - 1), TOP + H + 22);
    });
    g.textAlign = 'left'; g.font = '400 13px Barlow, sans-serif';
    ordered().forEach(function(key, i){
      var y = TOP + H + FOOT + 12 + i * 26;
      g.fillStyle = colourOf(key); g.fillRect(P, y - 2, 18, key === LOCKED ? 3 : 2);
      g.fillStyle = '#212529'; g.fillText(SERIES[key].label, P + 28, y + 3);
    });
  }

  /* The data table (the same figures as the CSV) drawn beneath the chart, so the
     PDF carries both the picture and the numbers. Returns the y below the table. */
  var TBL = { seriesW: 210, colW: 64, rowH: 24 }; /* table metrics; width derives from these */
  function tableWidth(){ return TBL.seriesW + (READINGS.length + 2) * TBL.colW; }
  function paintTable(g, y0, left){
    var seriesW = TBL.seriesW, colW = TBL.colW, rowH = TBL.rowH, TW = tableWidth();
    var cols = READINGS.concat(['Last yr', 'From base']);
    var colR = function(j){ return left + seriesW + (j + 1) * colW - 10; }; /* right edge of a numeric cell */
    g.fillStyle = '#2B0815'; g.font = '500 15px Barlow, sans-serif'; g.textAlign = 'left';
    g.fillText('Index data — ' + regionLabel(), left, y0);
    var hy = y0 + 24;
    g.font = '600 12px Barlow, sans-serif'; g.fillStyle = '#6B655F';
    g.textAlign = 'left'; g.fillText('Series', left, hy);
    g.textAlign = 'right';
    cols.forEach(function(c, j){ g.fillText(c, colR(j), hy); });
    g.strokeStyle = '#E2DDD8'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(left, hy + 8.5); g.lineTo(left + TW, hy + 8.5); g.stroke();
    g.font = '400 12px Barlow, sans-serif';
    ordered().forEach(function(key, ri){
      var y = hy + 24 + ri * rowH, d = SERIES[key][region];
      g.textAlign = 'left';
      g.fillStyle = colourOf(key); g.fillRect(left, y - 9, 11, key === LOCKED ? 4 : 3);
      g.fillStyle = '#212529'; g.fillText(SERIES[key].label, left + 18, y);
      g.textAlign = 'right';
      var vals = d.a.map(function(v){ return v == null ? '—' : String(v); })
        .concat([d.y == null ? '—' : d.y.toFixed(1) + '%', d.b == null ? '—' : d.b.toFixed(1) + '%']);
      vals.forEach(function(v, j){ g.fillText(v, colR(j), y); });
    });
    return hy + 24 + ordered().length * rowH + 12;
  }

  function exportPdf(){
    var svg = chart && chart.querySelector('svg');
    if(!svg) return;
    var r = svg.getBoundingClientRect(), W = Math.round(r.width) || 600, H = Math.round(r.height) || 300;
    var clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', W); clone.setAttribute('height', H);
    [].slice.call(clone.querySelectorAll('.cline-hit, .cline-seg')).forEach(function(n){ n.remove(); });
    [].slice.call(clone.querySelectorAll('.cline')).forEach(function(n){
      n.removeAttribute('style'); n.setAttribute('stroke-linecap', 'butt'); n.setAttribute('stroke-linejoin', 'miter');
    });
    var img = new Image(), S = EXP.S, P = EXP.P;
    img.onload = function(){
      /* the table may be wider than the chart; the page is sized to whichever is wider */
      var contentW = Math.max(W, tableWidth());
      var tableTop = legendBottom(H) + 24;
      var fullH = tableTop + 48 + ordered().length * TBL.rowH + 12;
      var cv = document.createElement('canvas');
      cv.width = (contentW + P * 2) * S; cv.height = fullH * S;
      var g = cv.getContext('2d'); g.scale(S, S);
      g.fillStyle = '#F5F3F0'; g.fillRect(0, 0, contentW + P * 2, fullH);
      drawExportChart(g, img, W, H);
      paintTable(g, tableTop, P);
      buildPdf(cv.toDataURL('image/jpeg', 0.92), cv.width, cv.height);
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  }

  /* A minimal single-page PDF holding one JPEG, scaled to fit a Letter page -
     no library, so nothing is vendored in. The JPEG embeds directly (DCTDecode).
     Binary is written via char codes, so the file is assembled as a Uint8Array
     rather than a string (a UTF-8 Blob would corrupt bytes above 127). */
  function buildPdf(jpegDataUrl, iw, ih){
    var jpg = atob(jpegDataUrl.split(',')[1]);
    var PW = 612, PH = 792, M = 36, aw = PW - 2 * M, ah = PH - 2 * M;
    var sc = Math.min(aw / iw, ah / ih), dw = iw * sc, dh = ih * sc;
    var x = M + (aw - dw) / 2, y = PH - M - dh;
    var content = 'q ' + dw.toFixed(2) + ' 0 0 ' + dh.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /Im0 Do Q';
    var objs = [
      null,
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
      { dict: '<< /Type /XObject /Subtype /Image /Width ' + iw + ' /Height ' + ih + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>', stream: jpg },
      { dict: '<< /Length ' + content.length + ' >>', stream: content },
    ];
    var out = '%PDF-1.4\n', off = [];
    for(var i = 1; i < objs.length; i++){
      off[i] = out.length;
      out += i + ' 0 obj\n' + (typeof objs[i] === 'string'
        ? objs[i]
        : objs[i].dict + '\nstream\n' + objs[i].stream + '\nendstream') + '\nendobj\n';
    }
    var xref = out.length;
    out += 'xref\n0 ' + objs.length + '\n0000000000 65535 f \n';
    for(var j = 1; j < objs.length; j++) out += ('0000000000' + off[j]).slice(-10) + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + objs.length + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
    var bytes = new Uint8Array(out.length);
    for(var k = 0; k < out.length; k++) bytes[k] = out.charCodeAt(k) & 0xff;
    save(new Blob([bytes], { type: 'application/pdf' }), slug() + '.pdf');
  }

  var exportBtn = document.getElementById('exportGraph');
  if(exportBtn) exportBtn.addEventListener('click', function(e){
    e.preventDefault();
    exportPdf();
    setTimeout(exportCsv, 400);
  });

  /* ---------- the index tile settles itself -----------------------------
     The tile is tall and its actions sit at the foot, so stopping halfway
     down it hides half the detail. When scrolling stops with the tile only
     partly shown, it is eased the rest of the way. The easing is done by hand
     rather than with behavior:'smooth' - it starts from rest on a sine curve
     so it reads as a continuation of the scroll rather than a jump, and any
     touch of the wheel, a key or the screen drops it immediately. It arms once
     per approach, so it cannot trap someone who is scrolling past. */
  (function(){
    var tile = document.getElementById('indexTile');
    if(!tile || REDUCE) return;
    var armed = true, wait, raf = null, gliding = false, gen = 0;

    /* every glide carries a token; bumping it retires any loop still running,
       otherwise two of them fight over the scroll position and it stutters */
    function stop(){
      gen++;
      if(raf){ cancelAnimationFrame(raf); raf = null; }
      gliding = false;
    }
    /* Eases toward a target recomputed every frame, so a reveal finishing or
       any other layout shift is absorbed rather than mistaken for the reader
       grabbing the page. The step is a fixed fraction of what is left, ramped
       in over the first fifth of a second: that gives a soft start and a long
       tail without a fixed duration to fight against. */
    function glide(){
      stop();
      var mine = gen, t0 = null, expect = null;
      gliding = true;
      raf = requestAnimationFrame(function step(ts){
        if(mine !== gen) return;
        if(t0 === null) t0 = ts;
        var y = window.pageYOffset;
        /* only a decisive move is the reader; small drift is the page settling */
        if(expect !== null && Math.abs(y - expect) > 60){ stop(); return; }
        var left = target() - y;
        if(Math.abs(left) < 1 || ts - t0 > 1600){ raf = null; gliding = false; return; }
        var k = 0.11 * Math.min(1, (ts - t0) / 200);
        expect = Math.round(y + left * k);
        window.scrollTo({ top: expect, behavior: 'instant' });
        raf = requestAnimationFrame(step);
      });
    }
    ['wheel','touchstart','pointerdown','keydown'].forEach(function(ev){
      window.addEventListener(ev, stop, { passive:true });
    });

    function target(){
      var top = navBottom(), vh = window.innerHeight;
      var r = tile.getBoundingClientRect(), room = vh - top;
      return Math.max(0, (r.height <= room - 24)
        ? r.top + window.pageYOffset - top - (room - r.height) / 2
        : r.top + window.pageYOffset - top - 12);
    }
    /* Nothing happens while the reports list above is still in play. The gate
       is the rule under its last row (Contributor Report); once that has gone
       off the top, the reader has finished with it and the tile can settle.
       If another year is on show that list is hidden, so the section's own
       foot stands in for it. */
    function gatePassed(){
      var row = document.querySelector('#reports .row-list:not([hidden]) .row-item:last-child');
      var el  = row || document.getElementById('reports');
      if(!el) return true;
      return el.getBoundingClientRect().bottom <= navBottom() + 1;
    }
    function navBottom(){
      var n = document.getElementById('secNav');
      if(!n) return 0;
      var r = n.getBoundingClientRect();
      return r.top <= 4 ? r.bottom : 0;
    }
    function settle(){
      if(window.innerWidth <= 980 || gliding) return;
      if(cxPanel && !cxPanel.hasAttribute('hidden')) return;    /* menu is open */
      var top = navBottom(), vh = window.innerHeight, r = tile.getBoundingClientRect();
      var shown = Math.min(r.bottom, vh) - Math.max(r.top, top);
      if(shown <= 0){ armed = true; return; }                   /* nowhere near it */
      if(!gatePassed()){ armed = true; return; }                /* still reading above */
      if(!armed) return;
      /* if the reader has already scrolled into the card, leave them alone -
         pulling it back down would be fighting them */
      if(r.top < top - 8){ armed = false; return; }
      if(Math.abs(target() - window.pageYOffset) < 8){ armed = false; return; }
      armed = false;
      glide();
    }
    window.addEventListener('scroll', function(){
      if(gliding) return;                 /* our own motion is not a new intent */
      clearTimeout(wait); wait = setTimeout(settle, 90);
    }, { passive:true });
  })();

  /* ---------- counters ------------------------------------------------ */
  document.querySelectorAll('[data-count]').forEach(function(el){
    var to  = parseFloat(el.getAttribute('data-count'));
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var fmt = function(v){ return pre + v.toLocaleString('en-GB') + suf; };
    if(REDUCE || !('IntersectionObserver' in window)){ el.textContent = fmt(to); return; }
    /* counts up once on first arrival, then holds - unlike the reveals,
       these are values rather than motion, and re-counting reads as a glitch */
    new IntersectionObserver(function(es, obs){
      if(!es[0].isIntersecting) return;
      obs.disconnect();
      var t0 = null, dur = 1400;
      (function run(t){
        if(t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(to * eased));
        if(p < 1) requestAnimationFrame(run);
      })(performance.now());
    }, { threshold:0.5 }).observe(el);
  });

  /* ---------- header: hide on scroll down, invert over dark ----------- */
  var header = document.getElementById('siteHeader');
  var bar = document.getElementById('scrollBar');
  var darkZones = [].slice.call(document.querySelectorAll('.hero, .section--dark, .wf-footer'));
  var hero = document.getElementById('hero');
  var heroInner = hero && hero.querySelector('.hero__inner');
  var secNav = document.getElementById('secNav');
  var secLinks = secNav ? [].slice.call(secNav.querySelectorAll('a')) : [];
  var secTargets = secLinks.map(function(a){ return document.getElementById(a.dataset.sec); });
  var lastY = window.pageYOffset, ticking = false;

  function frame(){
    ticking = false;
    var y = window.pageYOffset;
    var vh = window.innerHeight;

    /* progress */
    if(bar){
      var max = document.documentElement.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }

    /* the main header belongs to the top of the page only - it leaves as
       soon as you move down and does not come back on the way up until
       you are back at the very top */
    if(header){
      header.classList.toggle('is-up', y > 24);
      var probe = y + 42;
      var overDark = darkZones.some(function(z){
        var top = z.offsetTop, bot = top + z.offsetHeight;
        return probe >= top && probe < bot;
      });
      header.classList.toggle('is-over-dark', overDark);
    }

    /* section bar: rides in once the hero is behind, and tucks up under
       the main header - or to the top edge when that header is hidden */
    if(secNav){
      var heroH = hero ? hero.offsetHeight : vh;
      var on = y > heroH - 140;
      secNav.classList.toggle('is-on', on);
      var hdrH = header ? header.offsetHeight : 0;
      secNav.style.top = (on && header && !header.classList.contains('is-up')) ? hdrH + 'px' : '0px';

      if(on){
        var probe = y + 170;
        var here = -1;
        for(var n = 0; n < secTargets.length; n++){
          var t = secTargets[n];
          if(t && probe >= t.offsetTop) here = n;
        }
        for(var m = 0; m < secLinks.length; m++){
          secLinks[m].classList.toggle('is-here', m === here);
        }
      }
    }
    lastY = y;

    /* hero: video drifts slower than the page, content settles back */
    if(hero && !REDUCE && y < vh * 1.2){
      var p = Math.min(y / vh, 1);
      if(heroInner){
        heroInner.style.transform = 'translate3d(0,' + (y * 0.10) + 'px,0)';
        heroInner.style.opacity = String(1 - p * 1.05);
      }
    }
  }
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
  frame();

  /* ---------- report filter chips (visual only) ----------------------- */
  /* ---------- data spine: stats span exactly the plotted area ----------
     The customise control sits above the chart, so the stats column has to
     start at the chart's top edge rather than the grid row's. */
  function alignSpine(){
    var chartEl = document.querySelector('.chart');
    var stats   = document.querySelector('.index-stats');
    if(!chartEl || !stats) return;
    stats.style.marginTop = '';
    stats.style.height = '';
    if(window.matchMedia('(max-width:620px)').matches) return;
    /* The only thing above the chart in its column is the customise row, so
       measure that directly. offsetTop can't be compared across the two
       columns: the reveal transform makes the chart's column its own offset
       parent, so the two values sit in different coordinate spaces. */
    var head = document.querySelector('.chart-head');
    var off = 0;
    if(head){
      var hs = getComputedStyle(head);
      off = head.offsetHeight + (parseFloat(hs.marginBottom) || 0) + (parseFloat(hs.marginTop) || 0);
    }
    if(off > 0) stats.style.marginTop = off + 'px';
    stats.style.height = chartEl.offsetHeight + 'px';
  }
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ requestAnimationFrame(alignSpine); });
  }
  window.addEventListener('load', function(){ requestAnimationFrame(alignSpine); });
  window.addEventListener('resize', function(){ clearTimeout(window.__spT); window.__spT = setTimeout(alignSpine, 150); });
  /* the customise control changes height when the webfont swaps in, which
     moves the chart - watch it rather than guessing when layout has settled */
  if('ResizeObserver' in window){
    var spineRO = new ResizeObserver(function(){ alignSpine(); });
    ['.chart', '.chart-head'].forEach(function(sel){
      var el = document.querySelector(sel);
      if(el) spineRO.observe(el);
    });
  }
  alignSpine();

  /* ---------- the index notes follow their mark on a phone ----------
     At this width the note is fixed, so nothing that scrolls can clip it. That
     means the position has to come from script: it hangs under its mark, and is
     clamped to the screen rather than running off whichever edge it is near. */
  (function(){
    var open = null;
    function place(mark){
      var tip = mark.querySelector('.info__t');
      if(!tip) return;
      var m = mark.getBoundingClientRect();
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var vw = document.documentElement.clientWidth;
      var vh = document.documentElement.clientHeight;
      /* a mark inside the picker measures from the panel, so the note clears the
         list it is describing rather than covering it */
      var panel = mark.closest ? mark.closest('.cx__panel') : null;
      var from  = panel ? panel.getBoundingClientRect() : m;
      var left, top;
      if(from.left - 11 - w >= 12){          /* beside it, which reads best */
        left = from.left - 11 - w;
        top  = m.top + m.height / 2 - h / 2;
      } else {                               /* no room: under the mark */
        left = m.left + m.width / 2 - w / 2;
        top  = m.bottom + 8;
        if(top + h > vh - 12) top = m.top - h - 8;
      }
      var g = window.rbTopGuard ? window.rbTopGuard() : 12;
      tip.style.left = Math.round(Math.min(Math.max(12, left), vw - w - 12)) + 'px';
      tip.style.top  = Math.round(Math.min(Math.max(g,  top),  Math.max(g, vh - h - 12))) + 'px';
    }
    function markOf(e){ return e.target && e.target.closest ? e.target.closest('.info') : null; }
    document.addEventListener('pointerover', function(e){
      var mark = markOf(e); if(!mark) return;
      open = mark; place(mark);
    }, { passive:true });
    document.addEventListener('pointerout', function(e){
      var mark = markOf(e); if(mark && mark === open) open = null;
    }, { passive:true });
    document.addEventListener('focusin', function(e){
      var mark = markOf(e); if(!mark) return;
      open = mark; place(mark);
    });
    document.addEventListener('focusout', function(e){
      var mark = markOf(e); if(mark && mark === open) open = null;
    });
    /* fixed does not follow the page, nor the picker's own list */
    function follow(){ if(open) place(open); }
    window.addEventListener('scroll', follow, true);
    var rt = null;
    window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(follow, 80); });
  })();

  /* ---------- newsletter: pin the field to the image baseline ---------- */
  /* The field sits on the same line as the foot of the images beside it.
     getBoundingClientRect() cannot be trusted here: the reveal animation puts a
     transform on these elements, so a measurement taken before they have
     settled reads 26px out. offsetTop is layout-based and ignores transforms,
     so the sum up the offsetParent chain gives the true position either way. */
  function docTop(el){ var y = 0; while(el){ y += el.offsetTop; el = el.offsetParent; } return y; }
  function alignNewsletter(){
    var form  = document.querySelector('.nl__l .form-row');
    var media = document.querySelector('.nl .media');
    if(!form || !media) return;
    form.style.marginTop = '0px';
    if(window.innerWidth <= 980){ form.style.marginTop = '28px'; return; }  /* stacked */
    var need = (docTop(media) + media.offsetHeight) - (docTop(form) + form.offsetHeight);
    form.style.marginTop = Math.max(need, 0) + 'px';
  }
  var nlImg = document.querySelector('.nl .media img');
  if(nlImg && !nlImg.complete) nlImg.addEventListener('load', alignNewsletter);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(alignNewsletter);
  window.addEventListener('load', alignNewsletter);
  window.addEventListener('resize', function(){ clearTimeout(window.__nlT); window.__nlT = setTimeout(alignNewsletter, 150); });
  /* anything that changes either side's height re-runs it: a webfont swapping
     in, an image finally sizing, a heading rewrapping at a new width */
  if('ResizeObserver' in window){
    var nlRO = new ResizeObserver(function(){ alignNewsletter(); });
    ['.nl .media', '.nl__l', '.nl__l h2'].forEach(function(sel){
      var el = document.querySelector(sel);
      if(el) nlRO.observe(el);
    });
  }
  alignNewsletter();

})();
