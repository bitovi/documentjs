
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
		// if can-* or steal-* packages are updated, this list will also likely need to be updated
		// TODO this should be automated first

		// root packages
		var npmPackages = [
			'can-cid',
			'can-compute',
			'can-construct',
			'can-control',
			'can-event',
			'can-map',
			'can-namespace',
			'can-observation',
			'can-simple-map',
			'can-stache',
			'can-stache-bindings',
			'can-types',
			'can-view-callbacks',
			'can-view-import',
			'can-view-live',
			'can-view-model',
			'can-view-nodelist',
			'can-view-parser',
			'can-view-scope',
			'can-view-target',
			'steal-stache',
		];

		// conditional map
		var map = {
			'can-compute': {
				'proto-compute': 'can-compute/proto-compute',
			},
			'can-map': {
				'bubble': 'can-map/bubble',
				'map-helpers': 'can-map/map-helpers',
			},
			'can-stache': {
				'helpers/core': 'can-stache/helpers/core',
				'helpers/converter': 'can-stache/helpers/converter',
				'src/html_section': 'can-stache/src/html_section',
				'src/intermediate_and_imports': 'can-stache/src/intermediate_and_imports',
				'src/mustache_core': 'can-stache/src/mustache_core',
				'src/text_section': 'can-stache/src/text_section',
			},
			'can-view-live': {
				'lib/attr': 'can-view-live/lib/attr',
				'lib/attrs': 'can-view-live/lib/attrs',
				'lib/core': 'can-view-live/lib/core',
				'lib/html': 'can-view-live/lib/html',
				'lib/list': 'can-view-live/lib/list',
				'lib/text': 'can-view-live/lib/text',
			},
			'can-view-scope': {
				'compute_data': 'can-view-scope/compute_data',
				'reference-map': 'can-view-scope/reference-map',
			},
			'steal-stache': {
				'add-bundles': 'steal-stache/add-bundles',
			},
		};
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
