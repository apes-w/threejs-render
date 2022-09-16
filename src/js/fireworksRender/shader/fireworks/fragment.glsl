precision mediump float;

uniform sampler2D uTexture;

varying vec3 vColor;

void main() {
  // vec4 textureColor = texture2D(uTexture, gl_PointCoord);
  // gl_FragColor = vec4(textureColor.rgb, textureColor.r);

  vec4 textureColor = texture2D(uTexture, gl_PointCoord);
  float depth = (0.5 - distance(gl_PointCoord, vec2(0.5))) * 2.0;
  vec3 color = mix(textureColor.rgb, vColor, depth);
  gl_FragColor = vec4(color, textureColor.r);
}
