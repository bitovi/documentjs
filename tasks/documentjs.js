var configured = require("../lib/configured/configured");

module.exports = function(grunt) {
	var _ = grunt.util._;

	grunt.registerTask('documentjs', 'Generates documentation', function(only) {
		var done = this.async();
		var options = {};
		if(arguments.length) {
			options.only = [].slice.call(arguments).map(function(name){
				return {name: name};
			});
		}
		var docConfig = grunt.config.get(this.name);
		options.debug = true;
		configured.generateProject({
			path: process.cwd(),
			docConfig: docConfig
		}, undefined, options)
			.then(done,function(err){
				console.log(err);
				done(err);
			});
		
	});
};