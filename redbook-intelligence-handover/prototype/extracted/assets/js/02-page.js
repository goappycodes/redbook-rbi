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
  var SERIES = {"overall":{"label":"Overall Luxury Projects Index","london":{"v":128.6,"y":9.7,"b":28.6,"a":[100.0,112.6,118.9,128.6]},"country":{"v":124.1,"y":8.2,"b":24.1,"a":[100.0,110.6,115.9,124.1]}},"labour":{"label":"Labour Index","london":{"v":131.2,"y":17.3,"b":31.2,"a":[100.0,118.4,113.9,131.2]},"country":{"v":127.4,"y":15.2,"b":27.4,"a":[100.0,116.2,112.2,127.4]}},"materials":{"label":"Materials Index","london":{"v":126.1,"y":1.3,"b":26.1,"a":[100.0,121.3,124.8,126.1]},"country":{"v":123.8,"y":1.2,"b":23.8,"a":[100.0,119.4,122.6,123.8]}},"rawbuild":{"label":"Raw Build Cost Index","london":{"v":129.4,"y":13.6,"b":29.4,"a":[100.0,106.2,115.8,129.4]},"country":{"v":125.6,"y":11.8,"b":25.6,"a":[100.0,105.4,113.8,125.6]}},"construction":{"label":"Construction Cost Index","london":{"v":132.4,"y":10.3,"b":32.4,"a":[100.0,109.8,122.1,132.4]},"country":{"v":128.0,"y":8.9,"b":28.0,"a":[100.0,108.5,119.1,128.0]}},"fees":{"label":"Professional Fees Index","london":{"v":119.8,"y":12.9,"b":19.8,"a":[100.0,103.4,106.9,119.8]},"country":{"v":117.9,"y":11.7,"b":17.9,"a":[100.0,103.1,106.2,117.9]}},"ohp":{"label":"Contractors OH&Ps Index","london":{"v":122.5,"y":7.9,"b":22.5,"a":[100.0,113.8,114.6,122.5]},"country":{"v":120.3,"y":7.1,"b":20.3,"a":[100.0,112.5,113.2,120.3]}},"prelims":{"label":"Contractors Preliminaries Index","london":{"v":124.9,"y":7.7,"b":24.9,"a":[100.0,120.6,117.2,124.9]},"country":{"v":122.1,"y":6.8,"b":22.1,"a":[100.0,118.3,115.3,122.1]}},"landscaping":{"label":"Landscaping Index","london":{"v":133.8,"y":19.6,"b":33.8,"a":[100.0,118.0,114.2,133.8]},"country":{"v":129.2,"y":16.9,"b":29.2,"a":[100.0,115.6,112.3,129.2]}},"ffe":{"label":"FF&E Index","london":{"v":117.3,"y":9.4,"b":17.3,"a":[100.0,112.5,107.9,117.3]},"country":{"v":116.1,"y":8.7,"b":16.1,"a":[100.0,111.6,107.4,116.1]}},"allin":{"label":"All-in Project Cost Index","london":{"v":130.7,"y":8.8,"b":30.7,"a":[100.0,108.5,121.9,130.7]},"country":{"v":126.4,"y":7.6,"b":26.4,"a":[100.0,107.3,118.8,126.4]}}};
  /* Plain-English notes on what each index actually measures. Placeholder
     wording - swap for the definitions the methodology settles on. */
  var INFO = {
    overall:      'The headline measure. What it costs to deliver a luxury residential scheme end to end, set at 100 in the base year and weighted across every sub-index at its share of a typical project.',
    labour:       'Site labour: trades, supervision and site management, measured as the cost of getting a unit of work done rather than as headline wage rates.',
    materials:    'The basket of materials prime residential work actually uses, from structure and glazing to joinery, stone and finishes, weighted by typical spend.',
    rawbuild:     'Construction cost before anything is added on top: labour and materials in place, without preliminaries, overheads or profit.',
    construction: "The contractor's full figure for building the scheme, being raw build cost plus preliminaries, overheads and profit.",
    fees:         'Architects, engineers, project managers, cost consultants and specialist designers, tracked against construction cost.',
    ohp:          'The overhead and profit a contractor adds to the raw build cost, tracked as a percentage of it.',
    prelims:      'Running the site rather than building on it: welfare, scaffolding, plant, site management, insurances and programme costs.',
    landscaping:  'Everything outside the building line: hard and soft landscaping, garden structures, drainage, external lighting and planting.',
    ffe:          'Loose furniture, fittings and equipment specified for the finished house. Anything built in sits under construction cost instead.',
    allin:        'The whole bill a client carries: construction, professional fees, FF&amp;E, landscaping, statutory costs and contingency.'
  };
  function infoMark(key){
    if(!INFO[key]) return '';
    return '<span class="info" tabindex="0" role="note" aria-label="What this index measures">i' +
           '<span class="info__t">' + INFO[key] + '</span></span>';
  }
  var ORDER = ['overall','labour','materials','rawbuild','construction','fees',
               'ohp','prelims','landscaping','ffe','allin'];
  var LOCKED = 'overall';
  var MAX = 4;
  var MAIN_COLOUR = '#6F2123';
  /* RB Secondary 1, RB Index 3, RB Index 4 - the three swatches that stay
     furthest apart from each other and from the overall index's red */
  var SLOTS = ['#7F7D62','#CB5255','#DE9194'];   /* colour by slot, not by series */

  var region = 'london';
  var picked = ['overall'];

  /* the axis foot is always the base, its head the tallest reading on show,
     rounded up to the next ten, so the lines use the whole frame */
  /* a fixed frame: nothing in the set reaches 150, so the scale never shifts
     under the reader and lines can be compared between selections */
  var AXIS_FOOT = 100, AXIS_HEAD = 150;
  function coordsFor(key){
    var a = SERIES[key][region].a, k = 300 / (AXIS_HEAD - AXIS_FOOT);
    var step = 600 / (a.length - 1);        /* one reading per year mark */
    return a.map(function(v, i){
      return [i * step, 300 - (v - AXIS_FOOT) * k];
    });
  }
  /* straight between readings, so every year-on-year move is a plain line
     with a visible change of direction at each year mark */
  function pathFor(key){
    return coordsFor(key).map(function(q, i){
      return (i ? 'L' : 'M') + q[0].toFixed(2) + ',' + q[1].toFixed(2);
    }).join(' ');
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
        return '<span><i style="background:' + colourOf(key) + '"></i>' + SERIES[key].label + '</span>';
      }).join('');
    }
  }

  function sign(n){ return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }
  function paintStats(){
    if(!statHost) return;
    /* the sub-indices read downwards to the overall index, which holds the foot */
    var rows = ordered().filter(function(k){ return k !== LOCKED; }).concat([LOCKED]);
    statHost.innerHTML = rows.map(function(key){
      var d = SERIES[key][region], main = key === LOCKED;
      return '<div class="stat' + (main ? ' stat--main' : '') + '" data-series="' + key + '">' +
        '<p class="stat__num' + (main ? '' : ' stat__num--sub') + '">' + d.v.toFixed(1) + '</p>' +
        '<span class="stat__d">' + sign(d.y) + '</span>' +
        '<span class="stat__d">' + sign(d.b) + '</span>' +
        '<p class="stat__l">' + SERIES[key].label + infoMark(key) + '</p></div>';
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
        '<span class="cx__name">' + SERIES[key].label + '</span>' + infoMark(key) +
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
      cxNote.textContent = full
        ? 'Three selected. Turn one off to choose another.'
        : 'Select up to 3 more';
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
  var YEAR_X = 400;                       /* where the 2025/26 label sits */
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
      picked = [LOCKED];              /* the overall index cannot be cleared */
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
