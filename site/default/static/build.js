var fsExtras = require("../../../../lib/fs_extras");
var Q = require("q");
var path = require("path");
var stealTools = require("steal-tools");

module.exports = function(options, folders) {
	var copyDir = function(name) {
		return fsExtras.mkdirs(path.join(folders.dist, name)).then(function() {
			return fsExtras
				.exists(path.join(folders.build, name))
				.then(function(exists) {
					if (exists) {
						return fsExtras.copy(
							path.join(folders.build, name),
							path.join(folders.dist, name)
						);
					}
				});
		});
	};
	if (options.devBuild) {
		// copy everything to site/static/dist
		return fsExtras.copy(path.join(folders.build), path.join(folders.dist));
	} else {
		return stealTools
			.build(
				{
					main: "static",
					config: path.join(__dirname, "package.json!npm")
				},
				{
					minify: options.minifyBuild === false ? false : true,
					quiet: options.debug ? false : true,
					debug: options.debug ? true : false
				}
			)
			.then(function() {
				if (options.debug) {
					console.log("BUILD: Copying build to dist.");
				}

				// copy everything to DIST
				return Q.all([
					fsExtras.copy(
						path.join(folders.build, "dist"),
						path.join(folders.dist, "dist")
					),
					fsExtras.copy(
						path.join(folders.build, "package.json"),
						path.join(folders.dist, "package.json")
					),
					fsExtras.copy(
						path.join(folders.build, "html5shiv.js"),
						path.join(folders.dist, "html5shiv.js")
					),
					copyDir("fonts"),
					copyDir("img"),
					copyDir("templates")
				]);
			});
	}
};
