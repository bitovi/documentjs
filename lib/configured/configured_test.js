var Q = require("q");
var assert = require("assert");
var path = require("path");
var fs = require("fs-extra");

var configured = require("./configured");
var find = require("../../test/find");
var waitFor = require("../../test/wait_for");
var open = require("../../test/open");

var rmdir = Q.denodeify(require("rimraf"));
var pathExists = Q.denodeify(fs.pathExists);

describe("lib/configured", function() {
	this.timeout(5 * 1000 * 60);
	var tmpPath = path.join(__dirname, "test", "tmp");

	it(".getProject is able to get a github url", function() {
		return rmdir(tmpPath)
			.then(function() {
				return configured.getProject({
					source: "git://github.com/bitovi/comparify#master",
					path: path.join(tmpPath, "comparify")
				});
			})
			.then(function() {
				return pathExists(
					path.join(tmpPath, "comparify", "package.json")
				);
			});
	});

	it(".getProject is able to get a folder", function() {
		return configured
			.getProject({
				source: path.join(__dirname, "test", "example_project"),
				path: path.join(tmpPath, "example_project")
			})
			.then(function() {
				return pathExists(path.join(tmpPath, "example_project"));
			});
	});

	it(".getProject is able to get a github url and npm install specific dependencies", function() {
		return rmdir(tmpPath)
			.then(function() {
				return configured.getProject({
					source: "git://github.com/canjs/canjs#master",
					path: path.join(tmpPath, "canjs"),
					npmInstall: ["stealjs/steal#master"]
				});
			})
			.then(function() {
				return pathExists(
					path.join(
						tmpPath,
						"canjs",
						"node_modules",
						"steal",
						"package.json"
					)
				);
			});
	});

	it(".generateProject is able to read the documentjs.json without versions and build a site", function() {
		return rmdir(path.join(__dirname, "test", "api"))
			.then(function() {
				return configured.generateProject({
					path: path.join(__dirname, "test", "example_project")
				});
			})
			.then(function() {
				return pathExists(
					path.join(__dirname, "test", "api", "index.html")
				);
			});
	});

	it(".generateProject is able to take a docObject instead of reading one", function() {
		return rmdir(path.join(tmpPath, "example_project"))
			.then(function() {
				return configured.generateProject({
					path: path.join(__dirname, "test", "example_project"),
					docConfig: {
						sites: {
							api: {
								parent: "mylib",
								dest: "../tmp/example_project/api"
							}
						}
					}
				});
			})
			.then(function() {
				return pathExists(
					path.join(tmpPath, "example_project", "api", "index.html")
				);
			});
	});

	it(".generateProject is able to document multiple versions", function() {
		function switchFromOldToOld() {
			return open(
				__dirname,
				"test/tmp/multiple_versions/1.0.0/api/index.html"
			)
				.then(function(browser) {
					var select = browser.window.document.getElementsByTagName(
							"select"
						)[0],
						$ = browser.window.$;

					$(select).val("3.0.0");
					select.dispatchEvent(new browser.window.Event("change"));
					return browser;
				})
				.then(function(browser) {
					return waitFor(browser, function(window) {
						return window.location.href.includes(
							"test/tmp/multiple_versions/3.0.0/api/index.html"
						);
					});
				});
		}
		function switchFromNewToOld() {
			return open(__dirname, "test/tmp/multiple_versions/api/index.html")
				.then(function(browser) {
					var select = browser.window.document.getElementsByTagName(
							"select"
						)[0],
						$ = browser.window.$;

					$(select).val("3.0.0");
					select.dispatchEvent(new browser.window.Event("change"));
					return browser;
				})
				.then(function(browser) {
					return waitFor(browser, function(window) {
						return window.location.href.includes(
							"test/tmp/multiple_versions/3.0.0/api/index.html"
						);
					});
				});
		}
		function checkOldToNew() {
			return open(
				__dirname,
				"test/tmp/multiple_versions/3.0.0/api/index.html"
			)
				.then(function(browser) {
					var select = browser.window.document.getElementsByTagName(
							"select"
						)[0],
						$ = browser.window.$;

					$(select).val("2.0.0");
					select.dispatchEvent(new browser.window.Event("change"));
					return browser;
				})
				.then(function(browser) {
					return waitFor(browser, function(window) {
						return window.location.href.includes(
							"test/tmp/multiple_versions/api/index.html"
						);
					});
				});
		}

		return rmdir(path.join(tmpPath, "multiple_versions"))
			.then(function() {
				return configured.generateProject({
					path: __dirname + "/test/multiple_versions"
				});
			})
			.then(switchFromOldToOld)
			.then(switchFromNewToOld)
			.then(checkOldToNew);
	});

	it(".generateProject is able to build when passed a version's branch name", function() {
		return rmdir(path.join(tmpPath, "multiple_versions"))
			.then(function() {
				return configured.generateProject(
					{ path: __dirname + "/test/multiple_versions" },
					undefined,
					{ only: [{ name: "master" }] }
				);
			})
			.then(function() {
				return open(
					__dirname,
					"test/tmp/multiple_versions/api/index.html"
				);
			})
			.then(function() {
				assert.ok(true, "page built and opened");
			});
	});

	it(".generateProject is able to build something without a documentjs.json", function() {
		return rmdir(path.join(__dirname, "test", "docs"))
			.then(function() {
				return configured.generateProject({
					path: __dirname + "/test/no_config"
				});
			})
			.then(function() {
				return Promise.all([
					pathExists(
						path.join(__dirname, "test", "docs", "Ignored.html")
					),
					pathExists(
						path.join(__dirname, "test", "docs", "index.html")
					)
				]);
			});
	});

	it("sites can be on projects", function() {
		return rmdir(path.join(tmpPath, "project_sites"))
			.then(function() {
				return configured.generateProject({
					path: __dirname + "/test/project_sites"
				});
			})
			.then(function() {
				return pathExists(
					path.join(tmpPath, "project_sites", "api", "index.html")
				);
			})
			.then(function() {
				var deferred = Q.defer();

				pathExists(
					path.join(tmpPath, "project_sites", "docs", "index.html")
				)
					.then(function() {
						deferred.reject(
							new Error(
								"test/tmp/project_sites/docs/index.html exists"
							)
						);
					})
					.catch(function() {
						deferred.resolve();
					});
			});
	});

	it("is able to change where versions is located", function() {
		return rmdir(path.join(tmpPath, "version_placement"))
			.then(function() {
				return configured.generateProject({
					path: __dirname + "/test/version_placement"
				});
			})
			.then(function() {
				return open(
					__dirname,
					"test/tmp/version_placement/1.0.0/api/index.html"
				);
			})
			.then(function(browser) {
				var option = browser.window.document.getElementsByTagName(
					"option"
				)[0];

				assert.equal(
					option.text || option.textContent,
					"Project 1.0.0"
				);
			});
	});

	it("is able to import other tags", function() {
		return rmdir(path.join(tmpPath, "custom_tags"))
			.then(function() {
				return configured.generateProject({
					path: __dirname + "/test/custom_tags"
				});
			})
			.then(function() {
				return open(__dirname, "test/tmp/custom_tags/index.html");
			})
			.then(function checkDocObjectHasReturns(browser) {
				var rets = browser.window.document.getElementsByClassName(
					"returns"
				);
				assert.ok(rets.length, "has a returns object");
			});
	});

	it(".getProject is able to get a github url and npm install package.json's docDependencies", function() {
		return rmdir(path.join(__dirname, "test", "tmp"))
			.then(function() {
				return configured.getProject({
					source:
						"git://github.com/documentjs/docjs-test-npm-dev-deps#master",
					path: __dirname + "/test/tmp/docjs-test-npm-dev-deps"
				});
			})
			.then(function() {
				return pathExists(
					path.join(
						tmpPath,
						"docjs-test-npm-dev-deps",
						"node_modules",
						"can-set",
						"package.json"
					)
				);
			});
	});
});
