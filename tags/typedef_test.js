steal('./typedef.js','./param.js','./return',"./option.js",'funcunit/qunit',function(typedef, param,returns, option){
	
	
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
	
	
	test("function typedef followed by params",function(){
		
		var obj = {};
		var docMap = {Foo: {name: "Foo", type: "constructor"}}
		typedef.add.call(obj,"@typedef {function(String):Number} func(name) functionjunction",null,docMap.Foo, docMap );
		param.add.call(obj,"@param {String} name DESCRIPTION",null,docMap.Foo, docMap );
		returns.add.call(obj,"@return {Number} RET DESCRIPTION",null,docMap.Foo, docMap );
		
		delete obj._curParam;
		delete obj._curReturn;
		deepEqual(obj,{
			name: "func",
			title: "functionjunction",
			type: "typedef",
			types: [{
				type: "function", 
				constructs: undefined,
				context: undefined,
				params:[{
		          "description": "DESCRIPTION",
		          "name": "name",
		          "types": [
		            {
		              "type": "String"
		            }
		          ]
		        }],
		        returns: {
		        	description: "RET DESCRIPTION",
		        	types: [
		        		{
		        			
		        			type: "Number"
		        			
		        		}
		        	]
		        }
			}]
		})
		
	})

	test("@option on a typedef with a template", function(){
		var obj = {};
		var docMap = {}
		typedef.add.call(obj,"@typedef {{hash:Object}} helperOptions",null,null, docMap );
		option.add.call(obj,"@option {Object.<String,Number>} hash",null,null, docMap );
		
		deepEqual(obj, {
			type: "typedef",
			title: '',
			name: "helperOptions",
			types: [{
				type: "Object",
				options: [{
					name: "hash",
					description: "",
					types: [{
						type: "Object",
						template: [
							{types: [{type: "String"}]},
							{types: [{type: "Number"}]}]
					}]
				}]
			}]
		});
		
		
	})
})
