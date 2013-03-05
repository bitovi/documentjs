steal('./tree.js','funcunit/qunit',function(tree){
	
	module("documentjs/tags/helpers/tree")
	
	test("basics", function(){
		
		same( tree("foo"), ["foo"] );
		same( tree("(foo)"), [{type: "(", children: ["foo"], start: 0, end: 5 }]);
		
		
		same( tree("bar(foo)"), ["bar",{ type: "(", children: ["foo"], start: 3, end: 8 }]);
		
		
		same( tree("(<foo>, {bar})abc",["([,])"]), 
			[{type: "(",
			  start: 0,
			  end: 14,
			  children: [
			  	{type: "<", children: ["foo"], start: 1, end: 6 },
			  	",",
			  	" ",
			    {type: "{", children: ["bar"], start: 8, end: 13}
			  ]},
			  "abc"]);
		
		same( tree("foo",null, " "), ["foo"] );
		

		
	})
	
	
})
