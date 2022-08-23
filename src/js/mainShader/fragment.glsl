precision mediump float;

#define PI 3.14159265359

varying vec2 vUv;
varying float vElevation;

// // 获取材质
// uniform sampler2D uTexture;
uniform float uTime;
uniform float uJsChange;

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

void main() {
  // 目前就可以实现渐变的效果，但是还不知道要如何按照我想要的效果修改起始颜色
  // uv在不同的位置对应的UV也不相同，所以起始的颜色也是不相同的
  // 目前会自动填充中间的颜色，做到一个类似于渐变的效果
  // vUv.x *= vElevation;
  // vec2 newUv = vec2(vUv.x * vElevation, vUv.y);
  // // vec2 newUv = vec2(vUv);
  // gl_FragColor = vec4(newUv, 0.0, 1.0);

  /* // 需要根据uv对图片进行采样，取出每个位置对应的颜色
  vec4 textureColor = texture2D(uTexture, vUv);
  // 根据深浅加上效果
  textureColor.x *= vElevation;
  gl_FragColor = textureColor; */

  // 利用UV实现渐变的效果 - 黑色到白色的渐变
  // 从左向右的渐变
  // float strength = vUv.x;
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 从下到上
  // float strength = vUv.y;
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 从右向左的渐变
  // float strength = 1.0 - vUv.x;
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 从上到下
  // float strength = (1.0 - vUv.y);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 从上到下 - 剧烈程度的渐变
  // float strength = (1.0 - vUv.y) * 5.0; // 大于1的值，实际显示的效果和值为1时没有区别
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 反复的渐变效果
  // 利用取模达到反复的效果。实际效果类似于百叶窗的效果
  // float strength = mod((1.0 - vUv.y) * 5.0, 1.0);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 类似于斑马线的渐变效果
  // float strength = step(0.4, mod((1.0 - vUv.y) * 5.0, 1.0));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 条纹相加
  // float strength = step(0.5, mod(vUv.x * 10.0, 1.0));
  // strength += step(0.8, mod(vUv.y * 10.0, 1.0));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 相乘
  // 显示的效果上，类似于只有两个条纹 重叠的部分 才会显示为白色
  // float strength = step(0.5, mod(vUv.x * 10.0, 1.0));
  // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 相减
  // // 显示的效果上，累死一之后两个条纹 不重叠的部分 才会显示为白色
  // float strength = step(0.5, mod(vUv.x * 10.0, 1.0));
  // strength -= step(0.8, mod(vUv.y * 10.0, 1.0));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 方块图案 - 并且根据时间添加动画效果
  /*
    0.0 + 0.0
    1.0 + 0.0
    1.0 + 1.0
    0.0 + 1.0
  */
  /*
    step(a, b);当b > a时， 返回1；当b < a时，返回0
    barX 代表 宽0.6，高0.2 的区域，显示为白色
    barY 代表 宽0.2，高0.8 的区域，显示为白色
    一个小方块
    两个方块重叠的部分，相加之和为2，显示的效果和为1时是一样的
  */
  // float barX = step(0.4, mod((vUv.x - (uTime / 7.0)) * 10.0, 1.0)) * step(0.8, mod((vUv.y - (uTime / 7.0)) * 10.0, 1.0));
  // float barY = step(0.4, mod((vUv.y - (uTime / 7.0)) * 10.0, 1.0)) * step(0.8, mod((vUv.x - (uTime / 7.0)) * 10.0, 1.0));
  // float barX = step(0.4, mod(vUv.x * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
  // float barY = step(0.4, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0 - 0.3, 1.0)); // 添加偏移量
  // float strength = barX + barY;
  // float strength = barX;
  // float strength = barY;
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 使用绝对值渲染
  // float strength = abs(vUv.x - 0.5);
  // float strength = abs(vUv.x - 0.5) + abs(vUv.y - 0.5);
  // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
  // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
  // float strength = 1.0 - max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)); // 取反
  // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 随机效果
  // float strength = random(vUv);
  // float strength = floor(vUv.x * 10.0) / 10.0;
  // float strength = floor(vUv.y * 10.0) / 10.0;
  // float strength = floor(vUv.x * 10.0) / 10.0 * floor(vUv.y * 10.0) / 10.0; // 网格效果
  // strength = random(vec2(strength, strength)); // 网格 + 随机，类似马赛克的效果
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 获取向量的长度
  // float strength = length(vUv);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 获取两个向量之间的距离
  // float strength = 1.0 - distance(vUv, vec2(0.5, 0.5));
  // float strength = distance(vUv, vec2(0.5, 0.5));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 向量的相除，实现光点效果
  // float strength = 0.2 / distance(vUv, vec2(0.5, 0.5));
  // float strength = 0.2 / distance(vUv, vec2(0.5, 0.5)) - 1.0; // 可以过滤掉一部分白色，让光点的效果表现得更加集中
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 设置水平、或竖直方向上的拉伸或者收缩的效果
  // float strength = 0.2 / distance(vUv, vec2(0.5, 0.5)) - 1.0;
  // float strength = 0.2 / distance(vec2(vUv.x, (vUv.y - 0.5) * 2.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // float strength = 0.2 / distance(vec2((vUv.x - 0.5) * 3.0 + 0.5, vUv.y), vec2(0.5, 0.5)) - 1.0;
  // float strength = 0.2 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // strength *= 0.2 / distance(vec2((vUv.x - 0.5) * 5.0 + 0.5, vUv.y), vec2(0.5, 0.5)) - 1.0;
  // 星星的效果
  // strength += 0.2 / distance(vec2((vUv.x - 0.5) * 5.0 + 0.5, vUv.y), vec2(0.5, 0.5)) - 1.0;
  // 星星添加旋转的效果
  // vec2 rotateUv = rotate(vUv, uTime, vec2(0.5));
  // float strength = 0.15 / distance(vec2(rotateUv.x, (rotateUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // strength += 0.15 / distance(vec2(rotateUv.y, (rotateUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 波浪环
  // vec2 waveUv = vec2(vUv.x, vUv.y + sin(vUv.x * 25.0) * 0.12);
  // float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 使用sin实现类似于随机渲染的效果
  // vec2 waveUv = vec2(
  //   vUv.x + cos(vUv.y * 25.0) * 0.12,
  //   vUv.y + sin(vUv.x * 25.0) * 0.12
  // );
  // float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 根据角度进行渲染
  // float angle = atan(vUv.x, vUv.y);
  // float strength = angle;
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 根据角度实现螺旋渐变
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // float strength = abs((angle + 3.14) / 6.28);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 实现雷达扫描的效果
  // float alpha = 1.0 - step(0.3, abs(distance(vUv, vec2(0.5))));
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // float strength = (angle + 3.14) / 6.28;
  // gl_FragColor = vec4(strength, strength, strength, alpha);

  // atan 可以将X Y坐标转换为角度
  // webgl中，atan的返回值范围是 [-PI, PI]
  // 雷达扫描的旋转效果
  // vec2 rotateUv = rotate(vUv, -(uTime * 4.0), vec2(0.5));
  // float alpha = 1.0 - step(0.3, abs(distance(rotateUv, vec2(0.5))));
  // float angle = atan(rotateUv.x - 0.5, rotateUv.y - 0.5);
  // float strength = (angle + 3.14) / 6.28;
  // gl_FragColor = vec4(strength, strength, strength, alpha);

  // 万花筒
  // vec2 rotateUv = rotate(vUv, -(uTime * 0.7), vec2(0.5));
  // float angle = atan(rotateUv.x - 0.5, rotateUv.y - 0.5) / PI;
  // float strength = mod(angle * 15.0, 1.0);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // vec2 rotateUv = rotate(vUv, -(uTime * 0.7), vec2(0.5));
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (2.0 * PI);
  // float strength = sin(angle * 200.0);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 使用噪声实现烟雾、波纹的效果
  // float strength = noise(vUv);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  // 加强噪点的效果
  // float strength = noise(vUv * 100.0);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  // float strength = noise(vUv * 10.0);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  // float strength = step(0.5, noise(vUv * uJsChange));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  // 通过时间设置波形
  // float strength = step(0.5, noise(vUv * uJsChange + uTime));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  // float strength = abs(cnoise(vUv * uJsChange));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  // 发光路径
  // float strength = 1.0 - abs(cnoise(vUv * uJsChange));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  // float strength = sin(cnoise(vUv * uJsChange) * 12.0);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  // 类似水波纹的效果
  // float strength = sin(cnoise(vUv * uJsChange) * 6.0 + (uTime * 1.8));
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 使用颜色混合函数 - 相当于将原本的黑白色改为黑色和黄色的效果
  /* 
    原本为 1 时，显示为白色
    使用颜色混合之后，strength为 1 时，显示为 yellowColor
  */

  vec3 blackColor = vec3(0.0, 0.0, 0.0);
  vec3 yellowColor = vec3(1.0, 1.0, 0.0);
  // float strength = step(0.9, sin(cnoise(vUv * uJsChange) * 20.0));
  float strength = sin(cnoise(vUv * uJsChange) * 30.0);
  vec3 mixColor = mix(blackColor, yellowColor, strength);
  gl_FragColor = vec4(mixColor, 1.0);
}
