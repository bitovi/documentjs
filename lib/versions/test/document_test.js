var documentVersion = require("../document"),
	assert = require("assert"),
	path = require("path"),
	fs = require("fs"),
	Browser = require("zombie"),
	connect = require("connect"),
	rmdir = require('rimraf');


var find = function(browser, property, callback, done){
	var start = new Date();
	var check = function(){
		if(browser.window && browser.window[property]) {
			callback(browser.window[property]);
		} else if(new Date() - start < 2000){
			setTimeout(check, 20);
		} else {
			done("failed to find "+property);
		}
	};
	check();
};
var waitFor = function(browser, checker, callback, done){
	var start = new Date();
	var check = function(){
		if(checker(browser.window)) {
			callback(browser.window);
		} else if(new Date() - start < 2000){
			setTimeout(check, 20);
		} else {
			done(new Error("checker was never true"));
		}
	};
	check();
};


var open = function(url, callback, done){
	var server = connect().use(connect.static(path.join(__dirname))).listen(8081);
	var browser = new Browser();
	browser.visit("http://localhost:8081/"+url)
		.then(function(){
			callback(browser, function(){
				server.close();
			})
		}).catch(function(e){
			server.close();
			done(e)
		});
};


describe("versions/document", function(){
	it("is able to read the documentjs.json without versions and build a site", function(done){
		this.timeout(10000);
		rmdir(path.join(__dirname,"api"), function(e){
			if(e) {
				done(e);
			}
			
			documentVersion(__dirname+"/example_project").then(function(){
					if(fs.existsSync(path.join(__dirname,"api","index.html"))) {
						done();
					} else {
						done(new Error("api/index.html does not exist"));
					}
				},done);
		});
		
		
	});
	
	it.only("is able to document multiple versions", function(done){
		// switch from old to old
		var check1 = function(next, done){
			open("tmp/multiple_versions/1.0.0/api/index.html",function(browser, close){
				var select = browser.window.document.getElementsByTagName("select")[0],
					$ = browser.window.$;
					$(select).val("3.0.0").trigger("change");
				
					waitFor(browser, function(window){
						return window.location.href == "http://localhost:8081/tmp/multiple_versions/3.0.0/api/index.html"
					}, function(){
						assert.ok(true,"updated page");
						close();
						next();
					}, close);

			},done);
		};
		// switch from new to old
		var check2 = function(next, done){
			open("tmp/multiple_versions/api/index.html",function(browser, close){
				var select = browser.window.document.getElementsByTagName("select")[0],
					$ = browser.window.$;
					$(select).val("3.0.0").trigger("change");
				
					waitFor(browser, function(window){
						return window.location.href == "http://localhost:8081/tmp/multiple_versions/3.0.0/api/index.html"
					}, function(){
						assert.ok(true,"updated page");
						close();
						next();
					}, close);

			},done);
		};
		// check old to new
		var check3 = function(next, done){
			open("tmp/multiple_versions/3.0.0/api/index.html",function(browser, close){
				var select = browser.window.document.getElementsByTagName("select")[0],
					$ = browser.window.$;
					$(select).val("2.0.0").trigger("change");
				
					waitFor(browser, function(window){
						return window.location.href == "http://localhost:8081/tmp/multiple_versions/api/index.html"
					}, function(){
						assert.ok(true,"updated page");
						close();
						next();
					}, close);

			},done);
		};
		
		this.timeout(60000);
		rmdir(path.join(__dirname,"tmp","multiple_versions"), function(e){
			if(e) {
				done(e);
			}
			
			documentVersion(__dirname+"/multiple_versions").then(function(){
				check1(function(){
					check2(function(){
						check3(done, done);
					}, done);
				}, done);
			},done);
		});
	});
	
});