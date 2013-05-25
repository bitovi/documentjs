steal('./function.js','./option.js','funcunit/qunit',function(func, option){
	
	
	module("documentjs/tags/function")
	
	test("basic add",function(){
		
		var obj = {};
		var docMap = {Foo: {name: "Foo", type: "constructor"}}
		func.add.call(obj,"@function bar title",null,docMap.Foo, docMap );
		
		deepEqual(obj,{
			name: "bar",
			type: "function",
			title: "title",
		})
		
	})
	
	test("codeMatch", function(){
		ok(func.codeMatch.test("Thing = function(){}"));
		ok(func.codeMatch.test("Thing: function(){}"));
		ok(!func.codeMatch.test("foo: bar"))
	});
	
	test("code",function(){
		
		deepEqual(func.code("method: function(arg1, arg2){"),{
			name: "method",
			params: [
				{name: "arg1", types: [{type: "*"}]},
				{name: "arg2", types: [{type: "*"}]}
			],
			type: "function"
		})
		
	});
	
	test("code with scope",function(){
		
		var docMap = {Foo: {name: "Foo", type: "constructor"}}
		
		deepEqual(func.code("method: function(arg1, arg2){", docMap.Foo, docMap),{
			name: "Foo.method",
			params: [
				{name: "arg1", types: [{type: "*"}]},
				{name: "arg2", types: [{type: "*"}]}
			],
			type: "function",
			parent: "Foo"
		})
		
	})
	

	
})
