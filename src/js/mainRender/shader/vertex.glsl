precision mediump float;
// 告诉gpu以什么程度的标准进行精度的计算
// lowp 低精度 -2^8 - 2^8
// mediump 中精度 -2^10 - 2^10
// highp 高精度 -2^16 - 2^16

attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 获取时间
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

// 随机函数
float random (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  /* // resultPosition.x += 0.5;
  // resultPosition.z += 0.5;
  // 纯色的波浪渐变效果
  float changeX = sin(resultPosition.x + (uTime * 6.0)) * 0.8; // [-0.8, 0.8]
  float changeY = sin(resultPosition.y + (uTime * 6.0)); // [-1, 1]
  resultPosition.z = changeX;
  resultPosition.z += changeY;
  // 计算完之后，z值得范围 [-1.8, 1.8]
  // 根据高度的效果，实现一个深浅的效果
  vElevation = (resultPosition.z / 1.8 + 1.0) / 4.0 + 0.5; // [0.5 - 1.0] */

  vUv = uv;

  vec4 resultPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * resultPosition;
}
