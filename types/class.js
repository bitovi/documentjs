steal.then(function() {
	/**
	 * @class DocumentJS.Type.types.class
	 * @tag documentation
	 * @parent DocumentJS.Type
	 * Documents a 'Class'. A class is typically a collection of static and prototype functions. 
	 * steal Doc can automatically detect classes created with jQuery.Class. 
	 * However, you can make anything a class with the __@class__ _ClassName_ directive.
	 * 
	 * @codestart
	 * /**
	 *  * Person represents a human with a name.  Read about the 
	 *  * animal class [Animal | here].
	 *  * @init 
	 *  * You must pass in a name.
	 *  * @params {String} name A person's name
	 *  *|
	 * Person = Animal.extend(
	 * /* @Static *|
	 * {
	 *    /* Number of People *|
	 *    count: 0
	 * },
	 * /* @Prototype *|
	 * {
	 *    init : function(name){
	 *      this.name = name
	 *      this._super({warmblood: true})
	 *    },
	 *    /* Returns a formal name 
	 *     * @return {String} the name with "Mrs." added
	 *     *|
	 *   fancy_name : function(){
	 *      return "Mrs. "+this.name;
	 *   }
	 * })
	 * @codeend
	 */
	DocumentJS.Type("class",
	/**
	 * @Static
	 */
	{
		codeMatch: /([\w\.\$]+?).extend\(\s*["']([^"']*)["']/,
		// /([\w\.]*)\s*=\s*([\w\.]+?).extend\(/,
		//must return the name if from the code
		funcMatch: /(?:([\w\.]+)|(["'][^"']+["']))\s*[:=]\s*function\s?\(([^\)]*)/,
	/*
	 * Parses the code to get the class data.
	 * @param {String} code
	 * @return {Object} class data
	 */
		code: function( code ) {
			var parts = code.match(this.codeMatch);
			if ( parts ) {
				return {
					name: parts[2],
					inherits: parts[1].replace("$.", "jQuery.")
				}
			}
			parts = code.match(this.funcMatch)
			if ( parts ) {
				return {
					name: parts[1] ? parts[1].replace(/^this\./, "") : parts[2]
				}
			}
		},
	/*
	 * Possible scopes for @class.
	 */
		parent: /script/,
		useName: true,
		hasChildren: true
	})
})