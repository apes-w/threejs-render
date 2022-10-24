precision mediump float;

// attribute vec3 normal;

varying vec3 vNormal;
varying vec3 vPosition;
// 配合光线，实现渐变的效果
varying vec3 vNormalPosition;

void main() {

  vNormal = normal;
  // 在移动相机视角的时候，物体本身的颜色会随着相机的视角发生变化
  // vNormal = normalMatrix * normal;

  vec4 sourcePosition = vec4(position, 1.0);
  vec4 modelPosition = modelMatrix * sourcePosition;
  vPosition = modelPosition.xyz;
  vNormalPosition = normalMatrix * modelPosition.xyz;
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
