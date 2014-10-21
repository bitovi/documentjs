var Q = require("q"),
	fs = require("fs"),
	processFile = require("../process/file"),
	path = require("path"),
	cleanDocMap = require("./clean_doc_map"),
	finalizeDocMap = require("./finalize_doc_map"),
	tags = require("../tags/tags");
/**
 * @function documentjs.process.fileEventEmitter
 * @parent documentjs.process.methods
 * 
 * Processes a file's source.  Adds created [documentjs.process.docObject docObjects] to docMap.
 * 
 * @signature `documentjs.process.file(source, docMap, [filename])`
 * 
 * Processes files "matched" from a file event emitter into a [documentjs.process.docMap docMap].
 * 
 * 
 * 
 * @param {documentjs.process.types.FileEventEmitter} fileEventEmitter An event emitter that dispatches events
 * with files to process.
 * 
 * @param {Object} options An options object used to configure the behavior of documentjs.
 * 
 * @option {String} [parent] The primary page which will be treated as the documentation's 
 * homepage.  If one is not provided, one will be attempted to be found by:
 * 
 * - Looking for a docObject that is 
 * 
 * @return {Promise<documentjs.process.docMap>} A docMap that contains the docObjects 
 * created from the matched files.
 * 
 * 
 * 
 * @body
 */
module.exports = function(fileEventEmitter, options){
	
	var docMap = {},
		matched = 0,
		processed = 0,
		complete = false,
		deferred = Q.defer(),
		resolve = function(){
			if(matched === processed && complete) {
				finalizeDocMap(docMap, tags);
				cleanDocMap(docMap, options);
				
				deferred.resolve(docMap);
			}
		};
	
	fileEventEmitter.on("match",function(src){
		matched++;
		if(options.debug) {
			console.log("FIND:", path.relative(process.cwd(),src));
		}
		
		if( src.indexOf(fileEventEmitter.cwd) !== 0 ) {
			var readSrc = path.join(fileEventEmitter.cwd, src);
		} else {
			var readSrc = src;
		}
		
		
		fs.readFile(readSrc, function(err, data){
			if(err) {
				console.log(err);
			}
			processFile(data.toString(), docMap, src);
			processed++;
			resolve();
		});
		
	});
	fileEventEmitter.on("end", function(){
		complete = true;
		resolve();
	});
	
	return deferred.promise;
};
