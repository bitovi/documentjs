steal('./tree.js','funcunit/qunit',function(tree){
	
	module("documentjs/tags/helpers/tree")
	
	test("basics", function(){
		
		same( tree("foo"), [{token: "foo",start: 0, end: 3}] );
		same( tree("(foo)"), [{
			token: "(", 
			children: [{token: "foo",start: 1, end: 4}], 
			start: 0, 
			end: 5 }]);
		
	
		same( tree("bar(foo)"), [
			{token: "bar", start: 0, end:3},
			{ token: "(", start: 3, end: 8, children: [{token: "foo",start: 4, end: 7}] }]);
		
		same( tree("(<foo>, {bar})abc",["([,])"]), 
			[{token: "(",
			  start: 0,
			  end: 14,
			  children: [
			  	{token: "<", start: 1, end: 6, children: [{token: "foo",start: 2, end: 5}] },
			  	{token: ",", start: 6, end: 7},
			  	{token: " ", start: 7, end: 8},
			    {token: "{", start: 8, end: 13, children: [{token: "bar",start: 9, end: 12}]}
			  ]},
			  {token: "abc",start: 14, end: 17}]);
		
		same( tree("foo",null, " "), [{token: "foo",start: 0, end: 3}] );
		

		
	});

	test("escaping",function(){
		same( tree("fo\\(\\)o"), [{token: "fo()o", start: 0, end: 7}] );
		
		same( tree("\\(args...\\)"), [{token:"(args...)", start: 0, end: 11}])
		
		
	})
	
	
})
