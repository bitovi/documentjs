var fs = require('fs-extra'),
	fss = require('../fs_extras.js'),
	Q = require('q'),
	copy = Q.denodeify(fs.copy);

module.exports = function(options){
	var builtAlready;
	return Q.all([
		fss.mkdirs("documentjs/site/static/dist"),
		fss.mkdirs("documentjs/site/static/build"),
		fss.exists("documentjs/site/static/dist/bundles/static.css").then(function(exists){

			// If we have already built, don't build again
			if(exists && !options.forceBuild) {
				builtAlready = true;
				console.log("BUILD: Using files in documentjs/site/static/dist");
				return;
			}

			return fss.copy("documentjs/site/default/static","documentjs/site/static/build").then(function(){
				if(options["static"]){
					return copy(options["static"], "documentjs/site/static/build");
				} 
			});
		})
	]).then(function(){
		if(builtAlready){
			return;
		}
		
		console.log("Getting build module");
		var build = require("../../site/static/build/build.js");
		return build(options);
	});
};