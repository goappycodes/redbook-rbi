/* ----------------------------------------------------------------
   Hero colour flow - interactive WebGL field.
   Scoped to the hero rather than the viewport: it sizes to the
   section, only takes pointer input while the cursor is over it,
   and stops rendering entirely once the hero scrolls away.
   Falls back to a static gradient wherever WebGL is unavailable.
   ---------------------------------------------------------------- */
(function () {
  var RIPPLES = 4;
  var canvas = document.getElementById('heroFlow');
  var heroEl = document.getElementById('hero');
  if (!canvas || !heroEl) return;

  function fallback(){
    canvas.style.background =
      'linear-gradient(200deg,#6f2123 0%,#c2151f 40%,#c16256 68%,#e5b1a6 86%,#f2e0db 100%)';
  }

  var gl = canvas.getContext('webgl', { antialias:false, alpha:false, powerPreference:'high-performance' })
        || canvas.getContext('experimental-webgl');
  if (!gl) { fallback(); return; }

  function compile(type, src){
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(sh)); return null; }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER,   document.getElementById('rbFlowVS').textContent);
  var fs = compile(gl.FRAGMENT_SHADER, document.getElementById('rbFlowFS').textContent);
  if (!vs || !fs) { fallback(); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); fallback(); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var U = function(n){ return gl.getUniformLocation(prog, n); };
  var uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uHeading = U('uHeading'),
      uEnergy = U('uEnergy'), uPresence = U('uPresence'),
      uRipplePos = U('uRipplePos[0]'), uRippleAge = U('uRippleAge[0]');

  /* ---------- sizing ---------- */
  var W = 0, H = 0, dpr = 1;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(canvas.clientWidth  * dpr));
    H = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W; canvas.height = H;
      gl.viewport(0, 0, W, H);
    }
  }
  window.addEventListener('resize', resize);

  /* ---------- pointer ---------- */
  var target = [0,0], smooth = [0,0], rawPrev = [0,0];
  var smoothVel = [0,0];              // follower velocity, for the spring
  var rawSpeed = 0, idleMix = 0, energySm = 0;
  var head = [1,0];                   // direction of travel; outlives the stroke
  var energy = 0, presence = 0;
  var lastMove = -1e9, dragging = false;

  var rPos = new Float32Array(RIPPLES * 2);
  var rAge = new Float32Array(RIPPLES).fill(1e3);
  var rAt  = new Float32Array(RIPPLES).fill(-1e9);
  var rNext = 0;

  function toGL(clientX, clientY){
    var r = canvas.getBoundingClientRect();
    return [(clientX - r.left) * dpr, (r.height - (clientY - r.top)) * dpr]; // flip Y for GL
  }
  function setTarget(x, y){ target = toGL(x, y); lastMove = performance.now() / 1000; }
  function ripple(x, y){
    var pt = toGL(x, y);
    rPos[rNext*2] = pt[0]; rPos[rNext*2+1] = pt[1];
    rAt[rNext] = performance.now() / 1000;
    rNext = (rNext + 1) % RIPPLES;
  }

  var STILL = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!STILL) {
    heroEl.addEventListener('pointermove', function(e){ setTarget(e.clientX, e.clientY); }, { passive:true });
    heroEl.addEventListener('pointerdown', function(e){ dragging = true; setTarget(e.clientX, e.clientY); ripple(e.clientX, e.clientY); }, { passive:true });
    heroEl.addEventListener('pointerleave', function(){ lastMove = -1e9; dragging = false; }, { passive:true });
    window.addEventListener('pointerup',     function(){ dragging = false; }, { passive:true });
    window.addEventListener('pointercancel', function(){ dragging = false; }, { passive:true });
  }

  /* ---------- loop ---------- */
  resize();
  smooth = [W * 0.5, H * 0.5];
  target = smooth.slice();
  rawPrev = smooth.slice();

  var t0 = performance.now(), clock = 0, last = t0;
  var onscreen = true, visible = true, queued = false;

  function pump(){
    if (queued || !onscreen || !visible) return;
    queued = true;
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', function(){
    visible = !document.hidden; last = performance.now(); pump();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(es){
      onscreen = es[0].isIntersecting; last = performance.now(); pump();
    }, { threshold:0 }).observe(heroEl);
  }

  // Frame-rate independent smoothing: covers ~63% of the gap every `tau`
  // seconds, so behaviour is identical at 60Hz, 120Hz, or through a hitch.
  function approach(cur, goal, tau, dt){ return cur + (goal - cur) * (1 - Math.exp(-dt / tau)); }

  function frame(){
    queued = false;
    if (!onscreen || !visible) return;
    resize();

    var now  = performance.now();
    var dt   = Math.min(0.05, (now - last) / 1000);
    last = now;
    var secs = now / 1000;

    /* --- what the field is being led toward -----------------------------
       The idle drift is BLENDED in, never switched to. Swapping the aim
       between the cursor and a drift path teleports it, which is a visible
       lurch every time you pause or resume.                              */
    var s = (now - t0) / 1000;
    var drift = [W * (0.5 + 0.40 * Math.sin(s * 0.09) + 0.10 * Math.sin(s * 0.31)),
                 H * (0.5 + 0.34 * Math.sin(s * 0.13 + 1.7))];
    var idle = (secs - lastMove) > 2.2;
    idleMix = approach(idleMix, idle ? 1 : 0, idle ? 1.8 : 0.40, dt);
    var aim = [target[0] + (drift[0] - target[0]) * idleMix,
               target[1] + (drift[1] - target[1]) * idleMix];

    presence = approach(presence, 1.0 - 0.30 * idleMix, 0.9, dt);

    // Pointer speed in screen-heights per second, smoothed so that bursty or
    // coalesced pointer events can't make the response flicker.
    var dxh = (aim[0] - rawPrev[0]) / H, dyh = (aim[1] - rawPrev[1]) / H;
    rawPrev = aim.slice();
    var mag    = Math.sqrt(dxh*dxh + dyh*dyh);
    var instPS = mag / Math.max(dt, 1e-4);
    rawSpeed = approach(rawSpeed, instPS, 0.13, dt);

    /* --- the follower: a critically damped spring ------------------------
       Exponential easing toward a moving target has discontinuous velocity,
       so every change in the cursor steps the field. A spring bounds the
       acceleration instead, so the motion stays smooth through direction
       changes; still trails a little more the faster you move.           */
    var tau   = 0.070 + 0.110 * Math.min(1, rawSpeed / 2.2);
    var omega = 1 / tau;
    var rem = dt;
    while (rem > 1e-6) {
      var h = Math.min(rem, 1 / 240);              // substep keeps it stable
      for (var i = 0; i < 2; i++) {
        var acc = (aim[i] - smooth[i]) * omega * omega - 2 * omega * smoothVel[i];
        smoothVel[i] += acc * h;
        smooth[i]    += smoothVel[i] * h;
      }
      rem -= h;
    }

    // Heading is trusted in proportion to how fast the pointer is actually
    // travelling, so jitter near rest can no longer whip the smear around.
    if (mag > 1e-6) {
      var w = (1 - Math.exp(-dt / 0.16)) * Math.min(1, instPS / 0.35);
      head[0] += (dxh / mag - head[0]) * w;
      head[1] += (dyh / mag - head[1]) * w;
      var hm = Math.sqrt(head[0]*head[0] + head[1]*head[1]) || 1;
      head[0] /= hm; head[1] /= hm;
    }

    // Compressive curve: a gentle drift already reads clearly, while the top
    // of the range takes real speed to reach.
    var drive = Math.pow(Math.min(1, rawSpeed / 3.0), 0.45);
    var goal  = dragging ? Math.max(drive, 0.45) : drive;
    var gap   = goal - energy;
    // Small steps land almost at once; big jumps still ease in.
    energy = approach(energy, goal, gap > 0 ? 0.08 + 0.16 * Math.min(1, gap) : 1.1, dt);

    // The flow's own speed follows energy gently. Running the clock up to 6x
    // on every stroke was lurching the entire field; 1.5x reads as life.
    energySm = approach(energySm, energy, 0.35, dt);
    clock += dt * (1.0 + 1.5 * energySm);

    for (var k = 0; k < RIPPLES; k++) rAge[k] = secs - rAt[k];

    gl.uniform2f(uRes, W, H);
    gl.uniform1f(uTime, clock);
    gl.uniform2f(uMouse, smooth[0], smooth[1]);
    gl.uniform2f(uHeading, head[0], head[1]);
    gl.uniform1f(uEnergy, energy);
    gl.uniform1f(uPresence, presence);
    gl.uniform2fv(uRipplePos, rPos);
    gl.uniform1fv(uRippleAge, rAge);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!STILL) pump();
  }
  pump();
})();
