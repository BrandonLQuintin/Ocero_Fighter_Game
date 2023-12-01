// Load a text resource from a file over the network
var loadTextResource = function (url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status < 200 || request.status > 299) {
            callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
        } else {
            callback(null, request.responseText);
        }
    };
    request.send();
};

// Load an image from a file over the network
var loadImage = function (url, callback) {
    var image = new Image();
    image.onload = function () {
        callback(null, image);
    };
    image.src = url;
};

// Load a JSON resource from a file over the network
var loadJSONResource = function (url, callback) {
    loadTextResource(url, function (err, result) {
        if (err) {
            callback(err);
        } else {
            try {
                callback(null, JSON.parse(result));
            } catch (e) {
                callback(e);
            }
        }
    });
};


function compileShader(type, source){
	if (type == 'vertex'){
		gl.compileShader(source);
		if (!gl.getShaderParameter(source, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(source));
			return;
		}
	}
	else {
		gl.compileShader(source);
		if (!gl.getShaderParameter(source, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(source));
			return;
		}
	}
}

function linkProgram(programName){
	gl.linkProgram(programName);
	if (!gl.getProgramParameter(programName, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(programName));
		return;
	}
	gl.validateProgram(programName);
	if (!gl.getProgramParameter(programName, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(programName));
		return;
	}
}

function moveToAnotherVertex(vertex1, vertex2, forwardOrBackward, speed){ // I had help from ChatGPT for this one.
    x = vertex1[0];
    y = vertex1[1];
    z = vertex1[2];

    x1 = vertex2[0];
    y1 = vertex2[1];
    z1 = vertex2[2];

    directionX = x1 - x;
    directionY = y1 - y;
    directionZ = z1 - z;

    distance = Math.sqrt(directionX ** 2 + directionY ** 2 + directionZ ** 2);
    normalizedDirectionX = directionX / distance;
    normalizedDirectionY = directionY / distance;
    normalizedDirectionZ = directionZ / distance;
    

    displacementX = normalizedDirectionX * speed;
    displacementY = normalizedDirectionY * speed;
    displacementZ = normalizedDirectionZ * speed;
    
    if (forwardOrBackward == 'forward'){
        newX = x + displacementX;
        newY = y + displacementY;
        newZ = z + displacementZ;
    }
    
    else{
        newX = x - displacementX;
        newY = y - displacementY;
        newZ = z - displacementZ;
    }

    return [newX, newY, newZ];
}

function calculateDistance(vertex1, vertex2){
    x = vertex1[0];
    y = vertex1[1];
    z = vertex1[2];

    x1 = vertex2[0];
    y1 = vertex2[1];
    z1 = vertex2[2];

    directionX = x1 - x;
    directionY = y1 - y;
    directionZ = z1 - z;

    distance = Math.sqrt(directionX ** 2 + directionY ** 2 + directionZ ** 2);
    return distance;
}

function rotateObjectAroundAxis(vertex1, vertex2, angle) { // I had help from ChatGPT for this one.
    x = vertex1[0];
    y = vertex1[1];
    z = vertex1[2];

    x1 = vertex2[0];
    y1 = vertex2[1];
    z1 = vertex2[2];

    displacement = [
        x - x1,
        y - y1,
        z - z1
    ];

    newX = x1 + displacement[0] * Math.cos(angle) - displacement[2] * Math.sin(angle);
    newY = y;
    newZ = z1 + displacement[0] * Math.sin(angle) + displacement[2] * Math.cos(angle);

    return [newX, newY, newZ];
}

function returnAtlasUV(x, y){
    // assuming the texture is a 12x12 grid.
    // if selecting grid (1, 1), type in (0, 0) instead.
    gridsize = 12;
    gridlength = 1 / gridsize;

    vEnd = 1 - (y * gridlength);
    vStart = vEnd - gridlength;
    
    uStart = x * gridlength;
    uEnd = uStart + gridlength;
    
    
    return [uStart, vStart, uEnd, vEnd];
}

function extractRotationY(matrix) { // help from copilot
    // Extract the rotation matrix
    const rotationMatrix = mat4.create();
    mat4.copy(rotationMatrix, matrix);
    rotationMatrix[12] = 0; // Clear translation on X
    rotationMatrix[13] = 0; // Clear translation on Y
    rotationMatrix[14] = 0; // Clear translation on Z

    // Extract the rotation angle around the Y-axis
    const rotationY = Math.atan2(rotationMatrix[8], rotationMatrix[10]);

    return rotationY;
}

calculateSpriteIndex = function(characterVertex, targetVertex, cameraRotationY) { // help from Copilot
    let [characterX, characterY, characterZ] = characterVertex;
    let [targetX, targetY, targetZ] = targetVertex;

    let dx = targetX - characterX;
    let dz = targetZ - characterZ;

    let angle = Math.atan2(dz, dx) - cameraRotationY;
    angle = ((angle + 2 * Math.PI) * (180 / Math.PI)) % 360;

    // Determine sprite based on angle
    if ((angle >= 315 && angle < 360) || (angle >= 0 && angle < 45)) {
        spriteIndex = 1; // Right View
    } else if (angle >= 45 && angle < 135) {
        spriteIndex = 2; // Front View
    } else if (angle >= 135 && angle < 225) {
        spriteIndex = 3; // Left View
    } else if (angle >= 225 && angle < 315) {
        spriteIndex = 0; // Back View
    } else {
        spriteIndex = 0; // Default to back view if none of the above conditions match
    }

    return spriteIndex;
};


generateRandomCoordinates = function(vertex){
    x = vertex[0];
    y = vertex[1];
    z = vertex[2];

    newX = x + (Math.random() * 20 - 10);
    newY = Math.random() * 5 + 5;;
    newZ = z + (Math.random() * 20 - 10);

    return [newX, newY, newZ];
}