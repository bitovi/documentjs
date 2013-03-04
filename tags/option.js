steal('documentjs/showdown.js','./helpers/typer.js',
	'./helpers/tree.js','./helpers/namer.js',function(converter, typer, tree,namer) {

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
	 * @class DocumentJS.tags.param
	 * @tag documentation
	 * @parent DocumentJS.tags 
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
			var printError = function(){
				print("LINE: \n" + line + "\n does not match @params {TYPE} NAME DESCRIPTION");
			}
			var prevParam = this._curParam || this.params[this.params.length - 1];
			// start processing
			var children = typer.tree(line);
			
			// check the format
			if(!children.length >= 2) {
				printError();
				return;
			}
			var name,
				typeToken,
				description,
				props = {};
			
			// if there's a type
			if( children[1].type == "{" ) {
				typeToken = children[1];
				
				if(typeof children[2] == "string"){
					name = children[2];
					description = line.substr(typeToken.end).replace(name,"").replace(/^\s+/,"");
				} else {
					name = namer.process( [children[2]], props).name;
					description = line.substr(children[2].end).replace(/^\s+/,"")
				}
				
			} else {
				// there's only a name
				var parts = line.match(/\s*@option\s+([^\(\s]+(?:\([^\)]+\)\]?)?) ?(.*)?/);
				description = parts.pop().replace(/^\s+/,"");
				name = parts.pop();
			}
			var params = getParams(prevParam);
			var options = getOptions(prevParam);
			if(!options && !params){
				print("LINE: \n" + line + "\n could not find an object or arguments to add options to.");
				return;
			}
			var option = getOrMakeOptionByName(options || params, name);
			option.description = description;
			if( typeToken ) {
				// merge
				typer.process(typeToken.children, option);
			}
			for(var prop in props){
				option[prop] =  props[prop];
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