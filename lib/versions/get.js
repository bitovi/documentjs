var npm = require("npm");
var	fs = require('fs-extra');

var path = require("path");
var Q = require("q");
var remove = Q.denodeify(fs.remove);
var move = Q.denodeify(fs.move);
var copy = Q.denodeify(fs.copy);
var getProjectName = require("./project_name");

module.exports = function(name, dest){
	var projectName = getProjectName(name); 
	var finalDest = path.join(dest,projectName);
	
	var removePromise = remove(finalDest);
	
	// check if name is a local file
	if(name.indexOf("/") === 0 || name.indexOf("//") >= 0) {
		if( fs.existsSync(name) ) {
			return removePromise.then(function(){
				return copy(name,finalDest);
			});
		}
	}
	
	
	
	
	var npmDeferred = Q.defer();
	
	npm.load({
	    loaded: false
	}, function (err) {
	  // catch errors
		npm.commands.install(__dirname+"/tmp",[name], function(err, data){
			if(err) {
				npmDeferred.reject(err);
			} else {
				npmDeferred.resolve(data);
			}
		});
	});
	
	return Q.all([removePromise, npmDeferred.promise]).then(function(){
		return move(
			path.join(__dirname,"/tmp/node_modules",projectName),
			finalDest);
	});
	
};

