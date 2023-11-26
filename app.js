// Initial Starter Code from YouTuber Indigo Code's 5th WebGL Tutorial
// https://www.youtube.com/watch?v=33gn3_khXxw
// https://github.com/sessamekesh/IndigoCS-webgl-tutorials/tree/432a3a36a30a9b3e6ca74373b955f771fbedd36a

// Handle key presses and releases
const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

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
									main(vsText, fsText, floorVsText, floorFsText);
								}
							});
						}
					});
				}
			});
		}
	});
};

var main = function (vertexShaderText, fragmentShaderText, floorVertexShaderText, floorFragmentShaderText) {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl');

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

	// Create buffer for billboard
	var billboardVertices = [
		// X, Y, Z            U, V
		-0.5, 0.5, 0.0,   1, 1, // top left
		-0.5, -0.5, 0.0,  1, 0, // bottom left
		0.5, -0.5, 0.0,   0, 0, // bottom right
		0.5, 0.5, 0.0,    0, 1 // top right
	];

	var billboardIndices = [
		3, 2, 1,
		3, 1, 0
	];

	var billboardVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(billboardVertices), gl.STATIC_DRAW);

	var billboardIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, billboardIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(billboardIndices), gl.STATIC_DRAW);

	// Setup attributes for "billboard"
	gl.useProgram(mainShaderProgram);

	var positionAttribLocationbillboard = gl.getAttribLocation(mainShaderProgram, 'vertPosition');
	gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
	gl.vertexAttribPointer(
	    positionAttribLocationbillboard,
	    3,
	    gl.FLOAT,
	    gl.FALSE,
	    5 * Float32Array.BYTES_PER_ELEMENT,
	    0
	);
	gl.enableVertexAttribArray(positionAttribLocationbillboard);

	var texCoordAttribLocationbillboard = gl.getAttribLocation(mainShaderProgram, 'vertTexCoord');
	gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
	gl.vertexAttribPointer(
	    texCoordAttribLocationbillboard,
	    2,
	    gl.FLOAT,
	    gl.FALSE,
	    5 * Float32Array.BYTES_PER_ELEMENT,
	    3 * Float32Array.BYTES_PER_ELEMENT
	);
	gl.enableVertexAttribArray(texCoordAttribLocationbillboard);


	var floorVertices =
	[ // X, Y, Z            U, V
		-1.0, -1.0, -1.0,   1, 1,
		-1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, 1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
	];
	
	var floorIndices =
	[
		0, 1, 2,
		0, 2, 3,
	];
	// Setup attributes for the floor
	/*
	gl.useProgram(floorShaderProgram);

	var floorVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertices), gl.STATIC_DRAW);

	var floorIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);

	var positionAttribLocationFloor = gl.getAttribLocation(floorShaderProgram, 'vertPositionFloor');
	var texCoordAttribLocationFloor = gl.getAttribLocation(floorShaderProgram, 'vertTexCoordFloor');
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexBufferObject);
	gl.vertexAttribPointer(
	    positionAttribLocationFloor,
	    3,
	    gl.FLOAT,
	    gl.FALSE,
	    5 * Float32Array.BYTES_PER_ELEMENT,
	    0
	);
	gl.enableVertexAttribArray(positionAttribLocationFloor);

	gl.vertexAttribPointer(
	    texCoordAttribLocationFloor,
	    2,
	    gl.FLOAT,
	    gl.FALSE,
	    5 * Float32Array.BYTES_PER_ELEMENT,
	    3 * Float32Array.BYTES_PER_ELEMENT
	);
	gl.enableVertexAttribArray(texCoordAttribLocationFloor);
	*/



	// ------------- Create texture -------------

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
	gl.useProgram(floorShaderProgram);
	var floorMatWorldUniformLocation = gl.getUniformLocation(floorShaderProgram, 'mWorld');


	gl.useProgram(mainShaderProgram);
	var matWorldUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mProj');
	


	var objects = [
		{ worldMatrix: mat4.create(), coord: [0.0, 0.0, 0.0], type: 'billboard' }, // type doesn't do anything yet
		{ worldMatrix: mat4.create(), coord: [3.0, 3.0, 5.0], type: 'billboard' },
		{ worldMatrix: mat4.create(), coord: [-3.0, -3.0, 5.0], type: 'billboard' },
		{ worldMatrix: mat4.create(), coord: [0.0, -1.0, 0.0], type: 'floor' }
	];

	var camera = {
		camPosCoord: [0, 0, -8], targetPosCoord: [objects[1].coord], upwardDirCoord: [0, 1, 0]
	}

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, camera.camPosCoord, camera.targetPosCoord, camera.upwardDirCoord);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

	gl.useProgram(floorShaderProgram);
	gl.uniformMatrix4fv(floorMatWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.useProgram(mainShaderProgram);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	

	


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

	var distanceText = document.getElementById("distance");

	var angle = 0;
	var bounceBack = false;
	var cameraChanged = false;
	var newCamCoords = camera.camPosCoord;
	var newPlayerCoords = objects[1].coord;

	var targetFPS = 60; // The code that forces 60 FPS is generated from Chat GPT
	var expectedFrameTime = 1000 / targetFPS;
	var lastUpdateTime = performance.now();


	var loop = function () {

		var currentTime = performance.now();
    	var deltaTime = currentTime - lastUpdateTime;
    	if (deltaTime >= expectedFrameTime){

		lastUpdateTime = currentTime - (deltaTime % expectedFrameTime);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
    	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);


    	angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.identity(worldMatrix);
		mat4.rotate(worldMatrix, worldMatrix, angle, [0, 1, 0]);

		
		distanceText.innerHTML = "Distance: " + calculateDistance(objects[1].coord, objects[2].coord).toFixed(1);
		index = 0;
		if(keys['d']){ // rotate right
			newCamCoords = (rotateObjectAroundAxis(camera.camPosCoord, objects[1].coord, -0.04));
			camera.camPosCoord = newCamCoords;
			gl.bindTexture(gl.TEXTURE_2D, boxTexture);
			cameraChanged = true;
		}
		if(keys['a']){ // rotate left
			newCamCoords = (rotateObjectAroundAxis(camera.camPosCoord, objects[1].coord, 0.04));
			camera.camPosCoord = newCamCoords;
			gl.bindTexture(gl.TEXTURE_2D, boxTexture);
			cameraChanged = true;
		}

		

    	// Render objects
		for (obj of objects){
			index += 1;
			if (index == 1){ // billboard
				worldMatrix[13] = 5;
				obj.worldMatrix = worldMatrix;
				

				gl.useProgram(mainShaderProgram);
    	    	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, obj.worldMatrix);
    	    	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);
			}
			else if (index == 2){ // player
				if (keys['w']) { // move forward
					const newPlayerCoords = moveToAnotherVertex(obj.coord, objects[2].coord, "forward");
					const moveAmount = vec3.subtract([], newPlayerCoords, objects[1].coord); // help from Copilot
					objects[1].coord = newPlayerCoords;
					gl.bindTexture(gl.TEXTURE_2D, boxTexture);

					camera.camPosCoord[0] += moveAmount[0];
					camera.camPosCoord[1] += moveAmount[1];
					camera.camPosCoord[2] += moveAmount[2];
				}
				if(keys['s']){ // move backwards
					newPlayerCoords = (moveToAnotherVertex(obj.coord, objects[2].coord, "backward"));
					const moveAmount = vec3.subtract([], newPlayerCoords, objects[1].coord);
					objects[1].coord = newPlayerCoords;
					gl.bindTexture(gl.TEXTURE_2D, boxTexture);

					camera.camPosCoord[0] += moveAmount[0];
					camera.camPosCoord[1] += moveAmount[1];
					camera.camPosCoord[2] += moveAmount[2];
				}

				camera.targetPosCoord = obj.coord;
				
				if (cameraChanged == false){
					camera.camPosCoord = [camera.camPosCoord[0], obj.coord[1], camera.camPosCoord[2]];
				}

				cameraChanged = false;
				mat4.lookAt(viewMatrix, camera.camPosCoord, camera.targetPosCoord, camera.upwardDirCoord);
				gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
				obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z

				gl.useProgram(mainShaderProgram);
    	    	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, obj.worldMatrix);
    	    	
    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);
			}
			else if (index == 3) { // billboard
                if (bounceBack == false){
					obj.coord[2] += 0.20;
					if (obj.coord[2] >= 14){
						bounceBack = true;
					}
				}
				if (bounceBack == true){
					obj.coord[2] -= 0.20;
					if (obj.coord[2] <= 0){
						bounceBack = false;
					}

				}
				if(keys['o']){
					console.log(camera.coord);
				}

				obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z
				
				gl.useProgram(mainShaderProgram);
    	    	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, obj.worldMatrix);
    	    	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);

				
            }
			else if (index == 4) { // floor
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

		}
		else{
			requestAnimationFrame(loop);
		}
	}
		


	requestAnimationFrame(loop);
};



