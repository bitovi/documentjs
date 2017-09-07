var assign = require("can-util/js/assign/assign");
var fs = require('fs');
var map = require('./map');
var resolve = require('resolve');
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
		var paths = {
			'jquery': path.relative(__dirname, require.resolve('jquery'))
		};

		// generate the remaining paths
		var mapCopy = {};
		for (var packageName in map) {
			if (map.hasOwnProperty(packageName)) {
				// map[packageName] can either be just a string (e.g. jquery) or
				// an object, so we want the path for the module, not an object
				var resolvePath = (typeof map[packageName] === 'object') ? map[packageName][packageName] : map[packageName];
				if (!resolvePath) {
					// Fall back to Node’s resolution for npm 3+
					// …or the “resolve” package’s resolution implementation
					resolvePath = require.resolve(packageName) || resolve.sync(packageName, {basedir: process.cwd()});
				}

				// Get the path relative to the build folder
				var moduleRelativePath = path.relative(__dirname, resolvePath);

				// Update the paths object with the AMD configuration
				paths[packageName + '/*'] = path.dirname(moduleRelativePath) + '/*.js';
				paths[packageName] = moduleRelativePath;

				// Make a copy of the object without the key
				// that was used to locate the module
				if (map[packageName][packageName]) {
					mapCopy[packageName] = assign({}, map[packageName]);
					delete mapCopy[packageName][packageName];
				} else {
					mapCopy[packageName] = map[packageName];
				}
			}
		}

		// conditional map
		// write it out for the client to consume
		var mapJSON = JSON.stringify(mapCopy);
		fs.writeFileSync(path.join(__dirname, 'map.json'), mapJSON);

		// makes sure can is not added to the global so we can build nicely.
		global.GLOBALCAN = false;
		return stealTools.build({
			main: "static",
			config: __dirname + "/config.js",
			bundlesPath: __dirname+"/bundles",
			paths: paths,
			map: mapCopy,
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
