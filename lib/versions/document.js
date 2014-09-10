var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate");

module.exports = function(projectPath, defaultSiteConfig){
	
	var baseDest = path.dirname(projectPath);
	

	// get the docConfig
	return readFile(path.join(projectPath,"documentjs.json")).then(function(data){
		var docConfig = JSON.parse(data.toString());
		
		// set defaults
		docConfig = _.extend({
			dest: "./<%= version %>",
			defaultDest: "."
		}, docConfig);
		
		if(docConfig.dest.indexOf("./") === 0) {
			docConfig.dest = path.join(projectPath, docConfig.dest);
		}
		
		// build the sites
		
		var generations = [];
		_.each(docConfig.sites || {}, function(siteConfig, name){
			
			siteConfig = _.extend({}, siteConfig);
			var files = siteConfig.pattern;
			delete siteConfig.pattern;
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
			if(!siteConfig.out) {
				siteConfig.dest = name;
			}
			siteConfig.dest = path.join(baseDest, siteConfig.dest);
			generations.push( generate(files,siteConfig) );
		});
		
		// get the versions and build them
		var versions = [],
			getAndDocument = require("./get_and_document");
		_.each(docConfig.versions, function(npmName, versionName){
			versions.push(getAndDocument(npmName, versionName, docConfig, defaultSiteConfig));
		});
		
		return Q.all(generations.concat(versions));
	});
	
};

