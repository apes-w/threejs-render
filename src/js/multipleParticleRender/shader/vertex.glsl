precision mediump float;

uniform float uMaxAreaX;
uniform float uMaxAreaY;
uniform vec2 uAreaSize;

void main() {
  vec4 sourcePosition = vec4(position, 1.0);
  vec4 modelPosition = modelMatrix * sourcePosition;

  // float scale = 0.0;
  // scale = modelPosition.x / uMaxAreaX;
  // modelPosition.x = uAreaSize.x / 2.0 * scale;
  // scale = modelPosition.y / uMaxAreaY;
  // modelPosition.y = uAreaSize.y / 2.0 * scale;

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = 4.0;
}
