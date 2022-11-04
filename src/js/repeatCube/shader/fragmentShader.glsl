precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uGeometrySize;
uniform float repeatNum;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// 获取重复之后的点的坐标
vec2 getScalePos(const in vec2 pos, const in vec2 maxSize) {
  float x = pos.x;
  float y = pos.y;
  if (repeatNum <= 1.0) return vec2(x, y);

  float diffX = pos.x - (-maxSize.x / 2.0);
  float splitXVal = maxSize.x / repeatNum;
  float scaleX = mod(diffX, splitXVal);
  x = (-maxSize.x / 2.0) + (scaleX / splitXVal * maxSize.x);

  float diffY = pos.y - (-maxSize.y / 2.0);
  float splitYVal = maxSize.y / repeatNum;
  float scaleY = mod(diffY, splitYVal);
  y = (-maxSize.y / 2.0) + (scaleY / splitYVal * maxSize.y);

  return vec2(x, y);
}

// 根据当前点的坐标，得到每一个位置对应的纹理
vec2 getNewPos(const in vec2 pos, const in vec2 maxSize) {
  float sqrtRes = 1.0 / sqrt(2.0);
  float x = 0.0;
  float y = 0.0;
  float posLength = length(pos);
  float posCos = pos.x / posLength;
  float posSin = pos.y / posLength;

  // 先实现旋转
  x = (posLength / sqrtRes) * (posCos * cos(PI / 4.0) - posSin * sin(PI / 4.0));
  y = (posLength / sqrtRes) * (posSin * cos(PI / 4.0) + posCos * sin(PI / 4.0));

  // 重复
  if (abs(x) > maxSize.x / 2.0) {
    // 该点位已经超过范围，需要重复
    if (x < 0.0) {
      x += maxSize.x;
    } else {
      x -= maxSize.x;
    }
  } else if (abs(y) > maxSize.y / 2.0) {
    // 该点位已经超过范围，需要重复
    if (y < 0.0) {
      y += maxSize.y;
    } else {
      y -= maxSize.y;
    }
  }

  return vec2(x, y);
}

vec2 getNewPositionUV(const in vec2 posVec, const in vec2 sizeVec) {
  return vec2(
    (posVec.x + sizeVec.x / 2.0) / sizeVec.x,
    (posVec.y + sizeVec.y / 2.0) / sizeVec.y
  );
}

vec2 getTexUV(const in vec2 posUV, const in vec2 location) {
  float singleX = 1.0 / 3.0;
  float singleY = 1.0 / 2.0;
  return vec2(
    singleX * posUV.x + location.x * singleX,
    0.5 * posUV.y + location.y * singleY
  );
}

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

  // 直接修改点位坐标，根据旋转之后的点位坐标进行计算映射的UV坐标
  if (xDot > critical) {
    // x轴正方向
    // 把切分之后的局部坐标，根据比例，拓展到整个面上
    vec2 scalePosVec = getScalePos(vPosition.yz, uGeometrySize.yz);
    vec2 newPosVec = getNewPos(scalePosVec, uGeometrySize.yz);
    positionUV = getNewPositionUV(newPosVec, uGeometrySize.yz);
    texUV =  getTexUV(positionUV, vec2(0.0, 0.0));
  } else if (xDot < -critical) {
    // x轴负方向
    vec2 scalePosVec = getScalePos(vPosition.yz, uGeometrySize.yz);
    vec2 newPosVec = getNewPos(scalePosVec, uGeometrySize.yz);
    positionUV = getNewPositionUV(newPosVec, uGeometrySize.yz);
    texUV = getTexUV(positionUV, vec2(0.0, 1.0));
  } else if (yDot > critical) {
    // y轴正方向
    vec2 scalePosVec = getScalePos(vPosition.xz, uGeometrySize.xz);
    vec2 newPosVec = getNewPos(scalePosVec, uGeometrySize.xz);
    positionUV = getNewPositionUV(newPosVec, uGeometrySize.xz);
    texUV = getTexUV(positionUV, vec2(1.0, 0.0));
  } else if (yDot < -critical) {
    // y轴负方向
    vec2 scalePosVec = getScalePos(vPosition.xz, uGeometrySize.xz);
    vec2 newPosVec = getNewPos(scalePosVec, uGeometrySize.xz);
    positionUV = getNewPositionUV(newPosVec, uGeometrySize.xz);
    texUV = getTexUV(positionUV, vec2(1.0, 1.0));
  } else if (zDot > critical) {
    // z轴正方向
    vec2 scalePosVec = getScalePos(vPosition.xy, uGeometrySize.xy);
    vec2 newPosVec = getNewPos(scalePosVec, uGeometrySize.xy);
    positionUV = getNewPositionUV(newPosVec, uGeometrySize.xy);
    texUV = getTexUV(positionUV, vec2(2.0, 0.0));
  } else if (zDot < -critical) {
    // z轴负方向
    vec2 scalePosVec = getScalePos(vPosition.xy, uGeometrySize.xy);
    vec2 newPosVec = getNewPos(scalePosVec, uGeometrySize.xy);
    positionUV = getNewPositionUV(newPosVec, uGeometrySize.xy);
    texUV = getTexUV(positionUV, vec2(2.0, 1.0));
  }
  gl_FragColor = texture2D(uTexture, texUV);
}
