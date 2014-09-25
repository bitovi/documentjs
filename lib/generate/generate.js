var Q = require('q');
var findFiles = require("../find/files"),
	process = require("../process/process"),
	promiseQueue = require("../promise_queue");
	



module.exports = function(options){
	var fileEventEmitter = findFiles(options),
		docMapPromise = process.fileEventEmitter(fileEventEmitter, options);
	
	if(!options.generators) {
		options.generators = "../generators/html/html";
	}
	if(typeof options.generators === "string") {
		options.generators = [options.generators];
	}
	var functions = options.generators.map(function(moduleName){
		var generator = require(moduleName);
		return function(){
			return generator.generate(docMapPromise, options);
		};
	});
	
	return promiseQueue(functions);

};
