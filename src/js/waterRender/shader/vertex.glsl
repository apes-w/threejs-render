precision mediump float;
// 告诉gpu以什么程度的标准进行精度的计算
// lowp 低精度 -2^8 - 2^8
// mediump 中精度 -2^10 - 2^10
// highp 高精度 -2^16 - 2^16

// 随机函数
float random (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 旋转函数
// uv：需要旋转的向量
// rotation：旋转的角度
// mid：根据mid的位置进行旋转
vec2 rotate(vec2 uv,float rotation,vec2 mid)
{
  return vec2(
    cos(rotation)*(uv.x-mid.x)+sin(rotation)*(uv.y-mid.y)+mid.x,
    cos(rotation)*(uv.y-mid.y)-sin(rotation)*(uv.x-mid.x)+mid.y
  );
}

// 噪声函数
float noise(in vec2 st){
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1., 0.));
  float c = random(i + vec2(0., 1.));
  float d = random(i + vec2(1., 1.));
  
  // Smooth Interpolation
  
  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = f * f * (3. - 2. * f);
  // u = smoothstep(0.,1.,f);
  
  // Mix 4 coorners percentages
  return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y;
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x)
{
  return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t)
{
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

uniform float uWaveFrequency;
uniform float uScale;
uniform float uNoiseScale;
uniform float uTime;
uniform float uXSpeed;
uniform float uZSpeed;

varying float vDepth;

void main() {
  /*
    投影矩阵 * 视图矩阵 * 模型矩阵 * 顶点坐标
    最后得到的结果才是渲染在界面上的效果
    矩阵相乘的顺序不能发生变化
    本地坐标系 -> 经过模型矩阵变换 -> 世界坐标系 -> 经过视图矩阵变换 -> 视图坐标系 -> 经过投影矩阵变换 -> 裁剪（投影）坐标系
  */
  // resultPosition 世界坐标系，可以再这个坐标系下执行缩放、移动、旋转等操作
  vec4 resultPosition = modelMatrix * vec4(position, 1.0);
  float useUTime = 0.0;
  // 根据坐标所在的位置，设置出波浪的效果
  float fHeight = sin(resultPosition.x * uWaveFrequency + useUTime * uXSpeed) * sin(resultPosition.z * uWaveFrequency + useUTime * uZSpeed);
  // 在波浪上，添加噪声函数，是现在光滑的曲面上在额外添加一些变化
  fHeight += -abs(cnoise(resultPosition.xz * uWaveFrequency + useUTime * 3.0)) * uNoiseScale;
  fHeight *= uScale;
  // 把vDepth的取值范围设置为 [0, 1]
  vDepth = (fHeight + uScale) / uScale / 2.0;
  resultPosition.y += fHeight;
  gl_Position = projectionMatrix * viewMatrix * resultPosition;
}
