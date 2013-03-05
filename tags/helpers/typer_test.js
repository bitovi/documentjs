steal('./typer.js','funcunit/qunit',function(typer){
	
	module("documentjs/tags/helpers/typer")
	
	test("name",function(){
		same( typer.type("can.Control"), {
			types: [{
				type: "can.Control"
			}]
		});
	});
	
	test("application",function(){
		
		same( typer.type("foo"), {
			types: [{type: "foo"}]
		}, "basic");
		
		same( typer.type("foo.<bar,car>"), {
			types: [{
				type: "foo",
				template: [
					{types: [{type: "bar"}] },
					{types: [{type: "car"}] }
				]
			}]
		}, "application");
		
		same( typer.type("Object.<String,DocProps>"), {
			types: [{
				type: "Object",
				template: [
					{types: [{type: "String"}] },
					{types: [{type: "DocProps"}] }
				]
			}]
		}, "Object.<String,DocProps>");
		
		
		
	});
	
	test("union",function(){
		same( typer.type("(can.Control|can.Model)"), {
			types: [{
				type: "can.Control"
			},{
				type: "can.Model"
			}]
		});
	})
	
	test("record",function(){
		
		same( typer.type("{myNum:number,myObject}"), {
			types: [{
				type: "Object",
				options: [
					{name: "myNum", types:[{type: "number"}]},
					{name: "myObject"}
				]
			}]
		}, "record type");
		
	});
	
	test("nullable",function(){
		same( typer.type("?can.Control"), {
			types: [{
				type: "can.Control"
			}],
			nullable: true
		});
		
		same( typer.type("?can.Control"), {
			types: [{
				type: "can.Control"
			}],
			nullable: true
		});
		
	})
	
	
	test("nonnullable",function(){
		same( typer.type("!can.Control"), {
			types: [{
				type: "can.Control"
			}],
			nonnull: true
		});
	});
	
	test("function",function(){
		
		same( typer.type("function(this:foo,new:bar,string):number"), {
			types: [{
				type: "function",
				context: {types: [{type: "foo"}] },
				constructs: {types: [{type: "bar"}] },
				params: [
					{types: [{type: "string"}] }
				],
				returns: {types: [{type: "number"}] }
			}]
		}, "function");
		
		
		same( typer.type("function( this:foo, new:bar, string ) :number "), {
			types: [{
				type: "function",
				context: {types: [{type: "foo"}] },
				constructs: {types: [{type: "bar"}] },
				params: [
					{types: [{type: "string"}] }
				],
				returns: {types: [{type: "number"}] }
			}]
		}, "function with spaces");
		
	});
	
	test("variable params",function(){
		same( typer.type("...can.Control"), {
			types: [{
				type: "can.Control"
			}],
			variable: true
		});
	})
	
	test("variable params",function(){
		same( typer.type("...can.Control"), {
			types: [{
				type: "can.Control"
			}],
			variable: true
		});
	});

	
	test("variable params",function(){
		
		same( typer.type("function(...can.Observe){}"), {
			types: [{
				type: "function",
				constructs: undefined,
				context: undefined,
				returns: {types: [{type: "undefined"}]},
				params: [
					{types: [{type: "can.Observe"}], variable: true}
				]
			}],
		});
		
	});
	
	// NON-STANDARD types ...
	test("optional",function(){
		same( typer.type("can.Control="), {
			types: [{
				type: "can.Control"
			}],
			optional: true
		});
	});
	
	test("optional / default", function(){
		same( typer.type("context=foo"), {
			types: [{
				type: "context"
			}],
			defaultValue: {type: "foo"},
			optional: true
		});
	});
	
	test("parenthesis-less union", function(){
		same( typer.type("can.Control|can.Model"), {
			types: [{
				type: "can.Control"
			},{
				type: "can.Model"
			}]
		});
	})
	
	test("parenthesis-less union with function", function(){
		same( typer.type("function|can.Model"), {
			types: [{
				type: "function",
				type: "function",
				constructs: undefined,
				context: undefined,
				returns: {types: [{type: "undefined"}]},
				params: []
			},{
				type: "can.Model"
			}]
		});
	})
	
	
})
