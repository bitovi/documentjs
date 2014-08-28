var getVersion = require("../get"),
	assert = require("assert"),
	path = require("path"),
	fs = require("fs");

describe("versions/get", function(){
	it("is able to get a github url", function(done){
		this.timeout(10000);
		getVersion("git://github.com/bitovi/comparify#master",__dirname+"/tmp").then(function(){
			fs.exists(
				path.join(__dirname, "tmp" , "comparify"),
				function(exists){
					assert.ok(exists, "comparify exists");
					done();
				});
		},done);
	});
	
	it("is able to get a folder", function(done){
		this.timeout(10000);
		getVersion(__dirname+"/example_project",__dirname+"/tmp").then(function(){
			fs.exists(
				path.join(__dirname, "tmp" , "example_project"),
				function(exists){
					assert.ok(exists, "example_project exists");
					done();
				});
		},done);
	});
	
});


