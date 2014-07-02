var generate = require("../generate"),
	assert = require("assert");
	rmdir = require('rimraf');

//describe("documentjs/lib/generate/generate",function(){
	
//	it("works",function(){
		rmdir(__dirname+"/out",function(error){
		
			generate(__dirname+"/example/*.js",{
				out: __dirname+"/out",
				parent: "mylib",
				forceBuild: true
			});
		
		});
		
//	});
	
//});


