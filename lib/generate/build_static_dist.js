var fss = require('../fs_extras.js'),
	Q = require('q'),
	path = require('path'),
	md5 = require('MD5');


module.exports = function(options){
	var builtAlready;
	var hash = md5(options.dest);
	var distFolder = path.join("documentjs/site/static/dist", hash),
		buildFolder = path.join("documentjs/site/static/build", hash);
	
	return Q.all([
		fss.mkdirs(distFolder),
		fss.mkdirs(buildFolder),
		fss.exists(path.join(distFolder,"bundles","static.css")).then(function(exists){

			// If we have already built, don't build again
			if(exists && !options.forceBuild) {
				builtAlready = true;
				console.log("BUILD: Using cache",distFolder);
				return;
			}

			return fss.copy("documentjs/site/default/static",buildFolder).then(function(){
				if(options["static"]){
					return fss.copyFrom(options["static"], buildFolder);
				} 
			});
		})
	]).then(function(){
		if(builtAlready){
			return;
		}
		
		console.log("BUILD: Getting build module");
		var build = require("../../site/static/build/"+hash+"/build.js");
		return build(options,{
			dist: distFolder,
			build: buildFolder
		});
	});
};