var process = require("../process/process"),
	_default = require("./_default"),
	assert = require("assert");




describe("documentjs/lib/tags/_default", function(){
	
	it("basic",function(){
		
		var docMap = {Foo: {name: "Foo",type: "constructor"}};
		
		process.comment({
			comment: "@foo bar",
			docMap: docMap,
			docObject: {},
			tags: {_default: _default}
		}, function(newDoc, newScope){
			assert.equal(newDoc.foo, "bar");
		});
	});
	
	it("doesn't overwrite name", function(){
		
	});
	
	

});