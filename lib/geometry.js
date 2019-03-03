const Geometry = function() {
  const mul = (mat1, mat2) => {
    const result = [];

    for (let i = 0; i < 16; i += 4)
      for (let j = 0; j < 4; j++)
        result.push(
          mat1[j     ] * mat2[i    ] +
          mat1[j + 4 ] * mat2[i + 1] +
          mat1[j + 8 ] * mat2[i + 2] +
          mat1[j + 12] * mat2[i + 3]
        );

    return result;
  };

  const vec_lenght = v => Math.sqrt(v.reduce((a, b) => a + b * b, 0));

  const normalize = v => {
    const lenght = vec_lenght(v);

    return v.map(e => e / lenght);
  };

  const vec3dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];

  const vec3cross = (v1, v2) => {
    return [
        (v1[1] * v2[2] - v1[2] * v2[1]),
        (v1[2] * v2[0] - v1[0] * v2[2]),
        (v1[0] * v2[1] - v1[1] * v2[0])
    ];
  };

  const create_quat = (vec, angle) => {
    return [
      Math.cos(angle / 2),
      vec[0] * Math.sin(angle / 2),
      vec[1] * Math.sin(angle / 2),
      vec[2] * Math.sin(angle / 2)
    ];
  };

  const quaternion_cross = (q1, q2) => {
    const v1 = [q1[1], q1[2], q1[3]];
    const v2 = [q2[1], q2[2], q2[3]];
    const w1 = q1[0];
    const w2 = q2[0];

    const c1 = vec3cross(v1, v2);
    const c2 = v2.map(value => value * w1);
    const c3 = v1.map(value => value * w2);

    const w_result = w1 * w2 - vec3dot(v1, v2);

    return [
        w_result,
        c1[0] + c2[0] + c3[0], 
        c1[1] + c2[1] + c3[1], 
        c1[2] + c2[2] + c3[2]
    ];
  };

  const norm = q => q.reduce((a, b) => a + b * b, 0);

  const set_rotation = q => {
    const s = 2 / norm(q);

    const x2 = q[1] * s;
    const y2 = q[2] * s;
    const z2 = q[3] * s;

    const xx = x2 * q[1];
    const xy = y2 * q[1];
    const xz = z2 * q[1];

    const yy = y2 * q[2];
    const yz = z2 * q[2];

    const zz = z2 * q[3];

    const wx = x2 * q[0];
    const wy = y2 * q[0];
    const wz = z2 * q[0];

    return [
      1 - (yy + zz), xy - wz, xz + wy, 0,
      xy + wz, 1 - (xx + zz), yz - wx, 0,
      xz - wy, yz + wx, 1 - (xx + yy), 0,
      0, 0, 0, 1
    ];
  };

  const translate = (m, x, y) => {
    const t = [
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];

    return mul(m, t);
  };

  const projection = (m, width, height, depth) => {
    const p = [
          2 / width, 0,          0,        -1,
          0,        -2 / height, 0,         1,
          0,         0,          2 / depth, 0,
          0,         0,          0,         1
    ];

    return mul(m, p);
  };

  const perspective = m => {
    const p = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0.75, 1
    ];

    return mul(m, p);
  };

  return {
    normalize,
    vec3dot,
    vec3cross,
    create_quat,
    quaternion_cross,
    set_rotation,
    translate,
    projection,
    perspective
  };
};
