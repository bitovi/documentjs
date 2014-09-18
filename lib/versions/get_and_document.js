var _ = require("underscore"),
	getVersion = require("./get");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate");

/**
 * Gets a resource with a version name and copys it to a location, and documents it.
 * @param {Object} baseDest - where the output should be copied to.
 */
module.exports = function(project, parent){
	
	// get version and put it in place
	return getVersion(project, path.dirname(project.path ) ).then(function(){
		
		// get the config file
		return require("./document")(project, parent);
	});
};

