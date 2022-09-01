precision mediump float;

#define PI 3.14159265359

uniform float uOpacity;

varying float vDepth;

void main() {
  gl_FragColor = vec4(1.0 * vDepth, 1.0 * vDepth, 0.0, uOpacity);
}
