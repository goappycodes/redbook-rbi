/* ------------------------------------------------------------------
   One field, three windows.

   The shader scales its pattern to uRes.y, so rendering it straight into a
   182px plate blows the pattern up about five times against the hero and the
   highlights come out huge and bright. Instead the field is rendered once,
   off-screen, at exactly the hero's size, and each plate copies the part of it
   that sits behind it. The plates are windows onto one animation rather than
   three animations.

   There is no pointer here: it runs the hero's own idle drift, which is what
   the hero settles into a couple of seconds after you stop moving.
   ------------------------------------------------------------------ */
(function(){
  var plates = [].slice.call(document.querySelectorAll('.pcard__flow'));
  var grid = document.querySelector('.pgrid');
  var vsSrc = document.getElementById('rbFlowVS'), fsSrc = document.getElementById('rbFlowFS');
  if(!plates.length || !vsSrc || !fsSrc) return;
  var STILL = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RIPPLES = 4;

  function flat(){
    plates.forEach(function(c){
      c.style.background =
        'linear-gradient(200deg,#6f2123 0%,#c2151f 40%,#c16256 68%,#e5b1a6 86%,#f2e0db 100%)';
    });
  }

  /* ---- the field, rendered off-screen at the hero's scale ---- */
  var field = document.createElement('canvas');
  /* kept, because the plates read it back after the draw */
  var gl = field.getContext('webgl', { antialias:false, alpha:false, preserveDrawingBuffer:true })
        || field.getContext('experimental-webgl', { preserveDrawingBuffer:true });
  if(!gl){ flat(); return; }

  function compile(type, src){
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  }
  var vs = compile(gl.VERTEX_SHADER, vsSrc.textContent),
      fs = compile(gl.FRAGMENT_SHADER, fsSrc.textContent);
  if(!vs || !fs){ flat(); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){ flat(); return; }
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  var U = function(n){ return gl.getUniformLocation(prog, n); };
  var uRes=U('uRes'), uTime=U('uTime'), uMouse=U('uMouse'), uHeading=U('uHeading'),
      uEnergy=U('uEnergy'), uPresence=U('uPresence'),
      uRipplePos=U('uRipplePos[0]'), uRippleAge=U('uRippleAge[0]');

  var windows = plates.map(function(c){ return { el:c, ctx:c.getContext('2d') }; });
  var dpr = 1, FW = 0, FH = 0, STACKED = false;

  function size(){
    /* the plates are modest, so a lower ceiling than the hero is plenty */
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(1, Math.round(window.innerWidth  * dpr));
    var h = Math.max(1, Math.round(window.innerHeight * dpr));
    if(field.width !== w || field.height !== h){
      field.width = w; field.height = h; FW = w; FH = h;
      gl.viewport(0, 0, w, h);
    }
    windows.forEach(function(v){
      var r = v.el.getBoundingClientRect();
      var cw = Math.max(1, Math.round(r.width * dpr)), ch = Math.max(1, Math.round(r.height * dpr));
      if(v.el.width !== cw || v.el.height !== ch){ v.el.width = cw; v.el.height = ch; }
    });
    /* one per row, so the plates all start at the same x: splitting the band by
       each plate's horizontal share would hand all three the identical slice */
    var a = plates[0].getBoundingClientRect();
    var b = plates[plates.length - 1].getBoundingClientRect();
    STACKED = plates.length > 1 && Math.abs(a.left - b.left) < 2;
  }

  /* ---- the hero's own behaviour: led by the pointer, drifting when left alone ----
     The field is viewport-sized and anchored to the viewport, so a pointer
     position maps straight into it; the plates are windows onto that one field,
     which is why pushing the flow around in one of them moves it in all three. */
  function approach(cur, goal, tau, dt){ return cur + (goal - cur) * (1 - Math.exp(-dt / tau)); }
  var t0 = performance.now(), last = t0, clock = 0;
  var prevAim = [0,0], rawSpeed = 0, energy = 0, energySm = 0, head = [1,0];
  var target = [0,0], smooth = [0,0], vel = [0,0];
  var idleMix = 1, presence = 0.70, lastMove = -1e9, dragging = false, primed = false;

  var rPos = new Float32Array(RIPPLES * 2);
  var rAge = new Float32Array(RIPPLES).fill(1e4);
  var rAt  = new Float32Array(RIPPLES).fill(-1e9);
  var rNext = 0;

  /* The plates show one band of the field rather than wherever they happen to
     sit on screen: the middle third, which carries the most movement. Each
     plate takes its own horizontal share of that band, so the three still read
     as windows onto a single picture. */
  var BAND_TOP = 0.50, BAND_BOT = 0.84;
  /* Stacked, the plates look at the band marked out across the hero, turned a
     quarter anticlockwise, and share its length between them a third each. */
  var SLICE = { l:0.006, r:0.989, t:0.548, b:0.896 };
  function bandRect(el){
    if(STACKED){
      var i = plates.indexOf(el), n = plates.length;
      var x0 = SLICE.l * FW, bw = (SLICE.r - SLICE.l) * FW;
      var y0 = SLICE.t * FH, bh = (SLICE.b - SLICE.t) * FH;
      var seg = bw / n;
      /* turned a quarter, so the source has to carry the plate's shape inverted
         or the pattern comes out stretched */
      var pr = el.getBoundingClientRect();
      var want = pr.width ? pr.height / pr.width : 1;
      var sh = Math.min(bh, seg / want), sw = sh * want;
      return {
        sx:x0 + i * seg + (seg - sw) / 2, sw:sw,
        sy:y0 + (bh - sh) / 2,            sh:sh,
        rot:true
      };
    }
    var g = (grid || el.parentNode).getBoundingClientRect();
    var r = el.getBoundingClientRect();
    var x0 = g.width ? (r.left - g.left) / g.width : 0;
    var x1 = g.width ? (r.right - g.left) / g.width : 1;
    return { sx:x0 * FW, sw:(x1 - x0) * FW, sy:BAND_TOP * FH, sh:(BAND_BOT - BAND_TOP) * FH };
  }
  /* which plate the pointer is over, so a touch lands in that plate's own strip
     rather than somewhere else in the field */
  function plateAt(y){
    var i = 0;
    for(var k = 0; k < plates.length; k++){
      var r = plates[k].getBoundingClientRect();
      if(y <= r.bottom){ i = k; break; }
      i = k;
    }
    return i;
  }
  function toField(x, y){
    var g = grid ? grid.getBoundingClientRect() : { left:0, width:window.innerWidth };
    var fx = Math.min(1, Math.max(0, g.width ? (x - g.left) / g.width : 0));
    if(STACKED){
      /* map into the very rect being drawn, undoing the quarter turn, so a touch
         pushes the flow where it was actually touched */
      var i = plateAt(y), m = plates[i].getBoundingClientRect();
      var b = bandRect(plates[i]);
      var u = Math.min(1, Math.max(0, m.width  ? (x - m.left) / m.width  : 0));
      var v = Math.min(1, Math.max(0, m.height ? (y - m.top)  / m.height : 0));
      var px = b.rot ? 1 - v : u;          /* along the source's width  */
      var py = b.rot ? u : v;              /* down the source's height  */
      return [b.sx + px * b.sw, FH - (b.sy + py * b.sh)];
    }
    var p = plates[0].getBoundingClientRect();
    var fy = Math.min(1, Math.max(0, p.height ? (y - p.top) / p.height : 0));
    return [fx * FW, FH - (BAND_TOP + fy * (BAND_BOT - BAND_TOP)) * FH];
  }
  function aimAt(x, y){
    target = toField(x, y);
    if(!primed){ smooth = target.slice(); prevAim = target.slice(); primed = true; }
    lastMove = performance.now() / 1000;
  }
  function ripple(x, y){
    var pt = toField(x, y);
    rPos[rNext*2] = pt[0]; rPos[rNext*2+1] = pt[1];
    rAt[rNext] = performance.now() / 1000;
    rNext = (rNext + 1) % RIPPLES;
  }
  if(grid && !STILL){
    grid.addEventListener('pointermove', function(e){ aimAt(e.clientX, e.clientY); }, { passive:true });
    grid.addEventListener('pointerdown', function(e){ dragging = true; aimAt(e.clientX, e.clientY); ripple(e.clientX, e.clientY); }, { passive:true });
    grid.addEventListener('pointerleave', function(){ lastMove = -1e9; dragging = false; }, { passive:true });
    window.addEventListener('pointerup',     function(){ dragging = false; }, { passive:true });
    window.addEventListener('pointercancel', function(){ dragging = false; }, { passive:true });
  }

  function render(now){
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var secs = now / 1000, s = (now - t0) / 1000;

    /* the drift is blended in, never switched to, or the field lurches every
       time the pointer pauses or leaves */
    var drift = [FW * (0.5 + 0.40 * Math.sin(s * 0.27) + 0.10 * Math.sin(s * 0.79)),
                 FH * (0.5 + 0.34 * Math.sin(s * 0.36 + 1.7))];
    if(!primed){ smooth = drift.slice(); prevAim = drift.slice(); target = drift.slice(); }
    var idle = (secs - lastMove) > 2.2;
    idleMix = approach(idleMix, idle ? 1 : 0, idle ? 1.8 : 0.40, dt);
    var aim = [target[0] + (drift[0] - target[0]) * idleMix,
               target[1] + (drift[1] - target[1]) * idleMix];

    presence = approach(presence, 1.0 - 0.30 * idleMix, 0.9, dt);

    var dxh = (aim[0] - prevAim[0]) / FH, dyh = (aim[1] - prevAim[1]) / FH;
    prevAim = aim.slice();
    var mag = Math.sqrt(dxh*dxh + dyh*dyh), instPS = mag / Math.max(dt, 1e-4);
    rawSpeed = approach(rawSpeed, instPS, 0.13, dt);

    /* critically damped spring, as on the hero: bounded acceleration keeps the
       motion smooth through a change of direction */
    var omega = 1 / (0.070 + 0.110 * Math.min(1, rawSpeed / 2.2));
    var rem = dt;
    while(rem > 1e-6){
      var h = Math.min(rem, 1 / 240);
      for(var i = 0; i < 2; i++){
        var acc = (aim[i] - smooth[i]) * omega * omega - 2 * omega * vel[i];
        vel[i] += acc * h; smooth[i] += vel[i] * h;
      }
      rem -= h;
    }
    if(mag > 1e-6){
      var w = (1 - Math.exp(-dt / 0.16)) * Math.min(1, instPS / 0.35);
      head[0] += (dxh / mag - head[0]) * w;
      head[1] += (dyh / mag - head[1]) * w;
      var hm = Math.sqrt(head[0]*head[0] + head[1]*head[1]) || 1;
      head[0] /= hm; head[1] /= hm;
    }
    var drive = Math.pow(Math.min(1, rawSpeed / 3.0), 0.45);
    var goal = dragging ? Math.max(drive, 0.45) : drive;
    var gap = goal - energy;
    energy = approach(energy, goal, gap > 0 ? 0.08 + 0.16 * Math.min(1, gap) : 1.1, dt);
    energySm = approach(energySm, energy, 0.35, dt);
    clock += dt * (2.1 + 1.5 * energySm);

    for(var k = 0; k < RIPPLES; k++) rAge[k] = secs - rAt[k];

    gl.uniform2f(uRes, FW, FH);
    gl.uniform1f(uTime, clock);
    gl.uniform2f(uMouse, smooth[0], smooth[1]);
    gl.uniform2f(uHeading, head[0], head[1]);
    gl.uniform1f(uEnergy, energy);
    gl.uniform1f(uPresence, presence);
    gl.uniform2fv(uRipplePos, rPos);
    gl.uniform1fv(uRippleAge, rAge);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* each plate takes the slice of the field it is sitting over */
    windows.forEach(function(v){
      if(!v.el.width || !v.el.height) return;
      var b = bandRect(v.el);
      var cw = v.el.width, ch = v.el.height;
      v.ctx.clearRect(0, 0, cw, ch);
      if(b.rot){
        /* a quarter turn anticlockwise about the plate's centre, so the
           destination is drawn with its sides swapped */
        v.ctx.save();
        v.ctx.translate(cw / 2, ch / 2);
        v.ctx.rotate(-Math.PI / 2);
        v.ctx.drawImage(field, b.sx, b.sy, b.sw, b.sh, -ch / 2, -cw / 2, ch, cw);
        v.ctx.restore();
      } else {
        v.ctx.drawImage(field, b.sx, b.sy, b.sw, b.sh, 0, 0, cw, ch);
      }
    });
  }

  var running = false, raf = null;
  function loop(now){ render(now); raf = requestAnimationFrame(loop); }
  function start(){ if(running) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
  function stop(){ running = false; if(raf) cancelAnimationFrame(raf); raf = null; }

  window.addEventListener('resize', function(){
    clearTimeout(window.__pfT);
    window.__pfT = setTimeout(function(){ size(); render(performance.now()); }, 160);
  });

  size();
  if(STILL){ render(performance.now()); }
  else if('IntersectionObserver' in window && grid){
    new IntersectionObserver(function(es){
      if(es[0].isIntersecting){ size(); start(); } else { stop(); }
    }, { threshold:0 }).observe(grid);
  } else { start(); }
})();
