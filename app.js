// Initial Starter Code from YouTuber Indigo Code's 5th WebGL Tutorial
// https://www.youtube.com/watch?v=33gn3_khXxw
// https://github.com/sessamekesh/IndigoCS-webgl-tutorials/tree/432a3a36a30a9b3e6ca74373b955f771fbedd36a

var gl;
var model;
function startGame() {
	let music = document.getElementById('background-music');
	music.volume = 0.3;
	music.loop = true;
	music.play();
	InitDemo();
}
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
					main(vsText, fsText);
				}
			});
		}
	});
};

var main = function (vertexShaderText, fragmentShaderText) {
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
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// ------------- Create shaders -------------
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);


	compileShader('vertex', vertexShader);
	compileShader('fragment', fragmentShader);


	var mainShaderProgram = gl.createProgram();
	gl.attachShader(mainShaderProgram, vertexShader);
	gl.attachShader(mainShaderProgram, fragmentShader);
	linkProgram(mainShaderProgram);


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

	var floorVertices =
	[ // X, Y, Z            U, V
		-1000.0, -1.0, -1000.0, 
		-1000.0, -1.0, 1000.0, 
		1000.0, -1.0, 1000.0, 
		1000.0, -1.0, -1000.0, 
	];
	
	var floorIndices =
	[
		0, 1, 2,
		0, 2, 3,
	];

	var floorVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertices), gl.STATIC_DRAW);

	var floorIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);

	var billboardVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(billboardVertices), gl.STATIC_DRAW);

	var billboardIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, billboardIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(billboardIndices), gl.STATIC_DRAW);

	// Setup attributes for "billboard"
	gl.useProgram(mainShaderProgram);
	var floorpositionAttribLocation = gl.getAttribLocation(mainShaderProgram, 'floorVertPosition');
	var billboardPositionAttribLocation = gl.getAttribLocation(mainShaderProgram, 'vertPosition');
	
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexBufferObject);
	gl.vertexAttribPointer(
	    floorpositionAttribLocation,
	    3,
	    gl.FLOAT,
	    gl.FALSE,
	    3 * Float32Array.BYTES_PER_ELEMENT,
	    0
	);
	gl.enableVertexAttribArray(floorpositionAttribLocation);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
	gl.vertexAttribPointer(
	    billboardPositionAttribLocation,
	    3,
	    gl.FLOAT,
	    gl.FALSE,
	    5 * Float32Array.BYTES_PER_ELEMENT,
	    0
	);
	gl.enableVertexAttribArray(billboardPositionAttribLocation);

	var billboardTexCoordAttribLocation = gl.getAttribLocation(mainShaderProgram, 'vertTexCoord');
	gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
	gl.vertexAttribPointer(
	    billboardTexCoordAttribLocation,
	    2,
	    gl.FLOAT,
	    gl.FALSE,
	    5 * Float32Array.BYTES_PER_ELEMENT,
	    3 * Float32Array.BYTES_PER_ELEMENT
	);
	gl.enableVertexAttribArray(billboardTexCoordAttribLocation);






	// ------------- Create texture -------------

	var floorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        document.getElementById('floor-image')
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

	var textureAtlas = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureAtlas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        document.getElementById('texture-atlas')
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

	// Tell OpenGL state machine which program should be active.

	gl.useProgram(mainShaderProgram);
	var matProjUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mProj');
	var matViewUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mView');
	var matWorldUniformLocation = gl.getUniformLocation(mainShaderProgram, 'mWorld');
	var modelViewMatrixUniform = gl.getUniformLocation(mainShaderProgram, 'modelViewMatrix');
	var isFloorUniformLocation = gl.getUniformLocation(mainShaderProgram, 'isFloor');
	var textureUCoord = gl.getUniformLocation(mainShaderProgram, 'u');
	var textureVCoord = gl.getUniformLocation(mainShaderProgram, 'v');

	
	


	var objects = [
		{ worldMatrix: mat4.create(), coord: [0.0, 5.0, 0.0], type: 'billboard' }, // type doesn't do anything yet
		{ worldMatrix: mat4.create(), coord: [3.0, 3.0, -5.0], type: 'player' },
		{ worldMatrix: mat4.create(), coord: [3.0, 6.0, 5.0], type: 'enemy' },
		{ worldMatrix: mat4.create(), coord: [0.0, 0.0, 0.0], type: 'floor' },
		{ worldMatrix: mat4.create(), coord: [3.0, 3.0, 5.0], type: 'lightning'}
	];

	var camera = {
		camPosCoord: [0, 0, objects[1].coord[2] - 8], targetPosCoord: [objects[1].coord], upwardDirCoord: [0, 1, 0]
	}

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, camera.camPosCoord, camera.targetPosCoord, camera.upwardDirCoord);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 100.0);

	gl.useProgram(mainShaderProgram);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, objects[3].worldMatrix);



	// ------------- Main loop variables -------------
	
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);

	var distanceText = document.getElementById("distance");
	

	var cameraChanged = false;
	var initializeFight = true;
	var newCamCoords = camera.camPosCoord;
	var newPlayerCoords = objects[1].coord;

	var targetFPS = 60; // The code that forces 60 FPS is generated from Chat GPT
	var expectedFrameTime = 1000 / targetFPS;
	var lastUpdateTime = performance.now();

	var modelViewMatrix = mat4.multiply([], viewMatrix, objects[1].worldMatrix);

	var moveAmount = [0,0,0]; // used later in the 's' key controls

	var uStart = 0;
	var vStart = 0;
	var uEnd = 0;
	var vEnd = 0;
	var outputUV = [0,0,0,0]

	var cameraAngle = 0;

	var flyingSoundEffectLastPlayed = Date.now();
	var currentlyPunching = false;
	var punchAnimationBounceBack = false;
	var punchCounter = 0;

	var enemyGoToCoordinates = [0,0,0];
	var enemyCoordinatesLastChanged = Date.now();
	var enemyTimeLimit = 1500;



	const keys = {};

	document.addEventListener("keydown", (event) => {
		if (['w', 'a', 's', 'd', 'k', 'l', 'o'].includes(event.key)) {
		  keys[event.key] = true;
		}
	});

	document.addEventListener("keyup", (event) => {
	  keys[event.key] = false;
	  if (event.key === 'k') {
		initializeFight = true;
		currentlyPunching = false;
		punchCounter = 0;
	  }
	});

	// ------------- Main loop -------------

	var loop = function () {

		var currentTime = performance.now();
    	var deltaTime = currentTime - lastUpdateTime;
    	if (deltaTime >= expectedFrameTime){

		lastUpdateTime = currentTime - (deltaTime % expectedFrameTime);

		gl.clearColor(0.27, 0.66, 1.0, 1.0);
    	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		
		distanceText.innerHTML = "Distance: " + calculateDistance(objects[1].coord, objects[2].coord).toFixed(1);
		index = 0;
		gl.useProgram(mainShaderProgram);
		gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, billboardIndexBufferObject);


    	// Render objects
		for (obj of objects){
			index += 1;
			// Code calculates 3d "billboard" effect
			// I also got help from copilot for this one.
  			var direction = vec3.subtract([], camera.camPosCoord, obj.coord);
  			vec3.normalize(direction, direction);
  			var billboardRotation = mat4.fromRotation([], Math.atan2(-direction[0], -direction[2]), [0, 1, 0]);
  			var billboardModelMatrix = mat4.clone(obj.worldMatrix);
  			mat4.multiply(billboardModelMatrix, billboardModelMatrix, billboardRotation);
  			mat4.multiply(modelViewMatrix, viewMatrix, billboardModelMatrix);
  			gl.uniformMatrix4fv(modelViewMatrixUniform, gl.FALSE, modelViewMatrix);

			if (index == 1){ // billboard
				obj.worldMatrix = worldMatrix;
    	    	gl.bindTexture(gl.TEXTURE_2D, textureAtlas);

				outputUV = returnAtlasUV(1, 0);
				uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];

				gl.uniform2f(textureUCoord, uStart, uEnd);
				gl.uniform2f(textureVCoord, vStart, vEnd);

    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);
			}
			else if (index == 2){ // player
				if (Object.values(keys).every(value => value === false)) { // if no keys are pressed
					outputUV = returnAtlasUV(0, 1);
					uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					
					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);
				  }

				else if(keys['k'] && calculateDistance(objects[1].coord, objects[2].coord) < 3){ // fight button
					currentlyPunching = true;
					punchCounter += 1;
					if (initializeFight == true){
						obj.coord[0] = objects[2].coord[0];
						obj.coord[1] = objects[2].coord[1] - 0.1;
						obj.coord[2] = objects[2].coord[2] - 1.5;
						initializeFight = false;
					}
					if (punchCounter == 5) { // Enemy gets punched here!
						let audio = new Audio('resources/punch.mp3');
						audio.volume = 0.1;
						audio.play();
						punchCounter = 0;

						// used later in the code to render the hit effect
						objects.push({ worldMatrix: mat4.create(), coord: [objects[2].coord[0], objects[2].coord[1], objects[2].coord[2] - 1], type: 'hit' });
					}
					if (punchAnimationBounceBack == false){
						obj.coord[1] += 0.01;
						if (obj.coord[1] >= (objects[2].coord[1] + .3)){ // hit top
							punchAnimationBounceBack = true;
						}
					}
					else if (punchAnimationBounceBack == true){
						obj.coord[1] -= 0.01;
						if (obj.coord[1] <= objects[2].coord[1] - .1){ // hit bottom
							punchAnimationBounceBack = false;
						}
					}

					newPlayerCoords = rotateObjectAroundAxis(objects[1].coord, objects[2].coord, .10);
					obj.coord = newPlayerCoords;

					camera.camPosCoord[0] = newPlayerCoords[0];
					camera.camPosCoord[1] = newPlayerCoords[1];
					camera.camPosCoord[2] = newPlayerCoords[2] - 8;
					cameraChanged = true;
				}
				else if (keys['w']) { // move forward
					newPlayerCoords = moveToAnotherVertex(obj.coord, objects[2].coord, "forward");
					moveAmount = vec3.subtract([], newPlayerCoords, objects[1].coord); // help from Copilot
					objects[1].coord = newPlayerCoords;

					outputUV = returnAtlasUV(0, 1 + spriteIndex);
					uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					
					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);

					camera.camPosCoord[0] += moveAmount[0];
					camera.camPosCoord[1] += moveAmount[1];
					camera.camPosCoord[2] += moveAmount[2];

					if (Date.now() - flyingSoundEffectLastPlayed >= 1000) {
						let audio = new Audio('resources/flying.mp3');
						audio.volume = 1;
						audio.play();
						flyingSoundEffectLastPlayed = Date.now();
					}
					
				}
				else if(keys['s']){ // move backwards
					newPlayerCoords = (moveToAnotherVertex(obj.coord, objects[2].coord, "backward"));
					if (newPlayerCoords[1] > -0.5) {
						moveAmount = vec3.subtract([], newPlayerCoords, objects[1].coord);
						objects[1].coord = newPlayerCoords;

						if (Date.now() - flyingSoundEffectLastPlayed >= 1000) {
							let audio = new Audio('resources/flying.mp3');
							audio.volume = 1;
							audio.play();
							flyingSoundEffectLastPlayed = Date.now();
						}
						camera.camPosCoord[0] += moveAmount[0];
						camera.camPosCoord[1] += moveAmount[1];
						camera.camPosCoord[2] += moveAmount[2];
					}
					

					outputUV = returnAtlasUV(0, 1 + spriteIndex);
					uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					
					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);

					

					
				}
				else if(keys['d']){ // rotate right
					newCamCoords = (rotateObjectAroundAxis(camera.camPosCoord, objects[1].coord, -0.04));
					camera.camPosCoord = newCamCoords;
					gl.bindTexture(gl.TEXTURE_2D, floorTexture);
					cameraChanged = true;
		
					if (cameraAngle < -2.8){
						cameraAngle = 3.5;
					}
					cameraAngle -= 0.04;
		
					outputUV = returnAtlasUV(0, 1 + spriteIndex);
					uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					
					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);
		
		
		
				}
				else if(keys['a']){ // rotate left
					newCamCoords = (rotateObjectAroundAxis(camera.camPosCoord, objects[1].coord, 0.04));
					camera.camPosCoord = newCamCoords;
					gl.bindTexture(gl.TEXTURE_2D, floorTexture);
					cameraChanged = true;
		
					if (cameraAngle > 3.5){
						cameraAngle = -2.8;
					}
					cameraAngle += 0.04;
		
					outputUV = returnAtlasUV(0, 1 + spriteIndex);
					uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					
					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);
					
				}
				

				camera.targetPosCoord = obj.coord;
				
				if (cameraChanged == false){
					camera.camPosCoord = [camera.camPosCoord[0], obj.coord[1], camera.camPosCoord[2]];
				}


				cameraChanged = false;
				mat4.lookAt(viewMatrix, camera.camPosCoord, camera.targetPosCoord, camera.upwardDirCoord);
				obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z

				angleBetweenTwoPoints = calculateAngle(camera.camPosCoord, objects[2].coord);
				spriteIndex = calculateSpriteIndex(cameraAngle); // Used to determine where sprite faces relative to the camera.

				

				if (currentlyPunching == true) { // draw character left or right of enemy
					if (objects[2].coord[0] > objects[1].coord[0]) {
						outputUV = returnAtlasUV(2, 4)
						uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					}
					else {
						outputUV = returnAtlasUV(2, 2)
						uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					}
					
					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);
					currentlyPunching = false;
				}
				else { // if character idle (or invalid key pressed), this executes
					outputUV = returnAtlasUV(0, 1 + spriteIndex);
					uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					
					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);
				}

				

				gl.bindTexture(gl.TEXTURE_2D, textureAtlas);
    	    	gl.activeTexture(gl.TEXTURE0);
    	    	gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);
			}
			else if (index == 3) { // enemy
                distanceFromTarget = calculateDistance(obj.coord, enemyGoToCoordinates);
				if (distanceFromTarget > .1){
					newNpcCoords = moveToAnotherVertex(obj.coord, enemyGoToCoordinates, "forward");
				}
				if (Date.now() - enemyCoordinatesLastChanged >= enemyTimeLimit) {
					enemyTimeLimit = Math.floor(Math.random() * 2000) + 1000;
					enemyGoToCoordinates = generateCoordinates(obj.coord);
					enemyCoordinatesLastChanged = Date.now();
				}
				
				obj.coord = newNpcCoords;
				if(keys['o']){
					enemyGoToCoordinates = generateCoordinates(obj.coord);
				}

				obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z
				
    	    	outputUV = returnAtlasUV(0, 0)
				uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
				gl.uniform2f(textureUCoord, uStart, uEnd);
				gl.uniform2f(textureVCoord, vStart, vEnd);

    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);

				
            }
			else if (index == 4) { // floor
				gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexBufferObject);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIndexBufferObject);

                obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z


				gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, obj.worldMatrix);
				gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, new Float32Array(viewMatrix));

    	    	gl.bindTexture(gl.TEXTURE_2D, floorTexture);
				uStart = 0; vStart = outputUV[0]; uEnd = 1; vEnd = 1;
				gl.uniform2f(textureUCoord, uStart, uEnd);
				gl.uniform2f(textureVCoord, vStart, vEnd);
    	    	gl.activeTexture(gl.TEXTURE0);

				gl.uniform1i(isFloorUniformLocation, true);
    	    	gl.drawElements(gl.TRIANGLES, floorIndices.length, gl.UNSIGNED_SHORT, 0);
				gl.uniform1i(isFloorUniformLocation, false);
            }

			else if (index == 5 && objects[5]){ // Hit render!
				gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, billboardIndexBufferObject);

				outputUV = returnAtlasUV(9, 0);
				uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
				randomNum = -.1 + Math.random() * (0.5 - -.1);
				if (objects[2].coord[0] > objects[1].coord[0]) {
					obj.worldMatrix[12] = objects[2].coord[0] - .5; // x
					obj.worldMatrix[13] = objects[2].coord[1] + randomNum; // y
					obj.worldMatrix[14] = objects[2].coord[2] - 1; // z
				}
				else {
					obj.worldMatrix[12] = objects[2].coord[0] + .5; // x
					obj.worldMatrix[13] = objects[2].coord[1] + randomNum; // y
					obj.worldMatrix[14] = objects[2].coord[2] - 1; // z
				}
				
				
    	    	outputUV = returnAtlasUV(Math.floor(Math.random() * 3) + 9, 1);
				uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
				gl.uniform2f(textureUCoord, uStart, uEnd);
				gl.uniform2f(textureVCoord, vStart, vEnd);

				mat4.multiply(modelViewMatrix, viewMatrix, obj.worldMatrix);
  				gl.uniformMatrix4fv(modelViewMatrixUniform, gl.FALSE, modelViewMatrix);

    	    	gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, textureAtlas);
    	    	gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);
				
				objects.pop();
			}

			/*else if (index == 5) { // lightning
				obj.worldMatrix[12] = objects[1].coord[0] + (Math.random() * 3 - 1); // x
				obj.worldMatrix[13] = objects[1].coord[1] + (Math.random()); // y
				obj.worldMatrix[14] = objects[1].coord[2] + (Math.random() * 3 - 1); // z
				
				gl.useProgram(mainShaderProgram);
    	    	gl.bindTexture(gl.TEXTURE_2D, textureAtlas);
				outputUV = returnAtlasUV(Math.floor(Math.random() * 3) + 9, 0);
				uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
				gl.uniform2f(textureUCoord, uStart, uEnd);
				gl.uniform2f(textureVCoord, vStart, vEnd);

    	    	gl.activeTexture(gl.TEXTURE0);

    	    	gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);

				
            }*/


    	    
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



