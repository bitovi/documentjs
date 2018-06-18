var html = require("./html");
var assert = require("assert");
var Q = require("q");
var path = require("path");
var fs = require("fs-extra");
var cleanDocMap = require("../../process/clean_doc_map");

var readFile = Q.denodeify(fs.readFile);
var pathExists = Q.denodeify(fs.pathExists);
var rmdir = Q.denodeify(require("rimraf"));

const timeout = 5 * 1000 * 60;

describe("documentjs/lib/generators/html", function() {
	this.timeout(timeout);
	var tmpPath = path.join(__dirname, "test", "tmp");

	beforeEach(function() {
		return rmdir(tmpPath);
	});
	
	afterEach(function() {
		return rmdir(tmpPath);
	});

	it("can push out dev mode static", function() {
		return Promise.resolve()
			.then(function runHtmlGenerator() {
				var options = {
					dest: tmpPath,
					devBuild: true,
					minify: false,
					parent: "index",
					forceBuild: true,
					debug: false
				};
				var docMap = Promise.resolve(
					cleanDocMap(
						{
							index: {
								name: "index",
								type: "page",
								body: "Hello <strong>World</strong>"
							}
						},
						options
					)
				);
				return html.generate(docMap, options);
			})
			.then(function assertDevelopmentFiles() {
				return Promise.all([
					pathExists(path.join(tmpPath, "node_modules")),
					pathExists(path.join(tmpPath, "package.json")),
					pathExists(path.join(tmpPath, "fonts")),
					pathExists(path.join(tmpPath, "img")),
					pathExists(path.join(tmpPath, "styles")),
					pathExists(path.join(tmpPath, "index.html"))
				]);
			});
	});

	it("body is rendered as a mustache template prior to markdown", function() {
		return Promise.resolve()
			.then(function runHtmlGenerator() {
				var options = {
					dest: tmpPath,
					parent: "index",
					debug: false
				};
				var docMap = Promise.resolve(
					cleanDocMap(
						{
							index: {
								name: "index",
								type: "page",
								body: "Hello `{{thing.params.0.name}}`"
							},
							thing: {
								name: "thing",
								params: [{ name: "first" }]
							}
						},
						options
					)
				);
				return html.generate(docMap, options);
			})
			.then(function readIndexHtml() {
				return fs.readFile(path.join(tmpPath, "index.html"));
			})
			.then(function verifyGeneratedContent(data) {
				assert.ok(
					/<code>first<\/code>/.test(data.toString()),
					"got first"
				);
			});
	});
});
