var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate"),
	fsx = require('../fs_extras');

var pathAdjustedProperties = ['templates','static'];

module.exports = function(projectPath, version, parentDocConfig, parentDocConfigPath ){
	
	var baseDest = path.dirname(projectPath),
		docConfigPath = path.join(projectPath,"documentjs.json");
	

	// get the docConfig
	return readFile(docConfigPath).then(function(data){
		var docConfig = JSON.parse(data.toString());
		
		// set defaults
		docConfig = _.extend({
			versionDest: "./<%= version %>",
			defaultDest: ".",
			siteDefaults: {}
		}, docConfig);
		
		// adjust path values
		pathAdjustedProperties.forEach(function(prop){
			if(docConfig.siteDefaults[prop]) {
				docConfig.siteDefaults[prop] = fsx.smartJoin(projectPath, docConfig.siteDefaults[prop]);
			}
		});
		
		
		// build the sites
		var generations = [];
		_.each(docConfig.sites || {}, function(siteConfig, name){
			
			// combine parent's siteDefaults, with current siteDefaults, and siteConfig
			siteConfig = _.extend({}, parentDocConfig && parentDocConfig.siteDefaults || {}, docConfig.siteDefaults || {}, siteConfig);
			
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
				siteConfig.dest = path.join("..",name);
			}
			siteConfig.dest = fsx.smartJoin(projectPath, siteConfig.dest);
			
			if(siteConfig.templates) {
				siteConfig.templates = fsx.smartJoin(projectPath, siteConfig.templates);
			}
			
			// add pageConfig data
			siteConfig.pageConfig = _.extend(siteConfig.pageConfig||{},{
				docConfigDest: parentDocConfigPath && path.relative(siteConfig.dest, parentDocConfigPath),
				version: version
			});
			
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
				var versionDest = _.template(docConfig.versionDest, {version: versionName});
				
				var dest = fsx.smartJoin(projectPath, 
					docConfig.defaultVersion == versionName ? 
						docConfig.defaultDest : versionDest);
				
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

