var _ = require("lodash"),
	getProjectName = require("./project_name");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate"),
	fsx = require('../fs_extras'),
	promiseQueue = require("../promise_queue"),
	finalizeDocConfig= require("./make_final_doc_config");


/**
 * @function documentjs.configured.generate generate
 * @parent documentjs.configured.methods
 * 
 * Generates a project's documentation from its `documentjs.json`.
 * 
 * @param {{}} project A [documentjs.configured.projectConfig] configured with at least:
 * 
 * @option {String} path The path of a project.
 * 
 * @param {documentjs.configured.projectConfig} [parent] An optional
 * parent project that can be used to configure the behavior of this project.
 * 
 * @param {{}} [options]
 * 
 * @return {Promise} A promise that resolves when the the project is documented.
 * 
 * @body 
 * 
 * ## Use
 * 
 *     var documentjs = require("documentjs");
 *     documentjs.configured.generate({
 *       path: __dirname
 *     }).then(function(){
 *       // documentjs produced
 *     });
 * 
 * 
 * 
 */
function document(project, parent, options ){
	if(project.docConfig) {
		if(project.debug) {
			console.log("Using provided docConfig");
		}
		var docConfig = project.docConfig;
		if( !_.isEmpty(docConfig.versions) && !_.isEmpty(docConfig.sites) ) {
			if(project.debug) {
				console.log("no sites or versions, adding a default one.");
			}
			docConfig.sites = {
				"docs": {
					glob: {ignore: "{node_modules,bower_components}/**/*"}
				}
			};
		}
		return documentProject( docConfig, project, parent, options );

	} else {
		var docConfigPath = path.join(project.path,"documentjs.json");
	

		// get the docConfig
		return readFile(docConfigPath).then(function(data){
			var docConfig = JSON.parse(data.toString());
			
			return documentProject(docConfig,project, parent, options );
			
		}, function(e){
			
			if(parent){
				console.warn("Missing", docConfigPath);
			} else {
				console.warn("No documentjs.json. Create one to configure its behavior.");
			}
			return documentProject({
					"sites": project.sites || {
						"docs": {
							glob: {ignore: "{node_modules,bower_components}/**/*"}
						}
					}
				},project, parent, options );
			
		});
	}
	
	
	
}
module.exports = document;

/**
 * @function documentjs.configured.generateProject generateProject
 * @hide
 * 
 * @param {Object} docConfig A docConfig loaded from `{project.path}/documentjs.json`.
 * 
 * @param {Object} project A [documentjs.configured.projectConfig] object with data about
 * the project being documented.
 * 
 *   @option {String} path The location of the project being documented.
 * 
 * @param {Object} parentProject A [documentjs.configured.projectConfig] object with data about
 * the most parent project being documented.
 * 
 *   @option {String} path The location of the most parent project being documented.
 *   @option {DocumentJS.docConfig} The docConfig loaded from that project.
 * 
 * @param {Object} options command line overwrites.
 */
function documentProject(docConfig, project, parent, options) {
	
	docConfig = finalizeDocConfig(docConfig, project, parent, options);

	// Use promiseQueue until we can build in parallel
	var generations = [];
	// build the sites
	_.each(docConfig.sites || {}, function(siteConfig, name){
		console.log("Generating "+name+" at "+path.relative(process.cwd(), siteConfig.dest) );
		generations.push( generate(siteConfig) );
	});
	
	// get the versions and build them
	var getAndDocument = require("./get_and_generate_project");
		
	_.each(docConfig.versions, function(versionProject, versionName){
		// relative name from 
		generations.push( (function(){
			var newParent = parent || {
				docConfig: docConfig,
				path: project.path,
				sites: versionProject.sites
			};
			if(versionProject.skipGet) {
				return document(versionProject, newParent);
			} else {
				return getAndDocument(versionProject, newParent);
			}
		})());

	});
	
	return Q.all( generations );
};




