precision mediump float;

#define PI 3.14159265359

varying vec4 gPosition;
varying vec4 vPosition;

void main() {
  vec3 redColor = vec3(1.0, 0.0, 0.0);
  vec3 yellowColor = vec3(1.0, 1.0, 0.3);
  vec3 mixColor = mix(yellowColor, redColor, (gPosition.y - 0.2) / 3.0);

  /*
    判断物体的面的朝向
    这个值本身是一个bool，可以通过 true 和 false 来知道当前面试正面还是反面
  */
  if (gl_FrontFacing) {
    gl_FragColor = vec4(mixColor.xyz - (vPosition.y - 40.0) / 200.0, 1);
  } else {
    gl_FragColor = vec4(mixColor, 1.0);
  }
}
