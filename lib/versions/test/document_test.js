var documentVersion = require("../document"),
	assert = require("assert"),
	path = require("path"),
	fs = require("fs");

describe("versions/document", function(){
	it("is able to read the documentjs.json and build a site", function(done){
		documentVersion(
			__dirname+"/example_project",
			"0.0.1",
			{
				sourceDest: path.join(__dirname,"tmp","<%=version%>")
			}).then(function(){
				
				done();
				
			},done);
	});
	
});