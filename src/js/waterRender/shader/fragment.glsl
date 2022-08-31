precision mediump float;

#define PI 3.14159265359

varying float vDepth;

void main() {
  gl_FragColor = vec4(1.0 * vDepth, 1.0 * vDepth, 0.0, 1.0);
}
