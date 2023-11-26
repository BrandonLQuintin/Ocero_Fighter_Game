precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;

uniform mat4 mProj;
uniform mat4 modelViewMatrix;

varying vec2 fragTexCoord;

void main()
{
  fragTexCoord = vertTexCoord;
  vec4 billboardPosition = modelViewMatrix * vec4(vertPosition, 1.0);
  gl_Position = mProj * billboardPosition;
}