precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uGeometrySize;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  /*
    gl_FragCoord
      是根据绘制图形时，使用的canvas标签的大小位置进行设置的
      我当前将绘制threejs使用的canvas所占的大小为整个浏览器整个界面大小
      之后应该可以根据这个实现一个分屏的操作
  */
  // if (gl_FragCoord.x < 850.0) {
  //   gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
  // } else {
  //   gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  // }
  /*
    顺次排列下来
    x轴的正负方向使用1,4图片
    y轴的正负方向使用2,5图片
    z轴的正负方向使用3,6图片
  */
  float critical = 0.998629534;
  float singleX = 1.0 / 3.0;
  vec2 texUV = vec2(0.0, 0.0);
  vec2 positionUV = vec2(0.0, 0.0);
  float xDot = dot(vNormal, vec3(1.0, 0.0, 0.0));
  float yDot = dot(vNormal, vec3(0.0, 1.0, 0.0));
  float zDot = dot(vNormal, vec3(0.0, 0.0, 1.0));
  if (xDot > critical) {
    // x轴正方向
    positionUV = vec2(
      (vPosition.y + uGeometrySize.y / 2.0) / uGeometrySize.y,
      (vPosition.z + uGeometrySize.z / 2.0) / uGeometrySize.z
    );
    texUV = vec2(
      singleX * positionUV.x,
      0.5 * positionUV.y
    );
  } else if (xDot < -critical) {
    // x轴负方向
    positionUV = vec2(
      (vPosition.y + uGeometrySize.y / 2.0) / uGeometrySize.y,
      (vPosition.z + uGeometrySize.z / 2.0) / uGeometrySize.z
    );
    texUV = vec2(
      singleX * positionUV.x,
      0.5 * positionUV.y + 0.5
    );
  } else if (yDot > critical) {
    // y轴正方向
    positionUV = vec2(
      (vPosition.x + uGeometrySize.x / 2.0) / uGeometrySize.x,
      (vPosition.z + uGeometrySize.z / 2.0) / uGeometrySize.z
    );
    texUV = vec2(
      singleX * positionUV.x + singleX,
      0.5 * positionUV.y
    );
  } else if (yDot < -critical) {
    // y轴负方向
    positionUV = vec2(
      (vPosition.x + uGeometrySize.x / 2.0) / uGeometrySize.x,
      (vPosition.z + uGeometrySize.z / 2.0) / uGeometrySize.z
    );
    texUV = vec2(
      singleX * positionUV.x + singleX,
      0.5 * positionUV.y + 0.5
    );
  } else if (zDot > critical) {
    // z轴正方向
    positionUV = vec2(
      (vPosition.x + uGeometrySize.x / 2.0) / uGeometrySize.x,
      (vPosition.y + uGeometrySize.y / 2.0) / uGeometrySize.y
    );
    texUV = vec2(
      singleX * positionUV.x + singleX * 2.0,
      0.5 * positionUV.y
    );
  } else if (zDot < -critical) {
    // z轴负方向
    positionUV = vec2(
      (vPosition.x + uGeometrySize.x / 2.0) / uGeometrySize.x,
      (vPosition.y + uGeometrySize.y / 2.0) / uGeometrySize.y
    );
    texUV = vec2(
      singleX * positionUV.x + singleX * 2.0,
      0.5 * positionUV.y + 0.5
    );
  }
  gl_FragColor = texture2D(uTexture, texUV);
  // gl_FragColor = vec4(vNormal, 1.0);
}
