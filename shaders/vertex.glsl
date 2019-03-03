attribute vec4 a_Position;
attribute vec4 a_Normal;

uniform mat4 u_Transform;

varying vec3 v_Normal;

void main()
{
	v_Normal = (a_Normal * u_Transform).xyz;
	v_Normal = normalize(v_Normal);

	gl_Position = a_Position * u_Transform;
}
