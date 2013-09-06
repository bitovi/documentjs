steal('./option.js','./param.js','./property','./return.js','funcunit/qunit',function(option, param, property, returns){
	
	
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
	
	test("@option on a property", function(){
		
		var obj = {}
		property.add.call(obj,"@property {String|Thing} thing");
		option.add.call(obj, "@option {String} String description");
		option.add.call(obj, "@option {Thing} Thing description");
		
		deepEqual(obj,
		{
			name: "thing",
			title: "",
			type: "property",
			types: [{
				type: "String",
				description: "String description"
			},{
				type: "Thing",
				description: "Thing description"
			}]
		});
		
	})
	
	test("@option on a @return value", function(){
		
		var obj = {}
		returns.add.call(obj,"@return {Foo|Bar} ret description");
		option.add.call(obj, "@option {Foo} Foo description");
		option.add.call(obj, "@option {Bar} Bar description");
		
		
		deepEqual(obj.returns,
		{
			description: "ret description",
			types: [
				{
					type: "Foo",
					description: "Foo description"
				},
				{
					type: "Bar",
					description: "Bar description"
				}
			]
		});
		
		
	})
	
	
	
})
