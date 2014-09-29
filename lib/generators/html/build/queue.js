var Q = require("q");
var queue = [];
var current;
// Add functions that return a deferred.  Only one of these is allowed to be running
// at one time.
module.exports = function(func){
	var deferred = Q.defer();
	
	var funcPromise = deferred.promise.then(func);
	funcPromise.then(function(){
			current = queue.shift();
			if(current){
				current.resolve();
			}
		}, function(e){
			throw e;
		});
	
	if(!current) {
		current = deferred;
		current.resolve();
	} else {
		queue.push(deferred);
	}
		
	return funcPromise;
	
};
