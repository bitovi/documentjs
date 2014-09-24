var ret = require("./return"),
	assert = require("assert");
	
describe("documentjs/lib/tags/return",function(){
	
	it("@return",function(){
		var obj = {}
		ret.add.call(obj,"@return {String} a description");
		
		assert.deepEqual(obj.returns,{
			description: "a description",
			types: [{type: "String"}]
		});
	});
	
	
});
