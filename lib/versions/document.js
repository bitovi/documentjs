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
			
			if(siteConfig.templates) {
				siteConfig.templates = path.join(baseDest, siteConfig.templates);
			}
			
			// add pageConfig data
			siteConfig.pageConfig = JSON.stringify(_.extend(siteConfig.pageConfig||{},{
				docConfigDest: parentDocConfigPath && path.relative(siteConfig.dest, parentDocConfigPath),
				version: version
			}));
			
			generations.push( generate(files,siteConfig) );
		});
		
		// get the versions and build them
		var versions = [],
			getAndDocument = require("./get_and_document"),
			versionsDeferred = Q.defer(),
			versionsPromise = versionsDeferred.promise;
			
		versionsDeferred.resolve();
			
		_.each(docConfig.versions, function(npmName, versionName){
			// relative name from 
			if(npmName.indexOf("./") === 0) {
				npmName = path.join(projectPath, npmName);
			}
			
			//versions.push(
			versionsPromise = versionsPromise.then(function(){
				
				// figure out the location of this version
				var versionDest = _.template(docConfig.dest, {version: versionName});
				
				var baseDest = path.join(projectPath,docConfig.defaultDest);
				
				var dest;
				if(docConfig.defaultVersion == versionName) {
					dest = baseDest;
				} else {
					dest = path.join(baseDest, versionDest);
				}
				
				return getAndDocument(
					npmName, 
					versionName, 
					dest, 
					parentDocConfig || docConfig, 
					parentDocConfigPath || docConfigPath);
			});
				
			//);
			
			
		});
		
		return Q.all(generations.concat(versionsPromise));
	});
	
};

