precision mediump float;
// 告诉gpu以什么程度的标准进行精度的计算
// lowp 低精度 -2^8 - 2^8
// mediump 中精度 -2^10 - 2^10
// highp 高精度 -2^16 - 2^16

uniform float uWaveFrequency;
uniform float uScale;

void main() {
  /*
    投影矩阵 * 视图矩阵 * 模型矩阵 * 顶点坐标
    最后得到的结果才是渲染在界面上的效果
    矩阵相乘的顺序不能发生变化
    本地坐标系 -> 经过模型矩阵变换 -> 世界坐标系 -> 经过视图矩阵变换 -> 视图坐标系 -> 经过投影矩阵变换 -> 裁剪（投影）坐标系
  */
  // resultPosition 世界坐标系，可以再这个坐标系下执行缩放、移动、旋转等操作
  vec4 resultPosition = modelMatrix * vec4(position, 1.0);
  // 先设置波浪的效果
  float fHeight = sin(resultPosition.x * uWaveFrequency) * sin(resultPosition.z * uWaveFrequency);
  fHeight *= uScale;
  resultPosition.y += fHeight;
  gl_Position = projectionMatrix * viewMatrix * resultPosition;
}
