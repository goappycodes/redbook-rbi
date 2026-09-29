precision highp float;

#define RIPPLES 4

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform vec2  uHeading;
uniform float uEnergy;
uniform float uPresence;
uniform vec2  uRipplePos[RIPPLES];
uniform float uRippleAge[RIPPLES];

vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p){
  float f = 0.0, a = 0.62;
  for (int i = 0; i < 3; i++){ f += a * snoise(p); p *= 2.03; a *= 0.26; }
  return f;
}

const vec3 PAPER   = vec3(0.94901961, 0.87843137, 0.85882353);
const vec3 BLUSH   = vec3(0.89803922, 0.69411765, 0.65098039);
const vec3 ROSE    = vec3(0.83137255, 0.50196078, 0.44705882);
const vec3 EMBER   = vec3(0.75686275, 0.38431373, 0.33725490);
const vec3 FLAME   = vec3(0.65490196, 0.26666667, 0.23921569);
const vec3 VIVID   = vec3(0.76078431, 0.08235294, 0.12156863);
const vec3 DEEP    = vec3(0.43529412, 0.12941176, 0.13725490);
const float BIAS  = 0.100;
const float GAMMA = 0.680;

vec3 ramp(float x){
  vec3 c = mix(PAPER, BLUSH, smoothstep(0.00, 0.34, x));
  c = mix(c, ROSE,  smoothstep(0.34, 0.48, x));
  c = mix(c, EMBER, smoothstep(0.45, 0.57, x));
  c = mix(c, FLAME, smoothstep(0.52, 0.63, x));
  c = mix(c, VIVID, smoothstep(0.58, 0.72, x));
  return c;
}

void main(){
  vec2 p  = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m  = (uMouse          - 0.5 * uRes) / uRes.y;
  vec2 pn = (gl_FragCoord.xy / uRes - 0.5) * 2.0;
  vec2 mn = uMouse / uRes;

  float t = uTime * 0.045;

  vec2  hd = uHeading;
  vec2  nr = vec2(-hd.y, hd.x);
  vec2  d  = p - m;
  float across = dot(d, nr);
  float along  = dot(d, hd);

  float band  = exp(-across * across * 4.5)
              * (0.55 + 0.45 * exp(-along * along * 0.30));
  vec2  smear = hd * band * uEnergy * 0.34;
  vec2  buckle = nr * band * uEnergy * 0.055 * sin(along * 3.4 - uTime * 1.5);

  vec2  wave = vec2(0.0);
  float ring = 0.0;
  for (int i = 0; i < RIPPLES; i++){
    float age = uRippleAge[i];
    if (age < 6.0) {
      vec2  rp   = p - (uRipplePos[i] - 0.5 * uRes) / uRes.y;
      float rl   = length(rp);
      float rad  = age * 0.60;
      float bandR = exp(-pow((rl - rad) * 2.6, 2.0));
      float life = exp(-age * 0.85);
      float wv   = sin((rl - rad) * 7.5) * bandR * life;
      ring += wv;
      wave += rp / (rl + 0.10) * wv * 0.24;
    }
  }

  vec2 q0 = p + smear + buckle + wave;

  vec2 q = vec2( fbm(q0 * 0.50 + vec2( 0.0,  t)),
                 fbm(q0 * 0.50 + vec2( 3.4, -t) + 2.1) );
  vec2 r = vec2( fbm(q0 * 0.62 + 0.42 * q + vec2(1.7, 9.2) + 0.42 * t),
                 fbm(q0 * 0.62 + 0.42 * q + vec2(8.3, 2.8) - 0.36 * t) );
  float f = fbm(q0 * 0.58 + 0.66 * r);

  float tilt = (mn.x - 0.5) * 0.95 * uPresence;
  vec2  gdir = normalize(vec2(tilt + 0.30, 1.0));
  float lift = (mn.y - 0.5) * 0.34 * uPresence;
  float comp = 0.5 + dot(pn, gdir) * 0.52 + lift;

  float v = pow(clamp(comp + f * 0.50 + ring * 0.30 + BIAS, 0.0, 1.0), GAMMA);

  float sh = dot(pn, normalize(vec2(0.48 + tilt * 0.5, 0.88))) * 0.66 + 0.40
           + fbm(q0 * 0.44 + vec2(4.1, t * 0.9)) * 0.38
           + lift * 0.25;
  float shade = smoothstep(0.46, 1.04, sh);

  vec3 col = ramp(v);
  col = mix(col, DEEP, shade * smoothstep(0.50, 0.80, v));

  float dz = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dz - 0.5) * (1.7 / 255.0) * (1.0 - shade * step(0.80, v));

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
