var processDoc = require("./doc"),
	tnd = require("../../tags/helpers/typeNameDescription"),
	getParent = require("../../tags/helpers/getParent"),
	assert = require("assert");
	
	
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
	
	describe("documentjs/lib/process/doc", function(){
		var old;
		
		beforeEach(function(){
			old = processDoc.tags
			processDoc.tags = {}
		});
		afterEach(function(){
			processDoc.tags = old;
		});
		
		it("adds to parent",function(){
			processDoc.tags.property = propertyTag;
			var docMap = {Foo: {name: "Foo",type: "constructor"}};
			
			processDoc.comment({
				comment: "@property {Object} tags Tags for something",
				scope: docMap.Foo,
				docMap: docMap,
				props: {}
			},function(newDoc, newScope){
				assert.equal(newScope, docMap.Foo, "same scope scope")
				assert.equal(newDoc.name, "Foo.tags")
			});
		});
		
			
				
		
		it("change scope", function(){
			processDoc.tags.constructor = {
				add : function(){
					this.name = "constructed"
					this.type = "constructor"
					return ["scope",this]
				}
			};
			processDoc.tags.parent = {
				add: function(){
					this.parent = "parented"
				}
			};
			var docMap = {Foo: {name: "Foo",type: "constructor"}},
				props = {};
			
			processDoc.comment({
				comment:   ["@constructor",
							"@parent tang"],
				scope: docMap.Foo,
				docMap: docMap,
				props: props,
			},function(newDoc, newScope){
				assert.equal(newDoc, newScope, "new doc item is new scope");
				assert.equal(newDoc, props, "props is the new doc item")
				
				assert.deepEqual(newDoc,{
					name: "constructed",
					type: "constructor",
					parent: "parented",
					body: "",
					description: ""
				});
			});
			
		});
		
		it("code",function(){
			processDoc.tags.constructor = {
				codeMatch: /some constructor/,
				code: function(code, scope, objects){
					return {
						type: "constructor",
						name: "Bar"
					}
				},
				codeScope: true
			};
			processDoc.tags.property = propertyTag;
			var docMap = {Foo: {name: "Foo",type: "constructor"}}
			processDoc.code({
				code: "some constructor",
				docMap: docMap,
				scope: docMap.Foo
			}, function(constructorDoc, constructorScope){
				assert.equal(constructorDoc, constructorScope, "scope is the constructor")
				
				processDoc.code({
					code: "prop = 'something'",
					scope: constructorScope,
					docMap: docMap
				}, function(propDoc, propScope){
					assert.equal(propScope, constructorScope, "prop doesn't change scope")
					assert.equal(propDoc.name,"Bar.prop");
					assert.equal(propDoc.parent,"Bar");
					
				});
				
			});
		});
		
		var makeDescription = function( comment, cb ){
			var docMap = {Foo: {name: "Foo",type: "constructor"}},
				props = {};
			
			processDoc.tags.constructor = {
				add : function(){
					this.name = "constructed";
				}
			};
			
			processDoc.comment({
				comment:   comment,
				scope: docMap.Foo,
				docMap: docMap,
				props: props,
			},cb);
		};
		
		
		it("description",function(){
			
			makeDescription(
				["This is a description.",
				 "Another line."], function(newDoc){
					assert.equal(newDoc.description, "This is a description.\nAnother line.\n")
			});
	
		});
		
		
		it("description then body",function(){
			
			makeDescription(
				["This is a description.",
				 "Another line.",
				 "",
				 "the body"], function(newDoc){
					assert.equal(newDoc.description, "This is a description.\nAnother line.\n");
					
					assert.equal(newDoc.body, "\nthe body\n");
			});
	
		});

		
		
	});
