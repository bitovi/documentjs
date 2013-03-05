steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js',function(getParent, tnd) {
	/**
	 * @constructor documentjs/tags/static @static
	 * @parent DocumentJS
	 */
	return {
		add: function(line, curData, scope, docMap){
			if(scope){
				
				var parentAndName = getParent.andName({
					parents: ["constructor","function"],
					useName: ["constructor","function"],
					scope: scope,
					docMap: docMap,
					name: "static"
				});
				
				this.type= "static";
				this.name= parentAndName.name;
				this.parent= parentAndName.parent;
				return ['scope',this]
			}
			
		}
	}
})
