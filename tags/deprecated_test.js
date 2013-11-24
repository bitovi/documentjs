steal('./deprecated.js','funcunit/qunit',function(deprecated){
	
	
	module("documentjs/tags/option")
	
	test("@deprecated",function(){
		
		var obj = {}
		deprecated.add.call(obj,"@deprecated {2.1} a description");
		deprecated.add.call(obj, "@deprecated {2.2} another description");
		
		deepEqual(obj.deprecated,
		[
			{version: "2.1", description: "a description"},
			{version: "2.2", description: "another description"}
		]);
		
	});
	

	
})
