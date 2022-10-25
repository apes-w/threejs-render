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


void main() {

  vec3 normalF = normalize(vNormal);
  vec3 realColor = vec3(1.0, 1.0, 1.0);
  realColor = uColor;
  vec3 realDirection = normalize(uLightPosition - vNormalPosition);
  float dotL = dot(realDirection, normalF);
  // 计算反射后的颜色，光线颜色 * 物体颜色
  vec3 resLightColor = uLightColor * realColor * dotL;
  vec3 resAmbientColor = realColor * uAmbientLightColor;

  vec3 geoVec = vPosition - uClickPoint;
  float geoVecLength = length(geoVec);

  vec3 xAxesVec = normalize(vec3(-1.0 / vNormal.x, 0.0, 1.0 / vNormal.z));
  float angleCos = dot(normalize(geoVec), xAxesVec);
  float angleSin = sqrt(1.0 - pow(angleCos, 2.0));
  float geoVecXLength = abs(geoVecLength * angleCos);
  float geoVecYLength = abs(geoVecLength * angleSin);

  // 检测当前的法向量和传入的点击位置的法向量是否平行
  if (
    // 已经传入了点击位置的面的法向量
    (abs(uClickNormal.x) + abs(uClickNormal.y) + abs(uClickNormal.z) > 0.0)
    && (dot(normalize(vNormal), uClickNormal) >= 0.9945218953)
    // 在点击位置制作一个cardSize大小的卡片渲染区域
    && vNormal.y <= 0.0
    && (
      geoVecXLength <= uCardSize / 2.0
      && geoVecYLength <= uCardSize / 2.0
    )
  ) {
    float xUV = 0.0, yUV = 0.0;
    if (geoVec.x < 0.0) {
      xUV = uCardSize / 2.0 - geoVecXLength;
    } else {
      xUV = uCardSize / 2.0 + geoVecXLength;
    }
    if (geoVec.y < 0.0) {
      yUV = uCardSize / 2.0 - geoVecYLength;
    } else {
      yUV = uCardSize / 2.0 + geoVecYLength;
    }
    vec2 colorUV = vec2(xUV / uCardSize, yUV / uCardSize);
    gl_FragColor = texture2D(uTexture, colorUV);
    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    // gl_FragColor = vec4(geoVec, 1.0);
    // gl_FragColor = vec4(vec3(1.0, 0.0, 1.0) * (resLightColor + resAmbientColor), 1.0);
  } else {
    gl_FragColor = vec4(realColor * (resLightColor + resAmbientColor), 1.0);
  }
}
