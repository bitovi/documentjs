var Q = require('q');
var findFiles = require("../find/files"),
	process = require("../process/process"),
	promiseQueue = require("../promise_queue"),
	_ = require("lodash");
	//, minimatch = require("minimatch");
	

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


function generateOne(options){
	
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
			if(typeof generator.generate === "function" ) {
				return generator.generate(docMapPromise, options);
			} else {
				return generator(docMapPromise, options);
			}
			
		};
	});
	
	return promiseQueue(functions);

}



function generateAndWatch(options){
	if(!options.watch) {
		return generateOne(options);
	} else {
		var original = options,
			copy = _.cloneDeep(options),
			timer;
			
		var promise = generateOne(copy);
		
		fs.watch(options.glob.cwd, function(ev, filename){
			if(filename) {
				if(!filename || minimatch(filename, original.glob.pattern) ) {
					console.log("change, aborting!");
					copy.isAborted = function(){
						throw new Error("Aborted by filesystem chagne");
					};
					// this should only be done with one project
					
					// wait for abortion ...
					promise.then(function(){
						promise = generateOne(  _.cloneDeep(options) );
					}, function(){
						promise = generateOne(  _.cloneDeep(options) );
					});
				}
			}
		});
		
		return promise;
		
	}
	
}

module.exports = generateOne;