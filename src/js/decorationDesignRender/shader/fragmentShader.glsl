precision mediump float;

uniform vec3 uDirection;
uniform vec3 uColor;
uniform vec3 uLightColor;
uniform vec3 uLightPosition;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {

  vec3 normalF = normalize(vNormal);
  vec3 realDirection = normalize(uLightPosition - vPosition);
  // float dotL = dot(uDirection, normalF);
  float dotL = dot(realDirection, normalF);
  // 计算反射后的颜色，光线颜色 * 物体颜色
  vec3 resultColor = uLightColor * uColor * dotL;
  gl_FragColor = vec4(resultColor, 1.0);

  // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
