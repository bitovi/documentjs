var typer = require('./helpers/typer'),
	tree = require('./helpers/tree'),
	namer = require('./helpers/namer'),
	tnd = require('./helpers/typeNameDescription');
	

	/**
	 * @constructor DocumentJS.tags.module @module
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Declares the export value for a module.
	 * 
	 * @signature `@module {TYPE} NAME [TITLE]`
	 * 
	 * @codestart
     * /**
     *  * @module {{}} lib/componentProps props
     *  * @option {String} name The name of the component.
     *  * @option {String} title The title of the component.
     *  *|
	 *  @codeend
	 * 
	 * @param {documentjs/type} [TYPE] A [documentjs/type type expression]. This
	 * is typically an object specified like: `{{}}` or a function like `{function}`.  
	 * 
	 * @param {String} NAME The name of the type.
	 * 
	 * @param {String} TITLE The title of the type used for display purposes.
	 */
	module.exports = {
		add: function( line ) {
			var prevParam = this;
			// start processing
			
			var data = tnd(line);
			if(!data.name){
				print("LINE: \n" + line + "\n does not match @typedef [{TYPE}] NAME TITLE");
			}
			this.type = "module"
			this.title = data.description;
			delete data.description
			
			for(var prop in data){
				this[prop] =  data[prop];
			}
		}
	};

