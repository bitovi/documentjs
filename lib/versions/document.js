var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate");

module.exports = function(npmName, versionName, siteConfig, defaultVersionConfig){
	
	var baseDest = _.template(siteConfig.sourceDest, {version: versionName}),
		projectName = getProjectName(npmName);
	
	// get version and put it in place
	return getVersion(npmName, baseDest).then(function(){
		
		// get the config file
		return readFile(path.join(baseDest,projectName,"documentjs.json")).then(function(data){
			var versionConfig = JSON.parse(data.toString());
			
			var generations = [];
			_.each(versionConfig, function(generateConfig, name){
				generateConfig = _.extend({}, generateConfig);
				var files = generateConfig.pattern;
				delete generateConfig.pattern;
				if(!files) {
					files = "**/*.{js,md}";
				}
				if(typeof files === "string") {
					files = { pattern: files };
				}
				if(!files.cwd) {
					files.cwd = path.join(baseDest,projectName);
				}
				if(!generateConfig.out) {
					generateConfig.out = name;
				}
				generateConfig.out = path.join(baseDest, generateConfig.out);
				
				generations.push( generate(files,generateConfig) );
			});
			
			return Q.all(generations);
		});
	});
};

