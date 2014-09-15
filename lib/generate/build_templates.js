var fsx = require('../fs_extras');
var	Q = require('q');
var md5 = require('MD5');
var path = require('path');

module.exports = function(options){
	var hash = md5(options.dest);
	var target = path.join("documentjs","site","templates",hash);
	var makeTemplates = function(){
		return fsx.mkdirs(target).then(function(){
			return fsx.copy("documentjs/site/default/templates",target).then(function(){
				if(options["templates"]){
					console.log("BUILD: Copying templates from "+options["templates"])
					return fsx.copyFrom(options["templates"],target)
				}
			});
		});
	};
	
	// if forceBuild, copy all templates over again
	if(options.forceBuild) {
		return makeTemplates();
	} else {
		return fsx.exists(target).then(function(exists){
			if(exists) {
				console.log("BUILD: Using cache",target);
			} else {
				return makeTemplates();
			}
		});
	}
	
	
};

