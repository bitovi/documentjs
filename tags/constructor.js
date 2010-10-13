steal.then(function() {
	/**
	 * @class DocumentJS.Tags.constructor
	 * @tag documentation
	 * @parent DocumentJS.Tags
	 * Documents javascript constructor classes typically created like: new MyContructor(args). 
	 * 
	 * A constructor can be described by putting @constructor as the first declaritive. 
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 *  /* @constructor
	 *   * Person represents a human with a name  
	 *   * You must pass in a name.
	 *   * @params {String} name A person's name
	 *   *|
	 *  Person = function(name){
	 *     this.name = name
	 *     Person.count ++;
	 *  }
	 *  /* @Static *|
	 *  steal.Object.extend(Person, {
	 *    /* Number of People *|
	 *    count: 0
	 *  })
	 *  /* @Prototype *|
	 *  Person.prototype = {
	 *    /* Returns a formal name 
	 *     * [DocumentJS.Tags.return | @return] {String} the name with "Mrs." added
	 *     *|
	 *    fancy_name : function(){
	 *       return "Mrs. "+this.name;
	 *    }
	 *  }
	 * @codeend
	 */
	DocumentJS.Tags.constructor =
/*
 * @Static
 */
	{
		add: function( line ) {
			var parts = line.match(/\s?@constructor(.*)?/);

			this.construct = parts && parts[1] ? " " + parts[1] + "\n" : ""
			return ["default", 'construct'];
		}
	};
})