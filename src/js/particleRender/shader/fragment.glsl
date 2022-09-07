precision mediump float;

#define PI 3.14159265359

varying vec2 vUv;

void main() {
  // 使用uv向量，实际效果为黑色方块
  // gl_FragColor = vec4(vUv, 0.0, 1.0);

  // gl_PointCoord 点渲染模式对应点像素坐标
  // gl_FragColor = vec4(vec2(gl_PointCoord), 0.0, 1.0);

  // 渲染一个光点
  float strength = distance(gl_PointCoord, vec2(0.5, 0.5));
  strength *= 2.0;
  strength = 1.0 - strength;
  strength = step(strength, 0.4);
  // 全部使用strength应该是可以的，但是效果并不明显
  gl_FragColor = vec4(strength, strength, strength, 1.0);
}
