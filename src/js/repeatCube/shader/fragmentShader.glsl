precision mediump float;

uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  /*
    gl_FragCoord
      是根据绘制图形时，使用的canvas标签的大小位置进行设置的
      我当前将绘制threejs使用的canvas所占的大小为整个浏览器整个界面大小
      之后应该可以根据这个实现一个分屏的操作
  */
  if (gl_FragCoord.x < 850.0) {
    gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
  } else {
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  }

  // vec4 texColor = texture2D(uTexture, gl_FragCoord);
  // gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
  // gl_FragColor = texColor;
}
