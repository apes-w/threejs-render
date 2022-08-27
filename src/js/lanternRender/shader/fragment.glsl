precision mediump float;

#define PI 3.14159265359

varying vec4 gPosition;
varying vec4 vPosition;

void main() {
  vec3 redColor = vec3(1.0, 0.0, 0.0);
  vec3 yellowColor = vec3(1.0, 1.0, 0.3);
  vec3 mixColor = mix(yellowColor, redColor, (gPosition.y - 0.2) / 3.0);
  gl_FragColor = vec4(mixColor, 1.0);
}
