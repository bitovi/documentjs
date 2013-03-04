steal(function() {
	/**
	 * @class DocumentJS.tags.body
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Adds a short description.
	 * 
	 * 
	 */
	return  {
		add: function( line ) {
			
			var m = line.match(/^\s*@body\s*(.*)/)
			if ( m ) {
				this.comment = m[1]+" ";
				
			}
			return ["default","comment"]
		}
	};
})