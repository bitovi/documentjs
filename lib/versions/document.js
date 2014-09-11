var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate");

module.exports = function(projectPath, version, parentDocConfig, parentDocConfigPath ){
	
	var baseDest = path.dirname(projectPath),
		docConfigPath = path.join(projectPath,"documentjs.json");
	

	// get the docConfig
	return readFile(docConfigPath).then(function(data){
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
			if(!siteConfig.dest) {
				siteConfig.dest = name;
			}
			siteConfig.dest = path.join(baseDest, siteConfig.dest);
			
			// add pageConfig data
			siteConfig.pageConfig = _.extend(siteConfig.pageConfig||{},{
				docConfigDest: parentDocConfigPath && path.relative(siteConfig.dest, parentDocConfigPath),
				version: version
			});
			
			generations.push( generate(files,siteConfig) );
		});
		
		// get the versions and build them
		var versions = [],
			getAndDocument = require("./get_and_document");
		_.each(docConfig.versions, function(npmName, versionName){
			versions.push(
				getAndDocument(
					npmName, 
					versionName, 
					docConfig, 
					parentDocConfig || docConfig, 
					parentDocConfigPath || docConfigPath) );
		});
		
		return Q.all(generations.concat(versions));
	});
	
};

