var generate = require("../generate");
var assert = require("assert");
var path = require("path");
var slash = require("../../slash");
var Q = require("q");

// test helpers
var find = require("../../../test/find");
var open = require("../../../test/open");

var rmdir = Q.denodeify(require("rimraf"));

describe("documentjs/lib/generate/generate", function() {
	this.timeout(5 * 1000 * 60);

	after(function() {
		return rmdir(path.join(__dirname, "out"));
	});

	it("works", function() {
		return rmdir(path.join(__dirname, "out"))
			.then(function() {
				return generate({
					glob: slash(path.join(__dirname, "example")) + "/*.js",
					dest: path.join(__dirname, "out"),
					parent: "mylib",
					forceBuild: true,
					minifyBuild: false
				});
			})
			.then(function() {
				return open(__dirname, "out/Foo.html");
			})
			.then(function(browser) {
				var code = browser.window.document.getElementsByTagName(
					"code"
				)[0];

				assert.ok(
					/prettyprinted/.test(code.className),
					"code blocks added"
				);
			});
	});

	it("@outline works", function() {
		return Promise.resolve()
			.then(function() {
				return generate({
					glob: path.join(__dirname, "example", "*.js"),
					dest: path.join(__dirname, "out"),
					parent: "mylib",
					forceBuild: true,
					minifyBuild: false
				});
			})
			.then(function() {
				return open(__dirname, "out/index.html");
			})
			.then(function(browser) {
				var code = browser.window.document.getElementsByClassName(
					"contents"
				)[0];
				var lis = code.getElementsByTagName("li");
				assert.equal(lis.length, 5, "outline added " + lis.length);
			});
	});
});
