steal('./typedef.js','funcunit/qunit',function(typedef){
	
	
	module("documentjs/tags/typedef")
	
	test("basic",function(){
		
		var obj = {};
		var docMap = {Foo: {name: "Foo", type: "constructor"}}
		typedef.add.call(obj,"@typedef {{}} name title",null,docMap.Foo, docMap );
		
		deepEqual(obj,{
			name: "name",
			title: "title",
			type: "typedef",
			types: [{type: "Object", options: []}]
		})
		
	})
	
	
	

	
})
