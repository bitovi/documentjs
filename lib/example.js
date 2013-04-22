//var DocumentJS = require('./node');
//
//DocumentJS('documentjs', {
//	markdown : ['documentjs'],
//	out: 'documentjs/docs',
//	index: 'DocumentJS'
//});

var documentjs = require('./document.js');
var _ = require('underscore');

var transform = function(data) {
	var transformed = [];
	var findParent = function(children, parent) {
		var result = null;
		_.each(children, function(obj) {
			if(obj.name === parent) {
				result = obj;
				return;
			}
			if(obj.children && obj.children.length) {
				result = findParent(obj.children, parent);
			}
		});

		return result;
	}

	_.each(_.values(data), function(value) {
		if(value.type === 'script') {
			return;
		}

		var parent = findParent(transformed, value.parent);
		if(!parent) {
			return transformed.push(value);
		}
		if(!parent.children) {
			parent.children = [];
		}

		if(value.type !== 'script') {
			parent.children.push(value);
		}
	});

	return transformed;
}

documentjs(['../can/can.md', '../can/construct/construct.md', '../can/construct/construct.js',
'../can/construct/proxy/proxy.md' ], function(error, data, search) {
	var result = transform(data);
	console.log(JSON.stringify(result));
});
