load('steal/rhino/rhino.js');
var handlebarsHelpers = {
	makeTypesString: function (types) {
		return '';
		if (types.length) {
			// turns [{type: 'Object'}, {type: 'String'}] into '{Object | String}'
			return '{' + types.map(function (t) {
				return t.type;
			}).join(' | ') + '}';
		} else {
			return '';
		}
	},
	downloadUrl: function(download, isPlugin) {
		return '';
		if(isPlugin) {
			download = 'plugins=' + download;
		}
		// TOOO make builder URL configurable
		return 'http://bitbuilder.herokuapp.com/can.custom.js?' + download;
	},
	sourceUrl: function(src, type, line) {
		return '';
		var pkg = {},
			relative = path.relative(grunt.config('can.path'), src),
			hash = type !== 'page' && type !== 'constructor' && line ? '#L' + line : '';
		return pkg.repository.github + '/tree/v' + pkg.version + '/' + relative + hash;
	},
	testUrl: function(test) {
		return '';
		// TODO we know we're in the docs/ folder for test links but there might
		// be a more flexible way for doing this
		return '../' + test;
	}
};

steal('documentjs/generator', function (doc) {
	doc([
			'can/can.md',
			'can/construct/construct.md',
			'can/construct/construct.js',
			'can/construct/proxy/proxy.md',
			'can/construct/super/super.md',
			'can/observe/observe.md'
	], {
		debug: true,
		layout: 'documentjs/templates/page.mustache',
		docs: 'documentjs/templates/docs.mustache',
		root: '.',
		out: 'testdocs',
		helpers: handlebarsHelpers
		// package: require(__dirname + '/can/package.json'),
		// self: require(__dirname + '/package.json'),
		// helpers: handlebarsHelpers,
//		url: {
//			builderData: 'http://bitbuilder.herokuapp.com/canjs',
//			builder: 'http://bitbuilder.herokuapp.com/can.custom.js',
//			bithub: 'http://api.bithub.com/api/events/',
//			cdn: '//canjs.com/release/'
//		}
	});
});
