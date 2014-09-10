var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate"),
	document = require("./document");

module.exports = function(npmName, versionName, siteConfig, defaultVersionConfig){
	
	var baseDest = _.template(siteConfig.sourceDest, {version: versionName}),
		projectName = getProjectName(npmName);
	
	// get version and put it in place
	return getVersion(npmName, baseDest).then(function(){
		
		// get the config file
		return document(path.join(baseDest, projectName), defaultVersionConfig);
	});
};

