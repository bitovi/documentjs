steal('./return.js','funcunit/qunit',function(ret){
	
	
	module("documentjs/tags/return")
	
	test("@return",function(){
		var obj = {}
		ret.add.call(obj,"@return {String} a description");
		
		deepEqual(obj.returns,{
			description: "a description",
			types: [{type: "String"}]
		})
	});
	
	
})
