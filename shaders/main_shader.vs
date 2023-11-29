precision mediump float;

attribute vec3 vertPosition;
attribute vec3 floorVertPosition;
attribute vec2 vertTexCoord;

uniform mat4 mProj;
uniform mat4 mView;
uniform mat4 mWorld;
uniform mat4 modelViewMatrix;
uniform bool is3D;

varying vec2 fragTexCoord;

void main()
{
  fragTexCoord = vertTexCoord;

  if (is3D == true){
    gl_Position = mProj * mView * mWorld * vec4(floorVertPosition, 1.0);
  }
  else{
    gl_Position = mProj * modelViewMatrix * vec4(vertPosition, 1.0);
  }
}