

var getRenderer = require('./get_renderer'),
	getPartials = require('./get_partials'),
	build = require("./build"),
	assert = require('assert'),
	Q = require('q'),
	path = require('path');
	
describe("documentjs/lib/generators/html/build",function(){
	
	it("get_renderer and get_partial work",function(done){
		Q.all([
			getRenderer('documentjs/lib/generators/html/build/test/templates'),
			getPartials('documentjs/lib/generators/html/build/test/templates')
		]).then(function(results){

			var renderer = results[0];
			
			var result = renderer({subject: "World"});
			
			assert.equal(result, "<html><h1>Hello World</h1></html>")
			done();
		},done).catch(done);
	});
	
	it("build.renderer build.templates build.helpers",function(done){
		var options = {
			templates: path.join(__dirname,"test","templates_with_helpers"),
			dest: "XXXXYYYZZZ",
			forceBuild: true
		};
		buildTemplatesPromise = build.templates(options);
		
		var data = {subject: "World", message: "hello"};
		var getCurrent = function(){
			return data;
		};
		
		
		Q.all([
			build.renderer(buildTemplatesPromise, options),
			build.helpers(buildTemplatesPromise, {}, options, getCurrent)
		]).then(function(results){

			var renderer = results[0];
			
			var result = renderer({subject: "World"});
			
			assert.equal(result, "<html><h1>HELLO World</h1></html>")
			done();
		},done).catch(done);
		
	});

});
