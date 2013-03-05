steal('documentjs/showdown.js','./helpers/typer.js',
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
	 * @constructor documentjs/tags/option @option
	 * @tag documentation
	 * @parent DocumentJS 
	 * 
	 * Adds parameter information.
	 * 
	 * ###Use cases:
	 * 
	 * 1. Common use:
	 * 
	 *      __@@params {TYPE} name description__
	 * 
	 * 2. Optional parameters use case:
	 * 
     *     __@@params {TYPE} [name] description__
     * 
     * 3. Default value use case:
     * 
     *     __@@params {TYPE} [name=default] description__
	 *
	 * ###Example:
	 * 
	 * @codestart
     * /*
     *  * Finds an order by id.
     *  * @@param {String} id Order identification number.
     *  * @@param {Date} [date] Filter order search by this date.
     *  *|
     *  findById: function(id, date) {
     *      // looks for an order by id
     *  }   
	 *  @codeend
	 *  
	 * 
	 */
	return {

		addMore: function( line, last ) {
			if ( last ) last.description += "\n" + line;
		},
		/**
		 * Adds @param data to the constructor function
		 * @param {String} line
		 */
		add: function( line ) {
			var prevParam = this._curParam || (this.params && this.params[this.params.length - 1]) || this;
			// start processing
			
			var data = tnd(line);
			if(!data.name){
				print("LINE: \n" + line + "\n does not match @params [{TYPE}] NAME DESCRIPTION");
			}
			
			if(!prevParam.types){
				prevParam.types = [];
			}
			var params = getParams(prevParam);
			var options = getOptions(prevParam);
			if(!options && !params){
				print("LINE: \n" + line + "\n could not find an object or arguments to add options to.");
				return;
			}
			var option = getOrMakeOptionByName(options || params, data.name);
			
			
			option.description = data.description;
			
			for(var prop in data){
				option[prop] =  data[prop];
			}

			return option;
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