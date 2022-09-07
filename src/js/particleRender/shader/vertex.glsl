precision mediump float;
// 告诉gpu以什么程度的标准进行精度的计算
// lowp 低精度 -2^8 - 2^8
// mediump 中精度 -2^10 - 2^10
// highp 高精度 -2^16 - 2^16

void main() {
  vec4 resultPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * resultPosition;

  gl_PointSize = 30.0;
}
