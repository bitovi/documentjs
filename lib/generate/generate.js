var Q = require('q');
var findFiles = require("../find/files"),
	process = require("../process/process"),
	promiseQueue = require("../promise_queue");
	

var moduleMap = {
	"html": "../generators/html/html"
};

/**
 * @function documentjs.generate generate
 * @parent DocumentJS.apis.internal
 * 
 * @signature `.generate(options)`
 * 
 * Generates documenation using specified generators.
 * 
 * @param {Object} options
 * 
 * Options that configure the [documentjs.find.files files] 
 * processed, how they are [documentjs.process procssed], and
 * how the output is generated.
 * 
 * @option {moduleName|Array<moduleName>} [generators]
 * 
 * Generators specifies a generator module or array of modules used to create an 
 * output for documentation. The default generator is "html" which maps
 * to documentjs's internal [documentjs.generators.html html generator].
 * 
 * You can specify other modules which will be passed a promise containing
 * the [documentjs.process.docMap docMap] and the `options` and be expected
 * to return a promise that resolves when they are complete.
 * 
 * @return {Promise} A promise that resolves when the documentation
 * has been successfully created.
 * 
 * @body
 * 
 * ## Use
 */
module.exports = function(options){
	var fileEventEmitter = findFiles(options),
		docMapPromise = process.fileEventEmitter(fileEventEmitter, options);
	
	if(!options.generators) {
		options.generators = "html";
	}
	if(typeof options.generators === "string") {
		options.generators = [options.generators];
	}
	var functions = options.generators.map(function(moduleName){
		moduleName = moduleMap[moduleName] || moduleName;
		var generator = require(moduleName);
		return function(){
			return generator.generate(docMapPromise, options);
		};
	});
	
	return promiseQueue(functions);

};
