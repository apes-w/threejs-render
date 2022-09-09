precision mediump float;

#define PI 3.14159265359

uniform sampler2D uTexture;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;

varying vec2 vUv;
varying float vImgIndex;

void main() {
  // 使用uv向量，实际效果为黑色方块
  // gl_FragColor = vec4(vUv, 0.0, 1.0);

  // gl_PointCoord 点渲染模式对应点像素坐标
  // gl_FragColor = vec4(vec2(gl_PointCoord), 0.0, 1.0);

  // // 渲染一个光点
  // float strength = distance(gl_PointCoord, vec2(0.5, 0.5));
  // strength *= 2.0;
  // strength = 1.0 - strength;
  // strength = step(strength, 0.4);
  // // 全部使用strength应该是可以的，但是效果并不明显
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // // 加载纹理
  // vec4 textureColor = texture2D(uTexture, gl_PointCoord);
  // // gl_FragColor = textureColor;
  // // 实现黑色的部分透明渲染
  // // 需要在threejs的material开启transparent
  // gl_FragColor = vec4(textureColor.rgb, textureColor.r);

  // 加载多个问题
  vec4 textureColor = texture2D(uTexture, gl_PointCoord);
  vec4 textureColor1 = texture2D(uTexture1, gl_PointCoord);
  vec4 textureColor2 = texture2D(uTexture2, gl_PointCoord);
  if (vImgIndex == 0.0) {
    gl_FragColor = vec4(textureColor.rgb, textureColor.r);
  } else if (vImgIndex == 1.0) {
    gl_FragColor = vec4(textureColor1.rgb, textureColor1.r);
  } else {
    gl_FragColor = vec4(textureColor2.rgb, textureColor2.r);
  }
}
