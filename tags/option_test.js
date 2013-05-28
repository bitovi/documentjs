steal('./option.js','./param.js','funcunit/qunit',function(option, param){
	
	
	module("documentjs/tags/option")
	
	test("@option",function(){
		
		var obj = {}
		param.add.call(obj,"@param {{name: String, foo}=} thing a description");
		option.add.call(obj, "@option name name description");
		option.add.call(obj, "@option {Bar} [foo=thing] foo description");
		option.add.call(obj, "@option {Extra} extra extra description");
		
		deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [{
				type: "Object",
				options: [
					{types: [{type: "String"}], name: "name", description: "name description" },
					{
						types: [{type: "Bar"}], 
						name: "foo", 
						description: "foo description",
						defaultValue: "thing",
						optional: true
					},
					{types: [{type: "Extra"}], name: "extra", description: "extra description" }
				]
			}]
		});
		
	});
	
	test("@option on Object",function(){
		
		var obj = {}
		param.add.call(obj,"@param {Object} thing a description");
		option.add.call(obj, "@option {String} name name description");
		option.add.call(obj, "@option {Bar} [foo=thing] foo description");
		option.add.call(obj, "@option {Extra} extra extra description");
		
		deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [{
				type: "Object",
				options: [
					{types: [{type: "String"}], name: "name", description: "name description" },
					{
						types: [{type: "Bar"}], 
						name: "foo", 
						description: "foo description",
						defaultValue: "thing",
						optional: true
					},
					{types: [{type: "Extra"}], name: "extra", description: "extra description" }
				]
			}]
		});
		
	});
	
	
	test("@option - for function",function(){
		
		var obj = {}
		param.add.call(obj,"@param {function(String,Bar)} thing(first,second) a description");
		option.add.call(obj, "@option first first description");
		option.add.call(obj, "@option second second description");
		
		deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [{
				type: "function",
				constructs: undefined,
				context: undefined,
				params: [
					{types: [{type: "String"}], name: "first", description: "first description" },
					{
						types: [{type: "Bar"}], 
						name: "second", 
						description: "second description",
					}
				],
				returns : {types: [{type: "undefined"}]}
			}]
		});
		
	});
	
})
