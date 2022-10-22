precision mediump float;

uniform sampler2D uTexture;
uniform float uHorizontalOffset;

varying vec2 vUv;
varying vec3 vPosition;

vec4 color = vec4(0.0, 1.0, 1.0, 1.0);
vec4 color = vec4(1.0, 0.0, 1.0, 1.0);

void main() {
  // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);

  vec4 textureColor = texture2D(uTexture, vUv);
  if (vPosition.x > 0.0 + uHorizontalOffset) {
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  } else {
    gl_FragColor = textureColor;
  }
}
