steal('./property.js','./option.js','./process','funcunit/qunit',function(property, option,process){
	
	
	module("documentjs/tags/property")
	
	test("basic add",function(){
		
		var obj = {};
		var docMap = {Foo: {name: "Foo", type: "constructor"}}
		property.add.call(obj,"@property {Object} bar a description",null,docMap.Foo, docMap );
		
		deepEqual(obj,{
			name: "bar",
			type: "property",
			types: [{type: "Object", options: []}],
			title: "a description",
		})
		
	})
	
	test("codeMatch", function(){
		ok(property.codeMatch("foo = 'bar'"));
		ok(property.codeMatch("foo: 'bar'"));
		ok(!property.codeMatch("foo: function(){}"))
	});
	
	test("options on property", function(){
		var obj = {};
		var docMap = {Foo: {name: "Foo", type: "constructor"}}
		property.add.call(obj,"@property {{}} bar a description",null,docMap.Foo, docMap );
		option.add.call(obj,"@option {String} thing thing's description")
		
		deepEqual(obj,{
			name: "bar",
			type: "property",
			types: [{
				type: "Object",
				options: [
					{name: "thing", types: [{type: "String"}], description: "thing's description"}
				]
			}],
			title: "a description"
		})
	})
	
	test("options code and scope", function(){
		
		var docMap = {Foo: {name: "Foo", type: "constructor"}};
		
		var obj = property.code("bar = {}", docMap.Foo, docMap)
		
		property.add.call(obj,"@property",null,docMap.Foo, docMap );
		
		equal(obj.name, "Foo.bar")
		
	})
	
	test("process", function(){
		process.tags.property = property;
		
		
		var docMap = {Foo: {name: "Foo", type: "constructor"}};
		
		process.codeAndComment({
			code: "foo: 2",
			comment: ["@property","this is my comment"],
			docMap: docMap,
			scope: docMap.Foo
		}, function(newDoc, newScope){
			equal(newScope, docMap.Foo, "scope is foo correctly");
			equal(newDoc.name,"Foo.foo")
		})
	})
	
})
