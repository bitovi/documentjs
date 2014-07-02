var process = require("../lib/process/doc"),
	add = require("./add"),
	assert = require("assert");




describe("documentjs/tags/add", function(){
	var old;
	
	beforeEach(function(){
		old = process.tags;
		process.tags = {add: add};
	});
	afterEach(function(){
		process.tags = old;
	});
	
	
	
	it("basic",function(){
		
		var docMap = {Foo: {name: "Foo",type: "constructor"}};
		
		process.comment({
			comment: "@add Foo",
			docMap: docMap,
			props: {}
		}, function(newDoc, newScope){
			assert.equal(newScope, docMap.Foo);
		});
	});

});