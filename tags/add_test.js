steal('documentjs/tags/process.js',
	'./add.js',
	'funcunit/qunit',function(process, add){
	
	module("documentjs/tags/add", {
		setup : function(){
			this.old = process.tags;
			process.tags = {add: add};
		},
		teardown : function(){
			process.tags = this.old;
		}
	})
	
	
	test("basic",function(){
		
		var docMap = {Foo: {name: "Foo",type: "constructor"}};
		
		process.comment({
			comment: "@add Foo",
			docMap: docMap,
			props: {},
		}, function(newDoc, newScope){
			equals(newScope, docMap.Foo)
		})
	})
})
