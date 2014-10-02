require("./build/build_test");



var html = require("./html"),
	assert = require('assert'),
	Q = require('q'),
	path = require('path'),
	fs = require('fs'),
	rmdir = require('rimraf');
	
describe("documentjs/lib/generators/html",function(){
	it.only("can push out dev mode static", function(done){
		
		this.timeout(10000);
		rmdir(path.join(__dirname,"test","tmp"), function(e){
			if(e) {
				return done(e);
			}
			var docMap = Q.Promise(function(resolve){
				resolve({
					index: {name: "index", type: "page", body: "Hello World"}
				});
			});
			html.generate(docMap,{
				dest: path.join(__dirname, "test","tmp"),
				devBuild: true,
				minify: false,
				parent: "index",
				debug: true,
				forceBuild: true
			}).then(function(){
				if(!fs.existsSync(path.join(__dirname,"test","tmp","static","can","can.js"))) {
					done(new Error("canjs does not exist"));
				} else if(fs.existsSync(path.join(__dirname,"test","tmp","static","bundles","static.js"))) {
					done(new Error("static build exists"));
				} else {
					done();
				}
			},done);
		});
	});
});