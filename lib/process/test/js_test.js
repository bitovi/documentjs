var processJS = require("../js"),
	assert = require("assert"),
	fs = require("fs"),
	comparify = require("comparify");


var processWithJS = function(name, done){
	fs.readFile(__dirname+"/src/"+name+".js", function(err, source){
		if(err) {
			assert.fail(err, null, "reading "+__dirname+"/src/"+name+".js failed");
		}
		var res = processJS(source.toString(),name+".js");
		
		assert.ok(res, "got back a value");
		
		fs.readFile(__dirname+"/src/"+name+".json", function(err, resultSource){
			if(err) {
				assert.fail(err, null, __dirname+"/src/"+name+".json");
			}
			var resultJSON = JSON.parse(resultSource);
			comparify(res, resultJSON);
			done()
		});
	});
};

processWithJS("export")
