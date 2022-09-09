precision mediump float;
// 告诉gpu以什么程度的标准进行精度的计算
// lowp 低精度 -2^8 - 2^8
// mediump 中精度 -2^10 - 2^10
// highp 高精度 -2^16 - 2^16

attribute int imgIndex;

varying vec2 vUv;
varying float vImgIndex;

void main() {
  vUv = uv;
  vImgIndex = float(imgIndex);
  /*
    把物体放到世界坐标系中，物体就可以实现旋转、位移、放大缩小的操作
    确定了视点、观察点坐标和上方向（即经过视图矩阵的变换），就可以确定人眼看到物体时的样子
    经过投影矩阵的变化，可以把人眼观察到的三维物体转换到二维平面上，这样就可以显示在屏幕上
  */
  // sourcePosition 是顶点初始的位置
  vec4 sourcePosition = vec4(position, 1.0);
  // modelPosition 是经过 模型矩阵 的变换之后，在世界坐标系中的位置
  vec4 modelPosition = modelMatrix * sourcePosition;
  // viewPosition 是经过 视图矩阵 转换之后，在视图坐标系中的位置
  vec4 viewPosition = viewMatrix * modelPosition;
  // 最后经过投影矩阵的转换，才会显示到二维平面上
  gl_Position = projectionMatrix * viewPosition;

  // 根据物体距离摄像机的位置，控制渲染的大小
  gl_PointSize = 40.0 / -viewPosition.z * 30.0;
}
