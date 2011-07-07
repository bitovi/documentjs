// load('documentjs/test/run.js')

load('steal/rhino/rhino.js');

steal.then( 'steal/test','documentjs' ).then( function( s ) {
	var createStuff = function(){
		var objects = {};
		var fooBar = DocumentJS.Type.create("@class Foo.Bar","",null, objects);
		objects[fooBar.name] = fooBar;
		
		var func = DocumentJS.Type.create("@function func","",fooBar,objects);
		objects[func.name] = func;
		return objects;
	}

	
	//STEALPRINT = false;
	s.test.module("documentjs")
	
	
	s.test.test("create", function(){
		var objects = {};
		var fooBar = DocumentJS.Type.create("@class Foo.Bar","",null, objects);
		s.test.ok(fooBar, "Foo.Bar created");
		s.test.ok(!fooBar.parents, "Foo.Bar has no parents array");
		
		s.test.equals(fooBar.name, "Foo.Bar", "Foo.Bar");
		
		objects[fooBar.name] = fooBar;
		
		var func = DocumentJS.Type.create("@function func","",fooBar,objects);
		
		s.test.ok(func, "func created");
		s.test.ok(func.parents, "func has parents array");
		s.test.ok(func.parents.length == 1, "func has parents array");
		s.test.equals(func.name, "Foo.Bar.func", "Foo.Bar.func");
		s.test.equals(fooBar.children.length, 1, "Foo.Bar has a child");
	})
	
	s.test.test("mark down", function(){
		var objects = {};
		DocumentJS.Script.process("documentjs/test/page.md",objects);
		s.test.ok(objects.page, "page created");
	});
	
	s.test.test("addToSearchData" , function(){
		var objects = createStuff(),
			searchData = {};
		DocumentJS.searchData.addToSearchData(objects, searchData);
		s.test.ok(searchData["Foo.Bar"], "FooBar exists");
		
		var id = searchData["Foo.Bar"].id;
		
		s.test.ok(searchData["Foo.Bar"].id !== undefined, "FooBar has an id");
		
	})

});