
load('steal/rhino/rhino.js');
steal("documentjs", function(DocumentJS){
	DocumentJS('documentjs', {
		markdown : ['documentjs'],
		out: 'documentjs/docs',
		index: 'DocumentJS'
	});
});