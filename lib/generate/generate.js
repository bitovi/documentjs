var Q = require('q');
var buildStaticDistributable = require("./build_static_dist"),
	copyStaticDistributable = require("./copy_static_dist"),
	buildTemplates = require("./build_templates"),
	getRenderer = require('./get_renderer'),
	getPartials = require('./get_partials'),
	makeDocMap = require('../doc_map/make'),
	addHelpers = require("./add_helpers"),
	generateStatic = require("./static"),
	writeDoc = require("../doc_object/write"),
	fs = require("fs-extra"),
	mkdirs = Q.denodeify(fs.mkdirs),
	guessParent = require("./guess_parent"),
	path = require('path'),
	md5 = require('MD5');
	



module.exports = function(files, options){
	
	// 1. Copies everything from site/default/static to site/static/build
	// 2. Overwrites site/static/build with content in `options.static`
	// 3. Runs site/static/build/build.js
	//    A. Builds itself and copies everything to site/static/dist
	var builtPromise = buildStaticDistributable(options).then(function(){
		// copies statics to documentation location.
		return copyStaticDistributable(options);
	});
	
	// 1. Copies site/default/templates to site/templates
	// 2. Copies `options.templates` to site/templates
	var builtTemplatesAndRendererPromise = buildTemplates(options).then(function(){
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
	
	// Read all documentation files and put them in a docMap
	var docsDeferred = Q.all([
		makeDocMap(files, options),
		builtTemplatesAndRendererPromise,
		mkdirs(options.dest)
	]).then(function(results){
		// Once all docObjects are ready and the template is rendered ...
		var docMap = results[0],
			renderer = results[1],
			currentDocObject,
			promises = [];
		if(!options.parent) {
			options.parent = guessParent(docMap);
			console.log("  guessed parent ",options.parent);
		}
		
		// Check that parent is in docMap
		if(!docMap[options.parent]){
			throw "The parent DocObject ("+options.parent+") was not found!";
		}
		
		// Setup mustache helpers
		addHelpers(docMap, options, function(){
			return currentDocObject;
		});
		
		// Go through each object and write it out.
		for(var name in docMap){
			currentDocObject = docMap[name];
			promises.push(writeDoc(currentDocObject, renderer, options));
		}
		return Q.all(promises);
	});

	var staticDeferred = builtTemplatesAndRendererPromise.then(function(renderer){
		return generateStatic(options, renderer);
	});
	
	return Q.all([
		// built and copied distributable
		builtPromise,
		// finished writing out all documentation
		docsDeferred,
		// built static pages
		staticDeferred
	]).catch(function(e){
		console.log("ERROR:",e+"\n", e.stack || "");
	});

};
