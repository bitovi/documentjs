var assert = require("assert");
var npm = require("./npm");

describe("npm utility", function(){
	describe("npm.install", function(){
		beforeEach(function(){
			this.runCommand = npm.runCommand;
		});

		afterEach(function(){
			npm.runCommand = this.runCommand;
		});

		it("Runs the right command to install", function(){
			npm.runCommand = function(args){
				assert.equal(args[0], "install", "calling install");
				assert.equal(args[1], "foobar", "installing foobar");
			};

			npm.install("foobar");
		});

		it("Runs the right command to install a version", function(){
			npm.runCommand = function(args){
				assert.equal(args[0], "install", "calling install");
				assert.equal(args[1], "foobar@^2.0.0", "installing foobar");
			};

			npm.install("foobar", "^2.0.0");
		});
	});
});
