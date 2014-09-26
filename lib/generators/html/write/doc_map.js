var writeDocObject = require("./doc_object"),
	Q = require("q"),
	guessParent = require("./guess_parent");
/**
 * @function documentjs.generators.html.write.docMap
 * @parent documentjs.generators.html.write.methods
 * 
 * Writes out every [documentjs.process.docObject docObject] within 
 * a [documentjs.process.docMap docMap].
 * 
 * @signature `.write.docMap(docMap, renderer, options, setCurrentDocObjectForHelpers)`
 * 
 * @param {documentjs.process.docMap} docMap
 * @param {documentjs.generators.html.types.renderer} renderer
 * @param {Object} options
 * @param {function(documentjs.process.docObject)} setCurrentDocObjectForHelpers
 * @return {Promise} Resolves when all docObjects have been written.
 */

module.exports = function(docMap, renderer, options, setCurrentDocObjectForHelpers){
	
	var promises = [];
		
	if(!options.parent) {
		options.parent = guessParent(docMap);
		console.log("  guessed parent ",options.parent);
	}
	
	// Check that parent is in docMap
	if(!docMap[options.parent]){
		throw "The parent DocObject ("+options.parent+") was not found!";
	}
	
	// Go through each object and write it out.
	for(var name in docMap){
		var docObject = docMap[name];
		setCurrentDocObjectForHelpers(docObject);
		promises.push(writeDocObject(docObject, renderer, options));
	}
	return Q.all(promises);
	
};
