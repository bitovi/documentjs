var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate");

/**
 * Gets a resource with a version name and copys it to a location, and documents it.
 * @param {Object} resourceConfig
 * @param {Object} versionName
 * @param {Object} baseDest - where the output should be copied to.
 * @param {Object} parentDocConfig
 * @param {Object} parentDocConfigPath
 */
module.exports = function(resourceConfig, versionName, baseDest, parentDocConfig, parentDocConfigPath){
	if(typeof resourceConfig === "string") {
		resourceConfig = {resource: resourceConfig};
	}
	
	var projectName = getProjectName(resourceConfig.resource);
	
	// get version and put it in place
	return getVersion(resourceConfig, baseDest).then(function(){
		
		// get the config file
		return require("./document")(path.join(baseDest, projectName), versionName, parentDocConfig, parentDocConfigPath);
	});
};

