steal("./param.js",'funcunit/qunit',function(param){
	
	module("documentjs/tags/param");
	
	
	
	test("google's types",function(){
		var obj = {}
		param.add.call(obj,"@param {boolean} name")
		equal(obj.params[0].types[0].name,"boolean")
		
		testParamTypes("@param {boolean} name",[{name: }])
		
	})
	
	// {function(string, boolean)} handler(foo, bar)
	
	
	// 
})
