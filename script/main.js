const canvas = Canvas();
const geometry = Geometry();

const load = async () => {
  const v_source = fetch('/shaders/vertex.glsl');
  const f_source = fetch('/shaders/fragment.glsl');
  const mesh = fetch('/scene/skull.json');

  const response = await Promise.all([v_source, f_source, mesh]);
  const result = await Promise.all(response.map(v => v.text()));

  return {
    v_source: result[0],
    f_source: result[1],
    mesh: result[2]
  };
};

const init = async () => {
  const gl = canvas.gl('webhf');
  const loaded = await load();
  const mesh = JSON.parse(loaded.mesh);

  canvas.makeProgram(gl, loaded.v_source, loaded.f_source);

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  const a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  const u_Transform = gl.getUniformLocation(gl.program, 'u_Transform');

  const vertices = [];

  for (let i = 0; i < mesh.positions.length; i += 3) {
    vertices.push(mesh.positions[i]);
    vertices.push(mesh.positions[i + 1]);
    vertices.push(mesh.positions[i + 2]);

    vertices.push(mesh.normals[i]);
    vertices.push(mesh.normals[i + 1]);
    vertices.push(mesh.normals[i + 2]);
  }

  const zoom = 200;

  const width = 1024 / zoom;
  const height = 768 / zoom;

  let rotation = [Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0, 0];

  let taken = null;


  document.addEventListener('mousedown', event => {
    taken = { x: event.clientX, y: event.clientY };
  });

  document.addEventListener('mousemove', event => {
    if ( ! taken) return;

    const x = (taken.x - event.clientX) / (window.innerWidth / 3);
    const y = (event.clientY - taken.y) / (window.innerHeight / 3);

    const q1 = geometry.create_quat([0, 1, 0], x);
    const q2 = geometry.create_quat([1, 0, 0], y);

    const turn = geometry.quaternion_cross(q1, q2);

    rotation = geometry.quaternion_cross(turn, rotation);

    taken.x = event.clientX;
    taken.y = event.clientY;
  });


  // let origin = null;

  // const vector_by_event = event => {
  //   const width = window.innerWidth;
  //   const height = window.innerHeight;

  //   const diameter = Math.max(width, height) * 0.8;
  //   const r = diameter / 2;

  //   const x = event.clientX - width / 2;
  //   const y = event.clientY - height / 2;

  //   const l = Math.min(Math.sqrt(x * x + y * y), r);
  //   const z = Math.sqrt(r * r - l * l);

  //   return geometry.normalize([x, y, -z]);
  // };

  // document.addEventListener('mousedown', event => {
  //   taken = vector_by_event(event);
  //   origin = Object.values(rotation);
  // });

  // document.addEventListener('mousemove', event => {
  //   if ( ! taken) return;

  //   const next = vector_by_event(event);
  //   const angle = Math.acos(geometry.vec3dot(taken, next));
  //   const cross = geometry.vec3cross(taken, next);
  //   const turn = geometry.create_quat(cross, angle);

  //   rotation = geometry.quaternion_cross(turn, origin);
  // });

  document.addEventListener('mouseup', () => taken = null);



  // const test = () => {
  //   const q = geometry.create_quat([0, Math.sqrt(2) / 2, Math.sqrt(2) / 2], 0.02);

  //   rotation = geometry.quaternion_cross(q, rotation);

  //   setTimeout(test, 10);
  // };
  // test();


  const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let transform =
      geometry.set_rotation(rotation);

    transform = geometry.translate(transform, width / 2, height / 2);

    transform =
      geometry.projection(transform, width, height, Math.max(width, height));

    transform = geometry.perspective(transform);

    const indices_buffer = gl.createBuffer();
    const vertices_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(mesh.indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertices_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 6 * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
    gl.enableVertexAttribArray(a_Normal);

    gl.uniformMatrix4fv(u_Transform, false, transform);

    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
  };

  render();
};

document.addEventListener('DOMContentLoaded', init);
