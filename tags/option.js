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
	 * @constructor DocumentJS.tags.option @option
	 * @tag documentation
	 * @parent DocumentJS 
	 * 
	 * Details the properties of an object or the arguments of a function
	 * in a [DocumentJS.tags.param @param] tag.
	 * 
	 * @signature `@option {TYPE} NAME [DESCRIPTION]`
	 * 
	 * @codestart
     * /**
     *  * Retrieves a list of orders.
     *  * 
     *  * @@param {{}} params A parameter object with the following options:
     *  * @@option {String} type Specifies the type of order.
     *  * @@option {Number} [createdAt] Retrieves all orders after this timestamp. 
     *  *
     *  * @@param {function(Orders.List)} [success(orders)] Filter order search by this date.
     *  * @@option orders A list of [Orders] that match `params`.
     *  *|
     *  find: function( params, success ) {
	 *  @codeend
	 * 
	 * 
	 * @param {documentjs/type} [TYPE] A [documentjs/type type expression]. Examples:
	 * 
	 * `{String}` - type is a `String`.  
	 * `{function(name)}` - type is a `function` that takes one `name` argument.  
	 * 
	 * `TYPE` does not need to be specified for types that are already described in
	 * the option's corresponding function or object.  For example:
	 * 
	 * 
	 * @codestart
     * /**
     *  * @@param {{type: String}} params A parameter object with the following options:
     *  * @@option type Specifies the type of order.
     *  *
     *  * @@param {function(Orders.List)} [success(orders)] Callback function.
     *  * @@option orders A list of [Orders] that match `params`.
     *  *|
	 * @codeend
	 * @param {documentjs/name} NAME A [documentjs/name name expression]. Examples:
	 * 
	 * `age` - age is item.  
	 * `[age]` - age is item, age is optional.  
	 * `[age=0]` - age defaults to 0.  
	 * 
	 *  
	 * 
	 */
	return {

		addMore: function( line, last ) {
			if ( last ) last.description += "\n" + line;
		},
		add: function( line ) {
			var prevParam = this._curParam || (this.params && this.params[this.params.length - 1]) || this;
			// start processing
			
			var data = tnd(line);
			if(!data.name){
				console.log("LINE: \n" + line + "\n does not match @params [{TYPE}] NAME DESCRIPTION");
			}
			
			if(!prevParam.types){
				prevParam.types = [];
			}
			var params = getParams(prevParam);
			var options = getOptions(prevParam);
			if(!options && !params){
				console.log("LINE: \n" + line + "\n could not find an object or arguments to add options to.");
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