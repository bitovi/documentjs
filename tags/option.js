var typer = require('./helpers/typer'),
	tree = require('./helpers/tree'),
	namer = require('./helpers/namer'),
	tnd = require('./helpers/typeNameDescription');

	var getOptions = function(param){
		for(var i =0; i < param.types.length; i++) {
			if( param.types[i].options ) {
				return param.types[i].options;
			}
		}
	};

	var getParams = function(param){
		for(var i =0; i < param.types.length; i++) {
			if( param.types[i].params ) {
				return param.types[i].params;
			}
		}
	};
	
	// find matching type
	var getType = function(types, type){
		for(var i =0; i < types.length; i++) {
			if( types[i].type === type ) {
				return types[i];
			}
		}
	};

	var getOrMakeOptionByName = function(options, name){
		for(var i =0; i < options.length; i++) {
			if( options[i].name === name ) {
				return options[i];
			}
		}
		var option = {name: name}
		options.push(option);
		return option;
	},
		setOptionData = function(option, data){
			option.description = data.description;
			
			for(var prop in data){
				option[prop] =  data[prop];
			}
		};
	

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
	module.exports = {

		addMore: function( line, last ) {
			if ( last ) last.description += "\n" + line;
		},
		add: function( line ) {
			
			var noNameData = tnd(line, true),
				data = tnd(line);
			
			// start processing
			if(this.type == "typedef"){
				// Typedef's can have option values, but those values can be objects
				// with options.
				// So, we should check in options objects first
				for( var i = 0 ; i < this.types.length; i++ ) {
					var obj = this.types[i];
					if( obj.type == "Object" ) {
						var option = getOrMakeOptionByName(obj.options || [], data.name);
						if(option) {
							setOptionData(option, data);
							return option;
						}
					}
				}
			}
			
			
			// we should look to find something matching
			var locations = [this._curReturn, this._curParam, (this.params && this.params[this.params.length - 1]), this];
			// only process this type of option if there is one value
			if(noNameData.types && noNameData.types.length == 1) {
				var typeData = noNameData.types[0];
				for(var i = 0 ; i < locations.length; i++){
					var obj = locations[i];
					if(obj){
						if(!obj.types){
							obj.types = [];
						}
						var type = getType(obj.types, typeData.type);
						if(type){
							// copy description
							type.description = noNameData.description;
							// copy any additional type info
							for(var prop in typeData){
								type[prop] = typeData[prop];
							}
							return type;
						} 
					}
				}
			}
			
			var prevParam = this._curReturn || this._curParam || (this.params && this.params[this.params.length - 1]) || this;

			if(!data.name){
				console.log("LINE: \n" + line + "\n does not match @option [{TYPE}] NAME DESCRIPTION");
			}
			var params = getParams(prevParam);
			var options = getOptions(prevParam);
			
			
			
			
			if(!options && !params){
				console.log("LINE: \n" + line + "\n could not find an object or arguments to add options to.");
				return;
			}
			var option = getOrMakeOptionByName(options || params, data.name);
			
			setOptionData(option, data);

			return option;
		}
	};
