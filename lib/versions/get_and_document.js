var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate");

module.exports = function(resourceConfig, versionName, docConfig, parentDocConfig, parentDocConfigPath){
	if(typeof resourceConfig === "string") {
		resourceConfig = {resource: resourceConfig};
	}
	
	
	var baseDest = _.template(docConfig.dest, {version: versionName}),
		projectName = getProjectName(resourceConfig.resource);
	
	// get version and put it in place
	return getVersion(resourceConfig, baseDest).then(function(){
		
		// get the config file
		return require("./document")(path.join(baseDest, projectName), versionName, parentDocConfig, parentDocConfigPath);
	});
};

