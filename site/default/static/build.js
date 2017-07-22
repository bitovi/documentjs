var fs = require('fs');
var map = require('./map');
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
	if(options.devBuild) {
		var promise = Q.all([
			fsx.copy(path.join(folders.build), path.join(folders.dist) ),
			fsx.copy(path.join("node_modules"), path.join(folders.dist) ),
		]);
		// copy everything and steal.js
		return promise;
	} else {
		// manually configure Can/Steal packages for Steal build

		// root packages
		var npmPackages = [];
		for (var moduleName in map) {
			if (map.hasOwnProperty(moduleName) && moduleName.indexOf('/') === -1) {
				npmPackages.push(moduleName);
			}
		}

		// conditional map
		// write it out for the client to consume
		var mapJSON = JSON.stringify(map);
		fs.writeFileSync(path.join(__dirname, 'map.json'), mapJSON);

		var paths = {
			'jquery': path.relative(__dirname, require.resolve('jquery')),
			'can-util/*': path.dirname(path.relative(__dirname, require.resolve('can-util'))) + '/*.js',
			'steal-stache': path.relative(__dirname, require.resolve('steal-stache'))
		};

		// generate the remaining paths
		npmPackages.forEach(function(pkg) {
			paths[pkg + '/*'] = path.dirname(path.relative(__dirname, require.resolve(pkg))) + '/*.js';
			paths[pkg] = path.relative(__dirname, require.resolve(pkg));
		});

		// makes sure can is not added to the global so we can build nicely.
		global.GLOBALCAN = false;
		return stealTools.build({
			main: "static",
			config: __dirname + "/config.js",
			bundlesPath: __dirname+"/bundles",
			paths: paths,
			map: map,
			ext: {
				'stache': 'steal-stache'
			}
		},{
			minify: options.minifyBuild === false ? false : true,
			quiet: options.debug ? false : true,
			debug: options.debug ?  true : false
		}).then(function(){
			if(options.debug) {
				console.log("BUILD: Copying build to dist.");
			}

			// copy everything to DIST
			return Q.all([
				fsx.mkdirs( path.join(folders.dist,"bundles") ).then(function(){
					return fsx.copy(path.join(folders.build,"bundles"), path.join(folders.dist,"bundles") );
				}),
				fsx.copyFrom(path.join( require.resolve("steal"), "..", "steal.production.js"), path.join(folders.dist,"steal.production.js") ),
				fsx.copy( path.join(folders.build,"html5shiv.js"), path.join(folders.dist,"html5shiv.js")),

				copyDir("fonts"),

				copyDir("img"),
				copyDir("templates")
			]);

		});
	}
};
