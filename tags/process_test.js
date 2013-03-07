steal('documentjs/tags/process.js',
	'documentjs/tags/helpers/typeNameDescription.js',
	'documentjs/tags/helpers/getParent.js',
	'funcunit/qunit',function(process, tnd, getParent){
	
	
	var propertyTag = {
		codeMatch: function( code ) {
			return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)
		},
		code: function( code, scope, docMap ) {
			var parts = code.match(/(\w+)\s*[:=]\s*/);
			if ( parts ) {
				var parentAndName = getParent.andName({
					parents: "*",
					useName: ["constructor","static","prototype","function"],
					scope: scope,
					docMap: docMap,
					name: parts[1]
				});
				return {
					name: parentAndName.name,
					parent: parentAndName.parent,
					type: "property"
				}
			}
		},
		add: function(line, curData, scope, docMap){
			var data = tnd(line);
			this.types = data.types
			this.description = data.description;
			
			var parentAndName = getParent.andName({
				parents: "*",
				useName: ["constructor","static","prototype","function"],
				scope: scope,
				docMap: docMap,
				name: data.name
			});
			this.name = parentAndName.name;
			this.parent = parentAndName.parent;
			this.type = "property";
		},
		parentTypes: ["constructor"],
		useName: true
	}
	
	module("documentjs/tags/process", {
		setup : function(){
			this.old = process.tags
			process.tags = {}
		},
		teardown : function(){
			process.tags = this.old;
		}
	})
	
	
	test("adds to parent",function(){
		process.tags.property = propertyTag;
		var docMap = {Foo: {name: "Foo",type: "constructor"}};
		
		process.comment({
			comment: "@property {Object} tags Tags for something",
			scope: docMap.Foo,
			docMap: docMap,
			props: {},
		},function(newDoc, newScope){
			equal(newScope, docMap.Foo, "same scope scope")
			equal(newDoc.name, "Foo.tags")
		})
	});
	
	
	test("can exit on init",function(){});
	test("change scope", function(){
		process.tags.constructor = {
			add : function(){
				this.name = "constructed"
				this.type = "constructor"
				return ["scope",this]
			}
		}
		process.tags.parent = {
			add: function(){
				this.parent = "parented"
			}
		}
		var docMap = {Foo: {name: "Foo",type: "constructor"}},
			props = {};
		
		process.comment({
			comment:   ["@constructor",
						"@parent tang"],
			scope: docMap.Foo,
			docMap: docMap,
			props: props,
		},function(newDoc, newScope){
			equal(newDoc, newScope, "new doc item is new scope");
			equal(newDoc, props, "props is the new doc item")
			
			deepEqual(newDoc,{
				name: "constructed",
				type: "constructor",
				parent: "parented",
				body: "",
				description: ""
			})
		})
		
	})
	
	test("code",function(){
		process.tags.constructor = {
			codeMatch: /some constructor/,
			code: function(code, scope, objects){
				return {
					type: "constructor",
					name: "Bar"
				}
			},
			codeScope: true
		}
		process.tags.property = propertyTag;
		var docMap = {Foo: {name: "Foo",type: "constructor"}}
		process.code({
			code: "some constructor",
			docMap: docMap,
			scope: docMap.Foo
		}, function(constructorDoc, constructorScope){
			equal(constructorDoc, constructorScope, "scope is the constructor")
			
			process.code({
				code: "prop = 'something'",
				scope: constructorScope,
				docMap: docMap
			}, function(propDoc, propScope){
				equal(propScope, constructorScope, "prop doesn't change scope")
				equal(propDoc.name,"Bar.prop");
				equal(propDoc.parent,"Bar");
				
			})
			
		})
	})
})
