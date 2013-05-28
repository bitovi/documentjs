steal('documentjs/libs/showdown.js','./helpers/typer.js',
	'./helpers/tree.js',
	'./helpers/namer.js',
	'./helpers/typeNameDescription.js',
	function(converter, typer, tree,namer, tnd) {

	var getOptions = function(param){
		for(var i =0; i < param.types.length; i++) {
			if( param.types[i].options ) {
				return param.types[i].options;
			}
		}
	}

	var getParams = function(param){
		for(var i =0; i < param.types.length; i++) {
			if( param.types[i].params ) {
				return param.types[i].params;
			}
		}
	}

	var getOrMakeOptionByName = function(options, name){
		for(var i =0; i < options.length; i++) {
			if( options[i].name === name ) {
				return options[i];
			}
		}
		var option = {name: name}
		options.push(option);
		return option;
	}
	

	/**
	 * @constructor DocumentJS.tags.typedef @typedef
	 * @tag documentation
	 * @parent DocumentJS 
	 * 
	 * Declares an alias for a more complex type. That alias can
	 * be used in [documentjs/type TYPE] declarations.
	 * 
	 * @signature `@typedef {TYPE} NAME [TITLE]`
	 * 
	 * @codestart
     * /**
     *  * @typedef {{}} lib/componentProps props
     *  * @option {String} name The name of the component.
     *  * @option {String} title The title of the component.
     *  *|
	 *  @codeend
	 * 
	 * @param {documentjs/type} [TYPE] A [documentjs/type type expression]. This
	 * is typically an object specified like: `{{}}`.  
	 * 
	 * @param {String} NAME The name of the type.
	 * 
	 * @param {String} TITLE The title of the type used for display purposes.
	 */
	return {
		add: function( line ) {
			var prevParam = this;
			// start processing
			
			var data = tnd(line);
			if(!data.name){
				print("LINE: \n" + line + "\n does not match @typedef [{TYPE}] NAME TITLE");
			}
			this.type = "typedef"
			this.title = data.description;
			delete data.description
			
			for(var prop in data){
				this[prop] =  data[prop];
			}
		},
		done : function(){
			return;
			if(this.ret && this.ret.description && this.ret.description ){
				this.ret.description = converter.makeHtml(this.ret.description)
			}
			if(this.params){
				for(var paramName in this.params){
					if(this.params[paramName].description  ){
						this.params[paramName].description = converter.makeHtml(this.params[paramName].description)
					}
				}
			}
		}
	};

})