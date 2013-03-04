steal('documentjs/showdown.js','./helpers/typer.js',
	function(converter, typer) {
	/**
	 * @class DocumentJS.tags.return
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Describes return data in the format.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 *  /**
	 *   * Capitalizes a string
	 *   * @param {String} s the string to be lowercased.
	 *   * @return {String} a string with the first character capitalized, and everything else lowercased
	 *   *|
	 *   capitalize: function( s, cache ) {
	 *       return s.charAt(0).toUpperCase() + s.substr(1);
	 *   }
	 * @codeend
	 * 
	 * ###End Result:
	 * 
	 * @image site/images/return_tag_example.png
	 */
	return {
		add: function( line ) {
			var printError = function(){
				print("LINE: \n" + line + "\n does not match @return {TYPE} DESCRIPTION");
			}
			
			// start processing
			var children = typer.tree(line);
			
			// check the format
			if(!children.length >= 2 || !children[1].children) {
				printError();
				return;
			}
			
			var returns = typer.process(children[1].children, {});
			returns.description = line.substr(children[1].end).replace(/^\s+/,"");
			

			var parts = line.match(/\s*@return\s+(?:\{([^\}]+)\})?\s*(.*)?/);

			if (!parts ) {
				return;
			}
			var ret;
			if(this.signatures){
				this.signatures[this.signatures.length-1].returns = returns;
			} else {
				this.returns = returns;
			} 

			return returns;
		},
		addMore: function( line, ret ) {
			ret.description += "\n" + line;
		}
	};
})