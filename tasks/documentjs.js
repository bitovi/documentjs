var configured = require("../lib/configured/configured");

module.exports = function(grunt) {
	var _ = grunt.util._;

	grunt.registerTask('documentjs', 'Generates documentation', function(only) {
		var done = this.async();
		var options = {};
		if(arguments.length) {
			options.only = [].slice.call(arguments);
		}
		
		configured.generateProject({
			path: process.cwd(),
			docObject: this.data
		}, undefined, options)
			.then(done,done);
		
	});
};