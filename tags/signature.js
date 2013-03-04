steal(function() {
	/**
	 * @class DocumentJS.tags.codestart
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Starts a code block.  
	 * 
	 * Looks for "@codestart codeType".
	 *   
	 * Matches multiple lines.
	 *   
	 * Must end with "@codeend".
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 *
	 *  /* 
	 *   * @codestart
	 *   *  /* @class
	 *   *   * Person represents a human with a name.  Read about the 
	 *   *   * animal class [Animal | here].
	 *   *   * @constructor
	 *   *   * You must pass in a name.
	 *   *   * @param {String} name A person's name
	 *   *   *|
	 *   *   Person = function(name){
	 *   *      this.name = name
	 *   *      Person.count ++;
	 *   *   }
	 *   *  /* @Static *|
	 *   *  steal.Object.extend(Person, {
	 *   *      /* Number of People *|
	 *   *      count: 0
	 *   *  })
	 *   *  /* @Prototype *|
	 *   *  Person.prototype = {
	 *   *     /* Returns a formal name 
	 *   *      * @return {String} the name with "Mrs." added
	 *   *      *|
	 *   *      fancyName : function(){
	 *   *         return "Mrs. "+this.name;
	 *   *      }
	 *   *  }
	 *   * @codeend
	 *   *|
	 *
	 * @codeend 
	 */
	return {
		add: function( line, last ) {
			var description ="",
				code,
				m;
			if( m = line.match(/^\s*@signature\s*(?:`([^`]*)`)?\s*(.*)/) ){
				code = m[1];
				description =m[2]
			} 
			


			if ( m ) {
				if(!this.signatures){
					this.signatures = [];
				}
				var signature = {
					code: code,
					description: description,
					params: []
				}
				// remove code params
				delete this.params;
				this.signatures.push(signature)
				return signature;
			}
			
		},
		addMore: function( line, data ) {
			data.description += "\n"+line;
		}
	};
})