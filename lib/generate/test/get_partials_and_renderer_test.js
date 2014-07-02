

var getRenderer = require('../get_renderer'),
	getPartials = require('../get_partials'),
	assert = require('assert'),
	Q = require('q');
	
describe("lib/generate/get_renderer and get_partial",function(){
	
	it("works",function(done){
		Q.all([
			getRenderer('documentjs/lib/generate/test/templates'),
			getPartials('documentjs/lib/generate/test/templates')
		]).then(function(results){

			var renderer = results[0];
			
			var result = renderer({subject: "World"});
			
			assert.equal(result, "<html><h1>Hello World</h1></html>")
			done();
		},done).catch(done);
	})

});
