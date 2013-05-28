steal(function(){
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
	return {
		debug: false,
		enableSearch: true,
		parent: 'canjs',
		layout: 'documentjs/templates/page.mustache',
		docs: 'documentjs/templates/docs.mustache',
		root: '.',
		out: 'docs',
		page: 'docs',
		ignore: function (data) {
			return data.hide || data.type === 'script' ||
				data.type === 'static' ||
				data.type === 'prototype';
		},
		helpers: handlebarsHelpers
	};
})