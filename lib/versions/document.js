var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate");

module.exports = function(projectPath, defaultVersionConfig){
	
	var baseDest = path.dirname(projectPath);
	

	// get the config file
	return readFile(path.join(projectPath,"documentjs.json")).then(function(data){
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
			// TODO: a 'smart' join so if a cwd like ./docs is given, it looks in [cwd]/docs
			if(!files.cwd) {
				files.cwd = projectPath;
			}
			if(!generateConfig.out) {
				generateConfig.out = name;
			}
			generateConfig.out = path.join(baseDest, generateConfig.out);
			generations.push( generate(files,generateConfig) );
		});
		
		return Q.all(generations);
	});
	
};

