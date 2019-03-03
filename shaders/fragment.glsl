precision mediump float;

varying vec3 v_Normal;

void main()
{
	float light = dot(v_Normal, vec3(0.0, 0.0, -1.0));

	vec3 color = vec3(1.0, 1.0, 0.9) * light;

	gl_FragColor = vec4(color, 1.0);
}
