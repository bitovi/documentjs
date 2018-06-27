var fss = require("../../../fs_extras.js"),
	Q = require("q"),
	path = require("path"),
	buildHash = require("../build/build_hash"),
	fs = require("fs-extra"),
	mkdirs = Q.denodeify(fs.mkdirs);

/**
 * @function documentjs.generators.html.write.staticDist
 * @parent documentjs.generators.html.write.methods
 *
 * Copies the [documentjs.generators.html.build.staticDist built distributable]
 * to a _static_ folder in `options.dest`.
 *
 * @signature `.write.staticDist(options)`
 *
 * @param {Object} options Configuration options.
 *
 * @option {String} dest The static distributable will be written to
 * `options.dest + "static"`.
 *
 * @return {Promise} A promise that resolves when successfully copied over.
 */
module.exports = function(options) {
	var source = path.join("site", "static", "dist", buildHash(options));
	var dest = options.dest;

	return mkdirs(dest).then(function() {
		if (options.debug) {
			var env = options.devBuild ? "development" : "production";
			var where = path.relative(process.cwd(), dest);
			console.log(`BUILD: Copying ${env} files to ${where}`);
		}

		return fss.copyTo(source, dest);
	});
};
