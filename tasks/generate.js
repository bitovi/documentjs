var generate = require('./generator');

module.exports = function(grunt) {
	var _ = grunt.util._;

	grunt.registerMultiTask('generate', 'Generates documentation', function() {
		var done = this.async();
		var options = this.options();
		var files = [];

		this.files.forEach(function(file) {
			files.push.apply(files, file.src);
			options.out = file.dest;
		});

		generate(files, options, function(error, files) {
			if(error) {
				grunt.fatal(error);
				return done(error);
			}

			files.forEach(function(f) {
				grunt.verbose.writeln(f);
			});
			done();
		});
	});
}