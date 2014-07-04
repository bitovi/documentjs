


var stealTools = require("steal-tools"),
	fsx = require('../../../lib/fs_extras'),
	Q = require('q');


module.exports = function(options, done){

	return stealTools.build({
		main: "static",
		config: __dirname+"/config.js",
	},{
		minify: options.minifyBuild === false ? false : true,
		distDir: __dirname,
		quiet: true
	}).then(function(){
		
		return Q.all([
			fsx.mkdirs("documentjs/site/static/dist/bundles").then(function(){
				return fsx.copy("documentjs/site/static/build/bundles", "documentjs/site/static/dist/bundles");
			}),
			fsx.copy("documentjs/node_modules/steal/steal.production.js", "documentjs/site/static/dist/steal.production.js"),
			fsx.copy("documentjs/site/static/build/html5shiv.js", "documentjs/site/static/dist/html5shiv.js"),
				
			fsx.mkdirs("documentjs/site/static/dist/fonts").then(function(){
				return fsx.copy("documentjs/site/static/build/fonts", "documentjs/site/static/dist/fonts");
			}),
			
			fsx.mkdirs("documentjs/site/static/dist/img").then(function(){
				return fsx.copy("documentjs/site/static/build/img", "documentjs/site/static/dist/img");
			}),
			fsx.mkdirs("documentjs/site/static/dist/templates").then(function(){
				return fsx.exists("documentjs/site/static/build/templates").then(function(exists){
					if(exists) {
						return fsx.copy("documentjs/site/static/build/templates", "documentjs/site/static/dist/templates");
					}
				});
			})
		]);

	});
};
