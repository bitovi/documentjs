steal('./namer.js','./typer.js','funcunit/qunit',function(namer, typer){
	
	module("documentjs/tags/helpers/namer")
	
	test("name",function(){
		same(namer.name("foo",{}),{
			name: "foo"
		});
	});
	
	test("optional",function(){
		same(namer.name("[foo]",{}),{
			name: "foo",
			optional: true
		});
	});
	
	test("optional / default", function(){
		same(namer.name("[foo=bar]",{}),{
			name: "foo",
			optional: true,
			defaultValue: "bar",
		});
	});
	
	test("function",function(){
		
		var res = typer.type("function(jQuery.Event,*...)",{})
		
		
		deepEqual(namer.name("handler(event,args)", res),
		{
			name: "handler",
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
		}
		
		);
	})
	
	test("function without corresponding types",function(){
		
		var res = typer.type("function",{})
		
		
		deepEqual(namer.name("handler(event,args)", res),
		{
			name: "handler",
			types: [{
				type: "function",
				context: undefined,
				constructs: undefined,
				params: [
					{ name: "event" },
					{ name: "args" }
				],
				returns: {types: [{type: "undefined"}] }
			}]
		}
		
		);
		
	});
	
	
	test("special characters",function(){
		same(namer.name("f\\=oo",{}),{
			name: "f=oo"
		});
		same(namer.name("\\(args\\...\\)",{}),{
			name: "(args...)"
		});
		//same(namer.name("\\...",{}),{
		//	name: "..."
		//});
	})
	
	
})
