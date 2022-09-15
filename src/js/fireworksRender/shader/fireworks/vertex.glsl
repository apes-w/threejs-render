precision mediump float;

attribute float aLength;
attribute float aDirectionX;
attribute float aDirectionY;

void main() {
  vec4 sourcePosition = vec4(position, 1.0);
  vec4 modelPosition = modelMatrix * sourcePosition;

  float moveLength = aLength * 10.0;
  // modelPosition.xyz += aDirection * aLength * 10.0;
  modelPosition.x = cos(aDirectionX) * moveLength;
  modelPosition.z = sin(aDirectionX) * moveLength;
  modelPosition.y = sin(aDirectionY) * moveLength;

  vec4 viewPosition = viewMatrix * modelPosition;

  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = 10.0;
}
