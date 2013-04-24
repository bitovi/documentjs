var generate = require('../lib/generator');

module.exports = function(grunt) {
	var _ = grunt.util._;

	grunt.registerMultiTask('generate', 'Generates documentation', function() {
		var done = this.async();
		console.log(this.options());
		done();
	});
}