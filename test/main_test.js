var assert = require("assert");
var docjs = require("../main.js");

describe("documentjs/main", function() {
	it("exports configured", function() {
		assert.deepEqual(
			docjs.configured,
			require("../lib/configured/configured"),
			"configured is exported"
		);
	});
	it("exports find", function() {
		assert.deepEqual(
			docjs.find,
			require("../lib/find/find"),
			"find is exported"
		);
	});
	it("exports generators", function() {
		assert.ok(
			typeof docjs.generators !== "undefined",
			"generators is exported"
		);
	});
	it("exports process", function() {
		assert.deepEqual(
			docjs.process,
			require("../lib/process/process"),
			"process is exported"
		);
	});
	it("exports tag", function() {
		assert.deepEqual(
			docjs.tag,
			require("../lib/tags/tags"),
			"tag is exported"
		);
	});
});
