var assert = require('assert');
var demo = require('./demo');

describe("documentjs/lib/tags/demo", function(){

	var obj;

	beforeEach(function(){
		obj = { body: '' };
	});

	it("basic add with demo source",function(){
		demo.add.call(obj,"@demo path/to/demo");

		assert(obj.body.match(/data-demo-src=\"path\/to\/demo\"/),
			'generated html should include data-demo-src attribute');
	});

	it("basic add with demo source and height", function(){
		demo.add.call(obj,"@demo path/to/demo 400");

		assert(obj.body.match(/data-demo-src=\"path\/to\/demo\"/),
			'generated html should include data-demo-src attribute');

		assert(obj.body.match(/data-demo-height=\"400\"/),
			'generated html should include data-demo-height attribute');
	});

	it("basic add with demo source and jsbin flag", function(){
		demo.add.call(obj,"@demo path/to/demo +jsbin");

		assert(obj.body.match(/data-demo-src=\"path\/to\/demo\"/),
			'generated html should include data-demo-src attribute');

		assert(obj.body.match(/data-jsbin-link="true"/),
			'generated html should include data-jsbin-link attribute');
	});

	it("basic add with demo source height, and jsbin flag", function(){
		demo.add.call(obj,"@demo path/to/demo 400 +jsbin");

		assert(obj.body.match(/data-demo-src=\"path\/to\/demo\"/),
			'generated html should include data-demo-src attribute');

		assert(obj.body.match(/data-demo-height=\"400\"/),
			'generated html should include data-demo-height attribute');

		assert(obj.body.match(/data-jsbin-link="true"/),
			'generated html should include data-jsbin-link attribute');
	});
});
