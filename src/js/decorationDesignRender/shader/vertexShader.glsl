precision mediump float;

// attribute vec3 normal;

varying vec3 vNormal;

void main() {

  vNormal = normal;
  // 在移动相机视角的时候，物体本身的颜色会随着相机的视角发生变化
  // vNormal = normalMatrix * normal;

  vec4 sourcePosition = vec4(position, 1.0);
  vec4 modelPosition = modelMatrix * sourcePosition;
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
