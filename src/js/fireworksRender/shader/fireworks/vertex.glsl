precision mediump float;

attribute float aLength;
attribute float aDirectionX;
attribute float aDirectionY;
attribute vec3 aColor;

varying vec3 vColor;

void main() {
  vColor = aColor;
  vec4 sourcePosition = vec4(position, 1.0);
  vec4 modelPosition = modelMatrix * sourcePosition;

  // float moveLength = aLength * 130.0;
  // modelPosition.xyz += aDirection * aLength * 10.0;
  float xozLength = cos(aDirectionY) * aLength;
  modelPosition.x = sourcePosition.x + cos(aDirectionX) * xozLength;
  modelPosition.y = sourcePosition.y + sin(aDirectionY) * aLength;
  modelPosition.z = sourcePosition.z + sin(aDirectionX) * xozLength;

  vec4 viewPosition = viewMatrix * modelPosition;

  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = 14.0;
}
