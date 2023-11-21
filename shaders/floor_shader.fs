precision mediump float;

varying vec2 fragTexCoord;
uniform sampler2D floorTexture;


void main()
{
    gl_FragColor = texture2D(floorTexture, fragTexCoord);
}