steal('./typeNameDescription.js','funcunit/qunit',function(tnd){
	
	module("documentjs/tags/helpers/typeNameDescription");
	
	test("has a function in it", function(){
		
		var res = tnd("@constructor documentjs/tags/function @function");
		
		equal(res.name, "documentjs/tags/function")
		
	});
	
	test("ignore name", function(){
		var res = tnd("@constructor {Type} description", true);
		
		equal(res.description, "description")
	})
	
	/*test("has a function in it", function(){
		
		var res = tnd("@param {String} \... description");
		deepEqual(res,{
			types: [{name: "String"}],
			name: "...",
			description: "description",
			variable: true
		});
		
	})*/
	
})
