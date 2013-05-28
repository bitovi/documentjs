steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js',function(getParent, tnd) {

	/**
	 * @constructor DocumentJS.tags.prototype @prototype
	 * @parent DocumentJS
	 * 
	 * Declares that [documentjs/tags/property @property] and
	 * [documentjs/tags/function @function] tags belong
	 * to the preceeding [documentjs/tags/function @constructor]'s
	 * prototype object.
	 * 
	 * @signature `@prototype`
	 * 
	 * @codestart
	 * /**
	 *  * @@constructor
	 *  * Creates an Animal
	 *  *|
	 * Animal = function(){ ... }
     * /** @@prototype *|
     * Animal.prototype = {
     *    /**
     *     * Eats another animal.
     *     *|
     *     eat: function(animal){ ... }
     * }
	 * @codeend
	 * 
	 */
	return {
		add: function(line, curData, scope, docMap){
			
			if(scope){
				
				var parentAndName = getParent.andName({
					parents: ["constructor","function"],
					useName: ["constructor","function"],
					scope: scope,
					docMap: docMap,
					name: "prototype",
					title: "static"
				});
				
				this.type= "prototype";
				this.name= parentAndName.name;
				this.parent= parentAndName.parent;
				return ['scope',this]
			}
			
		}
	}
})
