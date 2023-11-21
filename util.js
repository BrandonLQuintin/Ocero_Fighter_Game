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