
var getDefaultHelpers = require("./make_default_helpers"),
	_ = require("underscore"),
	Handlebars = require("handlebars");
var fsx = require('../../../fs_extras');
var path = require('path');

var md5 = require("MD5");

/**
 * @function documentjs.generators.html.build.helpers
 * @parent documentjs.generators.html.build.methods
 * 
 * Gets the default helpers and helpers in the _documentjs/site/templates_ folder and
 * registers them with Handlebars.
 * 
 * @signature `.build.helpers(buildTemplatesPromise, docMap, options, getCurrent)`
 * 
 * Registers helpers 
 * 
 * 
 * @param {Promise} buildTemplatesPromise The result of calling 
 * [documentjs.generators.html.build.templates]. Building the helpers
 * must happen after the templates have been copied over. Passing this 
 * argument enforces that.
 * 
 * @param {documentjs.process.docMap} docMap The docMap which contains all
 * docObjects that will be documented.
 * 
 * @param {Object} options
 * 
 * 
 * @param {function():documentjs.process.docObject} getCurrent
 * 
 * A function that when called, returns the `docObject` currently being
 * generated.
 * 
 * @return {Promise} A promise that resolves when helpers have been added to Handlebars.
 * 
 * @body
 * 
 */
module.exports = function(buildTemplatesPromise, docMap, options, getCurrent){
	return buildTemplatesPromise.then(function(){
		
		// get the default heleprs
		var helpers = getDefaultHelpers(docMap,options,getCurrent);
		
		var templatesPath = path.join('documentjs/site/templates', md5(options.dest) );
		
		return fsx.readdir(templatesPath).then(function(files){
			
			files.filter(function(filename){
				return filename.indexOf(".js") >=0;
			}).map(function(filename){
				var requirePath = path.relative( path.join(__dirname,"helpers.js"), path.join(templatesPath, filename) );
				
				var makeHelpers = require(requirePath);
				var newHelpers = makeHelpers(docMap, options, getCurrent, helpers);
				
				_.extend(helpers, newHelpers );
				
			});
			
			if (helpers && Handlebars) {
				_.each(helpers, function (helper, name) {
					Handlebars.registerHelper(name, helper);
				});
			}
			
		});
		
	});
	
	
	
	
	
};
