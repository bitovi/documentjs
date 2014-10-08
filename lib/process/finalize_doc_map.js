// for each tag that has a .done method, calls it on every item in the docMap
module.exports = function(docMap, tags){
	var dones = [];
	for ( var tag in tags ) {
		if ( tags[tag].done ) {
			dones.push(tags[tag].done);
		}
	}
	for( var name in docMap) {
		dones.forEach(function(done){
			done.call(docMap[name]);
		});
	}
};
