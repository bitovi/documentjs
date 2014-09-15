
var stealTools = require("steal-tools"),
	fsx = require('../../../../lib/fs_extras'),
	Q = require('q'),
	path = require("path");


module.exports = function(options, folders){
	
	var copyDir = function(name){
		return fsx.mkdirs( path.join(folders.dist,name) ).then(function(){
			return fsx.exists(path.join(folders.build,name)).then(function(exists){
				if(exists) {
					return fsx.copy( path.join(folders.build,name), path.join(folders.dist,name) );
				}
			});
		});
	};
	// makes sure can is not added to the global so we can build nicely.
	global.GLOBALCAN = false;
	return stealTools.build({
		main: "static",
		config: __dirname+"/config.js",
		bundlesPath: __dirname+"/bundles",
	},{
		minify: options.minifyBuild === false ? false : true,
		quiet: true
	}).then(function(){
		console.log("BUILD: Copying build to dist.");
		// copy everything to DIST
		return Q.all([
			fsx.mkdirs( path.join(folders.dist,"bundles") ).then(function(){
				return fsx.copy(path.join(folders.build,"bundles"), path.join(folders.dist,"bundles") );
			}),
			fsx.copy("documentjs/node_modules/steal/steal.production.js", path.join(folders.dist,"steal.production.js") ),
			fsx.copy( path.join(folders.build,"html5shiv.js"), path.join(folders.dist,"html5shiv.js")),
				
			copyDir("fonts"),
			
			copyDir("img"),
			copyDir("templates")
		]);

	});
};
