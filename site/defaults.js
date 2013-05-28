steal(function(){
	return {
		debug: false,
		enableSearch: true,
		parent: 'index',
		layout: 'documentjs/site/templates/page.mustache',
		docs: 'documentjs/site/templates/docs.mustache',
		root: '.',
		out: 'docs',
		page: 'docs',
		ignore: function (data) {
			return data.hide || data.type === 'script' ||
				data.type === 'static' ||
				data.type === 'prototype';
		}
	};
})