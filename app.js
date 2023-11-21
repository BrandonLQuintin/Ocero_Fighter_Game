// Initial Starter Code from YouTuber Indigo Code's 5th WebGL Tutorial
// https://www.youtube.com/watch?v=33gn3_khXxw

var gl;
var model;

var InitDemo = function () {
	loadTextResource('shaders/main_shader.vs', function (vsErr, vsText) {
		if (vsErr) {
			alert('Fatal error getting vertex shader (see console)');
			console.error(vsErr);
		} else {
			loadTextResource('shaders/main_shader.fs', function (fsErr, fsText) {
				if (fsErr) {
					alert('Fatal error getting fragment shader (see console)');
					console.error(fsErr);
				} else {
					loadTextResource('shaders/floor_shader.vs', function (floorVsErr, floorVsText) {
						if (floorVsErr) {
							alert('Fatal error getting floor vertex shader (see console)');
							console.error(floorVsErr);
						} else {
							loadTextResource('shaders/floor_shader.fs', function (floorFsErr, floorFsText) {
								if (floorFsErr) {
									alert('Fatal error getting floor fragment shader (see console)');
									console.error(floorFsErr);
								} else {
									loadJSONResource('resources/Susan.json', function (modelErr, modelObj) {
										if (modelErr) {
											alert('Fatal error getting Susan model (see console)');
											console.error(fsErr);
										} else {
											loadImage('resources/SusanTexture.png', function (imgErr, img) {
												if (imgErr) {
													alert('Fatal error getting Susan texture (see console)');
													console.error(imgErr);
												} else { 
													RunDemo(vsText, fsText, floorVsText, floorFsText, img, modelObj);
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
};

var RunDemo = function (vertexShaderText, fragmentShaderText, floorVertexShaderText, floorFragmentShaderText,  SusanImage, SusanModel) {
	console.log('This is working');
	model = SusanModel;

	var canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl');
    model = SusanModel;

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// ------------- Create shaders -------------
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var floorVertexShader = gl.createShader(gl.VERTEX_SHADER);
	var floorFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);
	gl.shaderSource(floorVertexShader, floorVertexShaderText);
	gl.shaderSource(floorFragmentShader, floorFragmentShaderText);

	compileShader('vertex', vertexShader);
	compileShader('fragment', fragmentShader);
	compileShader('vertex', floorVertexShader);
	compileShader('fragment', floorFragmentShader);

	var mainShaderProgram = gl.createProgram();
	gl.attachShader(mainShaderProgram, vertexShader);
	gl.attachShader(mainShaderProgram, fragmentShader);
	linkProgram(mainShaderProgram);

	var floorShaderProgram = gl.createProgram();
	gl.attachShader(floorShaderProgram, floorVertexShader);
	gl.attachShader(floorShaderProgram, floorFragmentShader);
	linkProgram(floorShaderProgram);

	// Create buffer
	var susanVertices = SusanModel.meshes[0].vertices;
	var susanIndices = [].concat.apply([], SusanModel.meshes[0].faces);
	var susanTexCoords = SusanModel.meshes[0].texturecoords[0];
	var susanNormals = SusanModel.meshes[0].normals;


	var floorVertices = [
		-5.0, 0.0, -5.0,
		5.0, 0.0, -5.0,
		5.0, 0.0, 5.0,
		-5.0, 0.0, 5.0,
	];
	
	var floorIndices = [0, 1, 2, 0, 2, 3];
	
	var floorTexCoords = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];

	var susanPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW);

	var susanTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTexCoords), gl.STATIC_DRAW);

	var susanIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), gl.STATIC_DRAW);

	var susanNormalBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanNormals), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
	var positionAttribLocation = gl.getAttribLocation(mainShaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
	var texCoordAttribLocation = gl.getAttribLocation(mainShaderProgram, 'vertTexCoord');
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0
	);
	gl.enableVertexAttribArray(texCoordAttribLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalBufferObject);
	var normalAttribLocation = gl.getAttribLocation(mainShaderProgram, 'vertNormal');
	gl.vertexAttribPointer(
		normalAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.TRUE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0
	);
	gl.enableVertexAttribArray(normalAttribLocation);



	// ------------- Create texture -------------
	var susanTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, susanTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		SusanImage
	);
	gl.bindTexture(gl.TEXTURE_2D, null);

	var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        document.getElementById('crate-image')
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(mainShaderProgram);

	var floorMatWorldUniformLocation = gl.getUniformLocation(floorShaderProgram, 'mWorld');
	var matWorldUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mProj');


	

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

	gl.uniformMatrix4fv(floorMatWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	var objects = [
		{ worldMatrix: mat4.create(), coord: [0.0, 0.0, 0.0], type: 'susan' },
		{ worldMatrix: mat4.create(), coord: [-3.0, -3.0, 5.0], type: 'susan' },
		{ worldMatrix: mat4.create(), coord: [3.0, -3.0, 5.0], type: 'floor' },
		{ worldMatrix: mat4.create(), coord: [0.0, -1.0, 0.0], type: 'floor' }
	];


	// ------------- Lighting information -------------
	gl.useProgram(mainShaderProgram);
	var ambientUniformLocation = gl.getUniformLocation(mainShaderProgram, 'ambientLightIntensity');
	var sunlightDirUniformLocation = gl.getUniformLocation(mainShaderProgram, 'sunlightDirection');
	var sunlightIntUniformLocation = gl.getUniformLocation(mainShaderProgram, 'sunlightIntensity');

	gl.uniform3f(ambientUniformLocation, 0.2, 0.2, 0.2);
	gl.uniform3f(sunlightDirUniformLocation, 3.0, 4.0, -2.0);
	gl.uniform3f(sunlightIntUniformLocation, 0.9, 0.9, 0.9);


	// ------------- Main loop -------------

	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		gl.clearColor(0.75, 0.85, 0.8, 1.0);
    	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    	angle = performance.now() / 1000 / 6 * 2 * Math.PI;

		index = 0;
    	// Render objects
		for (obj of objects){
			index += 1;
			if (index == 1){ // susan
				mat4.identity(obj.worldMatrix);
				mat4.rotate(yRotationMatrix, obj.worldMatrix, angle, [0, 1, 0]);
				mat4.rotate(xRotationMatrix, obj.worldMatrix, angle / 4, [1, 0, 0]);
				mat4.mul(obj.worldMatrix, yRotationMatrix, xRotationMatrix);


				gl.useProgram(mainShaderProgram);
    	    	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, obj.worldMatrix);
    	    	gl.bindTexture(gl.TEXTURE_2D, susanTexture);
    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);
			}
			else if (index == 2){ // susan
				obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z

				gl.useProgram(mainShaderProgram);
    	    	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, obj.worldMatrix);
    	    	gl.bindTexture(gl.TEXTURE_2D, susanTexture);
    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);
			}
			else if (index == 3) { // susan
                obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z

				gl.useProgram(mainShaderProgram);
    	    	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, obj.worldMatrix);
    	    	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);
            }
			else if (index == 4) { // floor
				console.log("floor")
                obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z

				gl.useProgram(floorShaderProgram);
    	    	gl.uniformMatrix4fv(floorMatWorldUniformLocation, gl.FALSE, obj.worldMatrix);
    	    	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, floorIndices.length, gl.UNSIGNED_SHORT, 0);
            }


    	    
		}

		index = 0;

    	requestAnimationFrame(loop);

		};


	requestAnimationFrame(loop);
};

