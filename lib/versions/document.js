var _ = require("underscore"),
	getVersion = require("./get"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate"),
	fsx = require('../fs_extras');


/**
 * project {path: , version: []}
 */
module.exports = function(project, parent, options ){
	var docConfigPath = path.join(project.path,"documentjs.json");
	

	// get the docConfig
	return readFile(docConfigPath).then(function(data){
		var docConfig = JSON.parse(data.toString());
		
		return documentProject(docConfig,project, parent, options );
		
	});
	
};

function documentProject(docConfig, project, parent, options) {
	
	docConfig = finalizeDocConfig(docConfig, project, parent, options);
	
	var docConfigPath = path.join(project.path,"documentjs.json");
	
	// build the sites
	var generations = [];
	_.each(docConfig.sites || {}, function(siteConfig, name){
		
		var files = siteConfig.glob;
		delete siteConfig.glob;

		generations.push( generate(files,siteConfig) );
	});
	
	// get the versions and build them
	var versions = [],
		getAndDocument = require("./get_and_document"),
		versionsDeferred = Q.defer(),
		versionsPromise = versionsDeferred.promise;
		
	versionsDeferred.resolve();
		
	_.each(docConfig.versions, function(versionProject, versionName){
		// relative name from 
		
		//versions.push(
		versionsPromise = versionsPromise.then(function(){
			
			return getAndDocument(versionProject, 
				parent || {
					docConfig: docConfig,
					path: docConfigPath
				});
		});
			
		//);
		
		
	});
	
	return Q.all(generations.concat(versionsPromise));
}

var pathAdjustedProperties = ['templates','static'];

function finalizeDocConfig(docConfig, project, parent, options){
	// clean options
	options = options || {};
	
	// set defaults
	docConfig = _.extend({
		versionDest: "./<%= version %>",
		defaultDest: ".",
		siteDefaults: {}
	}, docConfig);
	
	
	
	// adjust path values
	pathAdjustedProperties.forEach(function(prop){
		if(docConfig.siteDefaults[prop]) {
			docConfig.siteDefaults[prop] = fsx.smartJoin(project.path, docConfig.siteDefaults[prop]);
		}
	});
	
	// adjust sites by iterating through it and creating a new, more perfect, sites
	var sites = docConfig.sites || {};
	docConfig.sites = {};
	_.each(sites, function(siteConfig, name){

		// combine parent's siteDefaults, with current siteDefaults, and siteConfig
		siteConfig = _.extend({}, 
			parent && parent.docConfig.siteDefaults || {}, 
			docConfig.siteDefaults || {}, 
			siteConfig);
		
		// get the overwrite from the command options and set any overwrites
		var overwrite = _.findWhere(options.only||[],{name: name});
		
		// add this to be documented if options allows it
		if(!options.only || overwrite ){
			docConfig.sites[name] = siteConfig;
		} else {
			return;	
		}
		
		// glob - an object that looks for all .js and .md files in the project path
		if(!siteConfig.glob) {
			siteConfig.glob = "**/*.{js,md}";
		}
		if(typeof siteConfig.glob === "string") {
			siteConfig.glob = { pattern: siteConfig.glob };
		}
		// TODO: a 'smart' join so if a cwd like ./docs is given, it looks in [cwd]/docs
		if(!siteConfig.glob.cwd) {
			siteConfig.glob.cwd = project.path;
		}
		// dest - a sibling folder named with the siteConfig name
		if(!siteConfig.dest) {
			siteConfig.dest = path.join("..",name);
		}
		siteConfig.dest = fsx.smartJoin(project.path, siteConfig.dest);
		
		// templates - template paths from the project
		if(siteConfig.templates) {
			siteConfig.templates = fsx.smartJoin(project.path, siteConfig.templates);
		}
		
		// pageConfig - version of the project and a path to the docConfig
		siteConfig.pageConfig = _.extend(siteConfig.pageConfig||{},{
			docConfigDest:  path.relative(siteConfig.dest, parent ? parent.path : project.path),
			version: project.version
		});
	});
	
	// adjust versions by iterating through it and creating a new, more perfect, versions
	var versions = docConfig.versions || {};
	docConfig.versions = {};
	_.each(versions, function(versionProject, versionName){
		
		if(typeof versionProject == "string") {
			versionProject = {resource: versionProject};
		}
		var projectName = getProjectName(versionProject.resource);
		
		// calculate the output location of the project
		var versionDest = _.template(docConfig.versionDest, {version: versionName}),
			dest = fsx.smartJoin(
				project.path, 
				docConfig.defaultVersion == versionName ? 
					docConfig.defaultDest : versionDest, 
				projectName);
		
		versionProject = _.extend({
			version: versionName,
			path: dest
		},versionProject);
		
		// get the overwrite from the command options and set any overwrite properties
		var overwrite = _.findWhere(options.only||[],{name: versionName});
		if(overwrite) {
			if(overwrite.resource) {
				versionProject.resource = resource;
			}
		}
		
		// add this version to be built
		if(!options.only || overwrite ){
			docConfig.versions[versionName] = versionProject;
		} else {
			return;	
		}
		
		// relative name from 
		if(versionProject.resource.indexOf("./") === 0) {
			versionProject.resource = path.join(project.path, versionProject.resource);
		}
		
	});
	return docConfig;
}


