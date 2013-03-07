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
	 * @constructor documentjs/tags/typedef @typedef
	 * @tag documentation
	 * @parent DocumentJS 
	 * 
	 * Details the properties of an Object or the arguments of a function
	 * in a [documentjs/tags/param @param] tag.
	 * 
	 * @signature `@option {TYPE} NAME DESCRIPTION`
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
	 * @param {String} [TYPE] A type expression specified 
	 * [here](https://developers.google.com/closure/compiler/docs/js-for-compiler#types).
	 * 
	 * @param {String} NAME The name of the option. It can be specified as:
	 * 
	 *  - A simple name:
	 * 
	 * @codestart
     * /**
     *  * @@param {TYPE} id 
     *  *|
	 * @codeend
	 * 
	 * 
	 * @body
	 * 
	 * 
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