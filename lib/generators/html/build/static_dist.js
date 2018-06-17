var fss = require("../../../fs_extras");
var Q = require("q");
var path = require("path");
var buildHash = require("./build_hash");
var promiseLock = require("../../../promise_lock");
var fs = require("fs-extra");
var makePackageJson = require("./make_package_json");
var npmInstall = require("./npm_install");

var copy = Q.denodeify(fs.copy);
var writeFile = Q.denodeify(fs.writeFile);
var queue = promiseLock();

/**
 * @function documentjs.generators.html.build.staticDist
 * @parent documentjs.generators.html.build.methods
 *
 * Builds a static distributable which will eventually be copied
 * to the `static` folder of the generated output.
 *
 * @signature `.build.staticDist(options)`
 *
 * Builds the static distributable with the following steps:
 *
 * 1. Copies everything from _documentjs/site/default/static_ to _documentjs/site/static/build_.
 * 2. Overwrites site/static/build with content in `options.static`.
 * 3. Writes a `package.json` file to _documentjs/site/static/build_.
 * 4. Runs `npm install` in _documentjs/site/static/build_ to get the dependencies for the build.
 * 5. Calls that "build" function at _documentjs/site/static/build/build.js_ with 
 *    the options and returns the result.
 *
 * The "build" module is expected to build a minified distributable
 * and copy the necessary contents to _documentjs/site/static/dist_ and
 * return a promise that resolves when complete.
 *
 * @param {{}} options
 *
 * @option {Boolean} [forceBuild=false] If set to `true`, rebuilds the
 * static bundle even if it has already been built.
 *
 * @option {String} dest The final destination ouput of the static
 * distributable.
 *
 * @option {String} static The location of static content used to overwrite or
 * add to the default static content.
 *
 * @option {Boolean} [minifyBuild=true] If set to `false` the build will not
 * be minified. This behavior should be implemented by the "build" module.
 *
 * @return {Promise} A promise that resolves if the static dist was successfully created.
 *
 */
module.exports = function(options) {
	// only run one build at a time.
	return queue(function staticDistQueue() {
		var hash = buildHash(options);
		var distFolder = path.join("site", "static", "dist", hash);
		var buildFolder = path.join("site", "static", "build", hash);

		var mkdirPromise = Q.all([
			fss.mkdirs(distFolder),
			fss.mkdirs(buildFolder)
		]);

		var buildPromise = mkdirPromise
			.then(function() {
				return fss.exists(
					path.join(distFolder, "bundles", "static.css")
				);
			})
			.then(function(exists) {
				// If we have already built, don't build again
				if (exists && !options.forceBuild) {
					if (options.debug) {
						console.log("BUILD: Using cache", distFolder);
					}
				} else {
					return buildSiteStaticAssets();
				}
			});

		function buildSiteStaticAssets() {
			var docjsRoot = path.join(__dirname, "..", "..", "..", "..");

			return Promise.resolve()
				.then(function copyFromSiteDefaultToBuildFolder() {
					return fss.copy(
						path.join("site", "default", "static"),
						buildFolder
					);
				})
				.then(function overrideWithOptionsStatic() {
					if (options["static"]) {
						return fss.copyFrom(options["static"], buildFolder);
					}
				})
				.then(function writeBuildPackageJson() {
					var pkg = makePackageJson(options);
					return writeFile(
						path.join(docjsRoot, buildFolder, "package.json"),
						JSON.stringify(pkg, null, 2)
					);
				})
				.then(function installDependencies() {
					if (options.debug) {
						console.log("BUILD: Installing node_modules");
					}
					return npmInstall({
						stdio: options.debug ? "inherit" : "pipe",
						cwd: path.join(docjsRoot, buildFolder)
					});
				})
				.then(function runBuildScript() {
					if (options.debug) {
						console.log("BUILD: Running build script");
					}

					var build = require(path.join(
						docjsRoot,
						buildFolder,
						"build.js"
					));

					return build(options, {
						dist: distFolder,
						build: buildFolder
					});
				});
		}

		return buildPromise;
	});
};
