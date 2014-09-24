var buildTemplates = require("./templates"),
	getRenderer = require("./get_renderer"),
	getPartials = require("./get_partials");



/**
 * @function documentjs.build.renderer
 * @parent documentjs.build.methods
 * 
 * Creates a renderer function used to generate
 * the documentation.
 * 
 * @signature `documentjs.build.renderer(options)`
 * 
 * Registers all `.mustache` files in the _documentjs/site/templates_ folder as 
 * partials and creates a [documentjs.build.types.renderer renderer] function that
 * renders the `content.mustache` template within the `layout.mustache` template. 
 * 
 * @param {Promise} buildTemplatesPromise The result of calling 
 * [documentjs.build.templates]. Building the renderer
 * must happen after the templates have been copied over. Passing this 
 * argument enforces that.
 * 
 * @param {{}} options
 * 
 * Options used to configure the behavior of the renderer.
 * 
 * 
 * @return {Promise<documentjs.build.types.renderer>} A promise that
 * resolves with the renderer function.
 */
module.exports = function(buildTemplatesPromise, options){
	// 1. Copies site/default/templates to site/templates
	// 2. Copies `options.templates` to site/templates
	return buildTemplatesPromise.then(function(){
		// Creates a renderer function and adds partials to mustache
		var templatesPath = path.join('documentjs/site/templates', md5(options.dest) );
		return Q.all([
			getRenderer(templatesPath),
			getPartials(templatesPath)
		]).then(function(results){
			// returns the renderer
			return results[0];
		});
	});
};
	