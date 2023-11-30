// Initial Starter Code from YouTuber Indigo Code's 5th WebGL Tutorial
// https://www.youtube.com/watch?v=33gn3_khXxw
// https://github.com/sessamekesh/IndigoCS-webgl-tutorials/tree/432a3a36a30a9b3e6ca74373b955f771fbedd36a

var gl;
var model;
let music = document.getElementById('background-music');
function startGame() {
	alert("Welcome to Ocero's legendary fight!\nUse WASD to move around, and K to fight!");
	
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
	var is3DUniformLocation = gl.getUniformLocation(mainShaderProgram, 'is3D');
	var textureUCoord = gl.getUniformLocation(mainShaderProgram, 'u');
	var textureVCoord = gl.getUniformLocation(mainShaderProgram, 'v');

	
	


	var objects = [
		{ worldMatrix: mat4.create(), coord: [0.0, 0.0, 0.0]}, // placeholder
		{ worldMatrix: mat4.create(), coord: [3.0, 3.0, -5.0]}, // player
		{ worldMatrix: mat4.create(), coord: [3.0, 6.0, 5.0]}, // enemy
		{ worldMatrix: mat4.create(), coord: [0.0, 0.0, 0.0]}, // floor
		{ worldMatrix: mat4.create(), coord: [3.0, 3.0, 5.0]} // lightning
	];

	var projectiles = []

	var clouds = [

	]
	for (let i = 0; i < 3500; i++) {
		let x = Math.random() * 2000 - 1000;
		let y = Math.random() * 5 + 15;
		let z = Math.random() * 2000 - 1000;
	
		clouds.push({worldMatrix: mat4.create(), coord: [x, y, z]});
		var scale = [16, 8, 16]; // Change this to the scale you want
    	mat4.scale(clouds[i].worldMatrix, clouds[i].worldMatrix, scale);

		
	}

	var camera = {
		camPosCoord: [0, 0, objects[1].coord[2] - 8], targetPosCoord: [objects[1].coord], upwardDirCoord: [0, 1, 0]
	}

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, camera.camPosCoord, camera.targetPosCoord, camera.upwardDirCoord);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 500.0);

	gl.useProgram(mainShaderProgram);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, objects[3].worldMatrix);



	// ------------- Main loop variables -------------
	
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);

	var pageText = document.getElementById("game-text");
	var oceroText = document.getElementById("ocero-text");
	
	

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

	var flyingSoundEffectLastPlayed = Date.now();
	var currentlyPunching = false;
	var punchAnimationBounceBack = false;
	var punchCounter = 0;

	var winsAgainstOcero = 0;
	var gameOver = false;
	var playerHealth = 100;

	var enemyGoToCoordinates = [0,0,0];
	var enemyProjectileReachedTarget = false;
	var enemyCoordinatesLastChanged = Date.now();
	var enemyLastShot = Date.now();
	var enemyTimeLimit = 1500; // time between enemy movement changes
	var enemyHealth = 100;
	var enemyIsDefeated = false;
	var enemyCurrentlyGettingPunched = false;
	
	var timeSinceLastProjectileAnimation = Date.now();
	var projectileAnimationToggle = false;
	var timeSinceLastSwingAnimation = Date.now();
	var punchAnimationToggle = false;
	var timeSinceProjectileExplosion = Date.now();
	var timeSincePlayerDamage = Date.now();
	var currentlyHurt = false;
	var enemyOutputUV = returnAtlasUV(9, 9);


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
		if (currentlyHurt == true){
			if (Date.now() - timeSincePlayerDamage >= 200){
				document.body.style.backgroundColor = "rgb(255, 255, 255)";
			}
		}
		if (gameOver){
			music.play();
			gameOver = false;
			objects = [
				{ worldMatrix: mat4.create(), coord: [0.0, 0.0, 0.0]}, // placeholder
				{ worldMatrix: mat4.create(), coord: [3.0, 3.0, -5.0]}, // player
				{ worldMatrix: mat4.create(), coord: [3.0, 6.0, 5.0]}, // enemy
				{ worldMatrix: mat4.create(), coord: [0.0, 0.0, 0.0]}, // floor
				{ worldMatrix: mat4.create(), coord: [3.0, 3.0, 5.0]} // lightning
			];
		
			projectiles = []
		
			camera = {
				camPosCoord: [0, 0, objects[1].coord[2] - 8], targetPosCoord: [objects[1].coord], upwardDirCoord: [0, 1, 0]
			}
			playerHealth = 100;
		}

		var currentTime = performance.now();
    	var deltaTime = currentTime - lastUpdateTime;
    	if (deltaTime >= expectedFrameTime){

		lastUpdateTime = currentTime - (deltaTime % expectedFrameTime);

		gl.clearColor(0.27, 0.66, 1.0, 1.0);
    	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		
		pageText.innerHTML = "Health: " + playerHealth + " | Score: " + winsAgainstOcero;
		index = 0;
		gl.useProgram(mainShaderProgram);
		gl.bindBuffer(gl.ARRAY_BUFFER, billboardVertexBufferObject);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, billboardIndexBufferObject);

		// Render all clouds
		for (cloud of clouds){
			var direction = vec3.subtract([], camera.camPosCoord, cloud.coord);
  			vec3.normalize(direction, direction);
  			var billboardRotation = mat4.fromRotation([], Math.atan2(-direction[0], -direction[2]), [0, 1, 0]);
  			var billboardModelMatrix = mat4.clone(cloud.worldMatrix);
  			mat4.multiply(billboardModelMatrix, billboardModelMatrix, billboardRotation);
  			mat4.multiply(modelViewMatrix, viewMatrix, billboardModelMatrix);
  			gl.uniformMatrix4fv(modelViewMatrixUniform, gl.FALSE, modelViewMatrix);
			
			cloud.worldMatrix[12] = cloud.coord[0]; // x
			cloud.worldMatrix[13] = cloud.coord[1]; // y
			cloud.worldMatrix[14] = cloud.coord[2]; // z
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, textureAtlas);
			
			gl.uniform2f(textureUCoord, .6666, 1);
			gl.uniform2f(textureVCoord, 0, .1666);
			gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);
		}


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

			if (index == 1){ // Enemy projectile
				for (proj of projectiles){
					distanceFromTarget = calculateDistance(proj.coord, proj.goToCoord);
					distanceFromPlayer = calculateDistance(proj.coord, objects[1].coord);
					if (distanceFromTarget > .3){
						newCoordinates = moveToAnotherVertex(proj.coord, proj.goToCoord, 'forward', .50);
						proj.coord = newCoordinates;
						proj.worldMatrix[12] = proj.coord[0];
						proj.worldMatrix[13] = proj.coord[1];
						proj.worldMatrix[14] = proj.coord[2];

						if (distanceFromPlayer < 2 && Date.now() - timeSincePlayerDamage >= 1000) {
							//console.log("player hit!");
							playerHealth -= 20;
							document.body.style.backgroundColor = "rgb(255, 0, 0)";
							currentlyHurt = true;

							if (playerHealth < 0){ // GAME OVER
								music.pause();
								music.currentTime = 0;
								alert("You lost! You won " + winsAgainstOcero + " times against Ocero!");
								oceroText.innerHTML = "<h2>Ocero Says: HA HA HA HA!!!<h2>";
								gameOver = true;
								winsAgainstOcero = 0;
								for (key in keys) {
									delete keys[key];
								}
							}
							timeSincePlayerDamage = Date.now();
							
						}
						else{
							if (Date.now() - timeSinceLastProjectileAnimation >= 20){
								if (projectileAnimationToggle == true){
									projectileAnimationToggle = false;
								}
								else{
									projectileAnimationToggle = true;
								}
								timeSinceLastProjectileAnimation = Date.now();
							}
							if (projectileAnimationToggle == true){
								enemyOutputUV = returnAtlasUV(10, 2);
							}
							else{
								enemyOutputUV = returnAtlasUV(9, 2);
							}
						}


					}
					else if (enemyProjectileReachedTarget == false){ // is an else function that only executes once
						//console.log("projectile reached!");
						enemyProjectileReachedTarget = true;
						enemyOutputUV = returnAtlasUV(10, 1);
						timeSinceProjectileExplosion = Date.now();
					}

					if (enemyProjectileReachedTarget && Date.now() - timeSinceProjectileExplosion >= 100){ // make projectile dissapear after explosion

						projectiles.shift(); // removes first element in array
						enemyProjectileReachedTarget = false;
					}

					uStart = enemyOutputUV[0]; vStart = enemyOutputUV[1]; uEnd = enemyOutputUV[2]; vEnd = enemyOutputUV[3];

					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);
					direction = vec3.subtract([], camera.camPosCoord, proj.coord);
  					vec3.normalize(direction, direction);

					billboardRotation = mat4.fromRotation([], Math.atan2(-direction[0], -direction[2]), [0, 1, 0]);
					billboardModelMatrix = mat4.clone(proj.worldMatrix);
					mat4.multiply(billboardModelMatrix, billboardModelMatrix, billboardRotation);

					mat4.multiply(modelViewMatrix, viewMatrix, billboardModelMatrix);
					gl.uniformMatrix4fv(modelViewMatrixUniform, gl.FALSE, modelViewMatrix);
					
					gl.activeTexture(gl.TEXTURE0);
    	    		gl.bindTexture(gl.TEXTURE_2D, textureAtlas);
    	    		gl.drawElements(gl.TRIANGLES, billboardIndices.length, gl.UNSIGNED_SHORT, 0);
					}
				
			}
			else if (index == 2){ // player
				if (Object.values(keys).every(value => value === false)) { // if no keys are pressed
					distanceFromEnemy = calculateDistance(objects[1].coord, objects[2].coord)
					if (distanceFromEnemy > 2){
						enemyCurrentlyGettingPunched = false;
					}
					
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
						if (enemyHealth > 0){
							enemyHealth -= 5;
						}
						else {
							//console.log("Enemy is defeated!");
							enemyIsDefeated = true;
							oceroText.innerHTML = "<h2>Why!!!<h2>";
							//console.log(enemyHealth);
							enemyHealth -= 5;
							if (enemyHealth < -100){
								winsAgainstOcero += 1;
								oceroText.innerHTML = "<h2>Ocero Says: THATS IT!!!<h2>";
								enemyHealth = 100;
								enemyIsDefeated = false;

								for (key in keys) {
									delete keys[key];
								}
							}
							
							
						}
						let audio = new Audio('resources/punch.mp3');
						audio.volume = 0.1;
						audio.play();
						punchCounter = 0;

						// used later in the code to render the hit effect
						objects.push({ worldMatrix: mat4.create(), coord: [objects[2].coord[0], objects[2].coord[1], objects[2].coord[2] - 1]});
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
					distanceFromEnemy = calculateDistance(objects[1].coord, objects[2].coord)

					if (distanceFromEnemy > 1){
						newPlayerCoords = moveToAnotherVertex(obj.coord, objects[2].coord, "forward", .20);
						moveAmount = vec3.subtract([], newPlayerCoords, objects[1].coord); // help from Copilot
						objects[1].coord = newPlayerCoords;

						camera.camPosCoord[0] += moveAmount[0];
						camera.camPosCoord[1] += moveAmount[1];
						camera.camPosCoord[2] += moveAmount[2];
					}

					outputUV = returnAtlasUV(0, 1 + spriteIndex);
					uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					
					gl.uniform2f(textureUCoord, uStart, uEnd);
					gl.uniform2f(textureVCoord, vStart, vEnd);

					

					if (Date.now() - flyingSoundEffectLastPlayed >= 1000) {
						let audio = new Audio('resources/flying.mp3');
						audio.volume = 1;
						audio.play();
						flyingSoundEffectLastPlayed = Date.now();
					}
					
				}
				else if(keys['s']){ // move backwards
					newPlayerCoords = (moveToAnotherVertex(obj.coord, objects[2].coord, "backward", .20));
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
				rotationY = extractRotationY(viewMatrix);
				spriteIndex = calculateSpriteIndex(objects[1].coord, objects[2].coord, rotationY); // Used to determine where sprite faces relative to the camera.

				

				if (currentlyPunching == true) { // draw character left or right of enemy
					enemyCurrentlyGettingPunched = true;
					if (objects[2].coord[0] > objects[1].coord[0]) {
						if (Date.now() - timeSinceLastSwingAnimation >= 20){
							if (punchAnimationToggle == true){
								punchAnimationToggle = false;
							}
							else{
								punchAnimationToggle = true;
							}
							timeSinceLastSwingAnimation = Date.now();
						}
						if (punchAnimationToggle == true){
							outputUV = returnAtlasUV(3, 4);
						}
						else{
							outputUV = returnAtlasUV(2, 4);
						}
						
						uStart = outputUV[0]; vStart = outputUV[1]; uEnd = outputUV[2]; vEnd = outputUV[3];
					}
					else {
						if (Date.now() - timeSinceLastSwingAnimation >= 20){
							if (punchAnimationToggle == true){
								punchAnimationToggle = false;
							}
							else{
								punchAnimationToggle = true;
							}
							timeSinceLastSwingAnimation = Date.now();
						}
						if (punchAnimationToggle == true){
							outputUV = returnAtlasUV(3, 2);
						}
						else{
							outputUV = returnAtlasUV(2, 2);
						}
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
				distanceFromTarget = calculateDistance(obj.coord, enemyGoToCoordinates); // enemy shoots
				if (Date.now() - enemyLastShot >= 1000 && distanceFromTarget < 3 && enemyIsDefeated == false && enemyCurrentlyGettingPunched == false) {
					enemyProjectileReachedTarget = false;
					projectiles.push({ worldMatrix: mat4.create(), coord: [objects[2].coord[0], objects[2].coord[1], objects[2].coord[2]],
						 goToCoord: [objects[1].coord[0], objects[1].coord[1], objects[1].coord[2]]});
					enemyLastShot = Date.now();
					
					//console.log("Enemy shot at!", enemyProjectileGoToCoordinates);
				}

                
				if (distanceFromTarget > .3){
					newNpcCoords = moveToAnotherVertex(obj.coord, enemyGoToCoordinates, "forward", .5);
				}
				if (enemyIsDefeated == false){
					outputUV = returnAtlasUV(0, 0)
					if (Date.now() - enemyCoordinatesLastChanged >= enemyTimeLimit) {
						enemyTimeLimit = Math.floor(Math.random() * 2000) + 1000;
						enemyGoToCoordinates = generateRandomCoordinates(obj.coord);
						enemyCoordinatesLastChanged = Date.now();
					}
				}
				else if (enemyIsDefeated == true) {
					outputUV = returnAtlasUV(2, 0)
					enemyGoToCoordinates = [enemyGoToCoordinates[0], -.45 , enemyGoToCoordinates[2]];
				}
				
				
				obj.coord = newNpcCoords;
				if(keys['o']){
					enemyGoToCoordinates = generateRandomCoordinates(obj.coord);
				}

				obj.worldMatrix[12] = obj.coord[0]; // x
				obj.worldMatrix[13] = obj.coord[1]; // y
				obj.worldMatrix[14] = obj.coord[2]; // z
				
    	    	
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

				gl.uniform1i(is3DUniformLocation, true);
    	    	gl.drawElements(gl.TRIANGLES, floorIndices.length, gl.UNSIGNED_SHORT, 0);
				gl.uniform1i(is3DUniformLocation, false);
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



