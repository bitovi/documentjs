var npm = require("npm");
var	fs = require('fs-extra');

var path = require("path");
var Q = require("q");
var remove = Q.denodeify(fs.remove);
var move = Q.denodeify(fs.move);
var copy = Q.denodeify(fs.copy);
var getProjectName = require("./project_name");
var ghdownload = require('github-download');

module.exports = function(resourceConfig, dest){
	if(typeof resourceConfig === "string"){
		resourceConfig = {resource: resourceConfig};
	}
	
	var projectName = getProjectName(resourceConfig.resource); 
	var finalDest = path.join(dest,projectName);
	
	var removePromise = remove(finalDest);
	
	// check if resourceConfig.resource is a local file
	if(	( resourceConfig.resource.indexOf("/") === 0 || 
	      resourceConfig.resource.indexOf("//") >= 0 ) &&
	      fs.existsSync(resourceConfig.resource) ) {

			return removePromise.then(function(){
				return copy(resourceConfig.resource,finalDest);
			});
		
	} else if(resourceConfig.npmInstall) {
		var npmDeferred = Q.defer();
	
		npm.load({
		    loaded: false
		}, function (err) {
		  // catch errors
			npm.commands.install(__dirname+"/tmp",[resourceConfig.resource], function(err, data){
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
	} else {
		var ghDownloadDeferred = Q.defer();
		return removePromise.then(function(){
			ghdownload(resourceConfig.resource, finalDest)
				.on('error',function(err){
					ghDownloadDeferred.reject(err);
				})
				.on('end', function(){
					ghDownloadDeferred.resolve();
				});
			return ghDownloadDeferred.promise;
		});
	}
	
	
	
	
	
	
};

