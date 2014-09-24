var typer = require('./helpers/typer');

	/**
	 * @constructor documentjs.tags.return @return
	 * @parent documentjs.tags
	 * 
	 * Describes a function's return value.
	 * 
	 * @signature `@return {TYPE} DESCRIPTION`
	 * 
	 * @codestart
	 * /**
	 *  * Capitalizes a string
	 *  * @@param {String} s the string to be lowercased.
	 *  * @@return {String} a string with the first character capitalized, 
	 *  * and everything else lowercased
	 *  *|
	 * capitalize: function( s ) { ... }
	 * @codeend
	 * 
	 * @param {documentjs/type} [TYPE] The type of 
	 * return value.
	 * 
	 * @param {String} [DESCRIPTION] The description of the 
	 * return value.
	 */
module.exports = {
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
			// check types (created by typedef) for a function type
			if(this.types){
				for(var i =0; i< this.types.length; i++ ){
					if(this.types[i].type === "function"){
						this.types[i].returns = returns;
						this._curReturn = returns;
						return returns;
					}
				}
			}
			
			this.returns = returns;
		} 

		this._curReturn = returns;

		return returns;
	},
	addMore: function( line, ret ) {
		ret.description += "\n" + line;
	},
	done : function(){
		delete this._curReturn;	
	}
};