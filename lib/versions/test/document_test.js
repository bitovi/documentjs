var documentVersion = require("../document"),
	assert = require("assert"),
	path = require("path"),
	fs = require("fs"),
	rmdir = require('rimraf');

describe("versions/document", function(){
	it("is able to read the documentjs.json and build a site", function(done){
		rmdir(path.join(__dirname,"api"), function(e){
			if(e) {
				done(e);
			}
			
			documentVersion(
				__dirname+"/example_project",
				"0.0.1",
				{
					sourceDest: path.join(__dirname,"tmp","<%=version%>")
				}).then(function(){
					console.log("checking!!")
					if(fs.existsSync(path.join(__dirname,"api","index.html"))) {
						done();
					} else {
						done(new Error("api/index.html does not exist"));
					}
					
					
					
				},done);
		});
		
		
	});
	
});