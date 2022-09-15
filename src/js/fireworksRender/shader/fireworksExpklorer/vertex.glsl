
void main() {
  vec4 sourcePosition = vec4(sourcePosition, 1.0);
  vec4 modelPosition = modelMatrix * sourcePosition;
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Posiiton = projectionMatrix * viewPosition;
}
