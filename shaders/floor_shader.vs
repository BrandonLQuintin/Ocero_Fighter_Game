precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;

varying vec2 fragTexCoord;

uniform mat4 mWorld; // world marix
uniform mat4 mView; // view matrix
uniform mat4 mProj; // projection matrix

void main()
{
    fragTexCoord = vertTexCoord;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0); // OPERATIONS HAPPEN RIGHT TO LEFT
}