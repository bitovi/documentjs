steal(function(){
	
	/**
	 * @function getParent
	 * @param {Array.<String>} types 
	 * @param {DocProps} scope
	 * @param {Object.<String,DocProps>} objects
	 */
	var getParent = function(types, scope, objects){
		if(types === "*"){
			return scope;
		}
		while ( scope && scope.type && types.indexOf(scope.type) == -1 ) {
			scope = objects[scope.parent];
		}
		return scope;
	}
	
	/**
	 * @function andName
	 * @param {{}} options
	 * @option {Array|String} parents Allowable parents
	 * @option {Array.<String>} useName use the name if parent is one of these items
	 * @option {DocProps} scope
	 * @option {DocMap} docMap
	 * @option {String} name
	 * 
	 */
	getParent.andName = function(options){
		var parent = getParent(options.parents, options.scope, options.docMap);
		if(!parent) {
			return {name: options.name, parent: null}
		} else {
			if(options.useName.indexOf(parent.type) >= 0) {
				return {
					name: parent.name + "." + options.name,
					parent: parent.name
				}
			} else {
				return {
					name: options.name,
					parent: parent.name
				}
			}
		}
	}
	
	return getParent;
})
