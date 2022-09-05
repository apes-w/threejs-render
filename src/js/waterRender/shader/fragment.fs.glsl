precision mediump float;

#define PI 3.14159265359

uniform vec3 uHighColor;
uniform vec3 uLowerColor;
uniform float uOpacity;

varying float vDepth;

void main() {
  vec3 color = mix(uLowerColor, uHighColor, vDepth);
  gl_FragColor = vec4(color, uOpacity);
}
