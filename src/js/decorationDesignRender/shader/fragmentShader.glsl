precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uDirection;
uniform vec3 uColor;
uniform vec3 uAmbientLightColor;
uniform float uCardSize;
uniform vec3 uLightColor;
uniform vec3 uLightPosition;
uniform vec3 uClickPoint;
uniform vec3 uClickPointUV;
uniform vec3 uClickNormal;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vNormalPosition;

// 获取一个方形的区域
bool getCardSize(const in vec3 geoPosition, const in vec3 geoNormal) {
  if (abs(geoNormal.y) > 0.0) return false;

  vec3 geoVec = geoPosition - uClickPoint;
  float geoLength = length(geoVec);

  vec3 xAxesVec = normalize(vec3(-1.0 / geoNormal.x, 0.0, 1.0 / geoNormal.z));
  vec3 yAxesVec = vec3(0.0, 1.0, 0.0);

  float angleCos = dot(normalize(geoVec), xAxesVec);
  float angleSin = sqrt(1.0 - pow(angleCos, 2.0));

  if (
    abs(geoLength * angleCos) <= uCardSize / 2.0
    && abs(geoLength * angleSin) <= uCardSize / 2.0
  ) return true;
  return false;
}

void main() {

  vec3 normalF = normalize(vNormal);
  vec3 realColor = vec3(1.0, 1.0, 1.0);
  realColor = uColor;
  vec3 realDirection = normalize(uLightPosition - vNormalPosition);
  float dotL = dot(realDirection, normalF);
  // 计算反射后的颜色，光线颜色 * 物体颜色
  vec3 resLightColor = uLightColor * realColor * dotL;
  vec3 resAmbientColor = realColor * uAmbientLightColor;
  // 检测当前的法向量和传入的点击位置的法向量是否平行
  if (
    // 已经传入了点击位置的面的法向量
    (abs(uClickNormal.x) + abs(uClickNormal.y) + abs(uClickNormal.z) > 0.0)
    && (dot(normalize(vNormal), uClickNormal) >= 0.9945218953)
    // 在点击位置制作一个cardSize大小的卡片渲染区域
    && getCardSize(vPosition, vNormal)
  ) {
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    // gl_FragColor = vec4(vec3(1.0, 0.0, 1.0) * (resLightColor + resAmbientColor), 1.0);
  } else {
    gl_FragColor = vec4(realColor * (resLightColor + resAmbientColor), 1.0);
  }
}
