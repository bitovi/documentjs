var getParent = require('./helpers/getParent'),
	tnd = require('./helpers/typeNameDescription');
	/**
	 * @constructor DocumentJS.tags.static @static
	 * @parent DocumentJS.tags
	 * @hide
	 * 
	 * Declares that [documentjs/tags/property @property] and
	 * [documentjs/tags/function @function] tags belong
	 * to the preceeding [documentjs/tags/function @constructor].
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
	module.exports = {
		add: function(line, curData, scope, docMap){
			if(scope){
				
				var parentAndName = getParent.andName({
					parents: ["constructor","function","module"],
					useName: ["constructor","function","module"],
					scope: scope,
					docMap: docMap,
					name: "static",
					title: "static"
				});
				
				this.type= "static";
				this.name= parentAndName.name;
				this.parent= parentAndName.parent;
				return ['scope',this]
			}
			
		}
	};
