precision mediump float;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec4 sourcePosition = vec4(position, 1.0);
  vec4 modelPosition = modelMatrix * sourcePosition;
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  vUv = uv;
  vPosition = sourcePosition.xyz;
}
