var Q = require("q"),
	fs = require("fs"),
	processFile = require("../process/file"),
	addChildren = require("./add_children"),
	findFiles = require("../find/files"),
	path = require("path");

module.exports = function(files, options){
	
	var docMap = {},
		matched = 0,
		processed = 0,
		complete = false,
		deferred = Q.defer(),
		resolve = function(){
			if(matched === processed && complete) {
				addChildren(docMap);
				deferred.resolve(docMap);
			}
		};
	
	var fileEventEmitter = findFiles(files,{});
	fileEventEmitter.on("match",function(src){
		matched++;
		console.log("FIND:",path.relative(process.cwd(),src));
		fs.readFile(src, function(err, data){
			
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
