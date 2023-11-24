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

function moveToAnotherVertex(vertex1, vertex2, forwardOrBackward){ // I had help from ChatGPT for this one.
    x = vertex1[0];
    y = vertex1[1];
    z = vertex1[2];

    x1 = vertex2[0];
    y1 = vertex2[1];
    z1 = vertex2[2];

    speed = 0.05;

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

    const displacement = [
        x - x1,
        y - y1,
        z - z1
    ];

    const newX = x1 + displacement[0] * Math.cos(angle) - displacement[2] * Math.sin(angle);
    const newY = y;
    const newZ = z1 + displacement[0] * Math.sin(angle) + displacement[2] * Math.cos(angle);

    return [newX, newY, newZ];
}