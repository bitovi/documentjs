steal('./param.js','funcunit/qunit',function(param){
	
	module("documentjs/tags/params")
	
	test("@params - basic", function(){
		
		var obj = {}
		param.add.call(obj,"@param {boolean} name")
		equal(obj.params[0].types[0].type,"boolean")
		equal(obj.params[0].name,"name")
		
	})
	
	test("@params - function",function(){
		
		var obj = {}
		param.add.call(obj,"@param {function(jQuery.Event,*...)} handler(event,args) a description");

		deepEqual(obj.params[0],
		{
			name: "handler",
			description: "a description",
			types: [{
				type: "function",
				context: undefined,
				constructs: undefined,
				params: [
					{types: [{type: "jQuery.Event"}], name: "event" },
					{types: [{type: "*"}], variable: true, name: "args" }
				],
				returns: {types: [{type: "undefined"}] }
			}]
		});
	})
	
	test("@params - object",function(){
		
		var obj = {}
		param.add.call(obj,"@param {{name: String, foo}=} thing a description");
		
		deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [{
				type: "Object",
				options: [
					{types: [{type: "String"}], name: "name" },
					{name: "foo" }
				]
			}]
		});
			
	});
	
	
})
