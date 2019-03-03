const Canvas = function() {
  const resize = canvas => {
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;

    const canvasRatio = canvas.width / canvas.height;
    const clientRatio = clientWidth / clientHeight;

    if (canvasRatio > clientRatio) {
      canvas.style.width = '100%';
      canvas.style.height = clientWidth / canvasRatio + 'px';
    } else {
      canvas.style.width = 'auto';
      canvas.style.height = '100%';
    }
  };

  const gl = id => {
    const canvas = document.getElementById(id);

    window.addEventListener('resize', () => resize(canvas));
    resize(canvas);

    const gl = canvas.getContext('webgl');

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    return gl;
  };

  const makeProgram = (gl, vertexShaderText, fragmentShaderText) => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    if ( ! gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      const error_text = 'Vertex shader compile error:';
      console.error(error_text, gl.getShaderInfoLog(vertexShader));
      return;
    }

    if ( ! gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      const error_text = 'Fragment shader compile error:';
      console.error(error_text, gl.getShaderInfoLog(fragmentShader));
      return;
    }

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.validateProgram(program);

    if ( ! gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      const error_text = 'Error validating program:';
      console.error(error_text, gl.getProgramInfoLog(program));
      return;
    }

    gl.program = program;
    gl.useProgram(gl.program);
  };

  return {
    gl,
    makeProgram
  };
};
