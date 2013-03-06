steal('documentjs/showdown.js','./helpers/typer.js',
	'./helpers/namer.js',function(converter, typer,namer) {


	var ordered = function( params ) {
		var arr = [];
		for ( var n in params ) {
			var param = params[n];
			arr[param.order] = param;
		}
		return arr;
	}
	var indexOf = function(arr, name){
		return arr.map(function(item){return item.name}).indexOf(name);
	}
	

	/**
	 * @constructor documentjs/tags/param @param
	 * @tag documentation
	 * @parent DocumentJS 
	 * 
	 * Adds parameter information.
	 * 
	 * @signature `@param {TYPE} NAME DESCRIPTION`
	 * 
	 * @codestart
     * /**
     *  * Finds an order by id.
     *  * @@param {String} [id=0] Order identification number.
     *  * @@param {function(Order)} [success(order)] Filter order search by this date.
     *  *|
     *  findById: function( id, success ) {
	 *  @codeend
	 * 
	 * 
	 * @param {String} [TYPE] A type expression specified 
	 * [here](https://developers.google.com/closure/compiler/docs/js-for-compiler#types).
	 * 
	 * @param {String} NAME The name of the param. It can be specified as:
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
     * /**
     *  * Finds an order by id.
     *  * @@param {String} id Order identification number.
     *  * @@param {Date} [date] Filter order search by this date.
     *  *|
     * findById: function(id, date) {
     *     // looks for an order by id
     * }   
	 * @codeend
	 *  
	 */
	return {

		addMore: function( line, last ) {
			if ( last ) last.description += "\n" + line;
		},
		add: function( line ) {
			var printError = function(){
				print("LINE: \n" + line + "\n does not match @param {TYPE} NAME DESCRIPTION");
			}
			
			// start processing
			var children = typer.tree(line);
			
			// check the format
			if(!children.length >= 3) {
				printError();
				return;
			}
			if(!children[1].type == "{") {
				printError();
				return;
			}
			if(!children[2]){
				print("LINE: \n" + line + "\n does not match @param {TYPE} NAME DESCRIPTION");
			}
			
			var param = {},
				description;
			
			typer.process(children[1].children, param);
			var nameChildren = [children[2]];
			
			// include for function naming
			if(children[3] && children[3].type == "("){
				nameChildren.push( children[3] );
			}
			
			namer.process( nameChildren, param);
			
			if(nameChildren.length > 1 ){
				param.description = line.substr(children[3].end)
			} else if(typeof children[2] == "string"){
				param.description = line.substr(children[1].end).replace(children[2],"")
			} else {
				param.description = line.substr(children[2].end)
			}
			param.description = param.description.replace(/^\s+/,"")
			
			// if we have a signiture, add this param to the last 
			// signiture
			if(this.signatures){
				this.signatures[this.signatures.length-1].params.push(param)
			} else {
				if (!this.params ) {
					this.params = [];
				}
				// we are the _body's_ param
				// check if one by the same name hasn't already been created
				if ( indexOf(this.params, param.name) != -1) {
					// probably needs to swap
					this.params.splice(indexOf(this.params, param.name),1, param)
				} else {
					// add to params
					
					this.params.push(param)
				}
			}
			this._curParam = param;
			return param;
		},
		done : function(){
			if(this.returns && this.returns.description && this.returns.description ){
				this.returns.description = converter.makeHtml(this.returns.description)
			}
			if(this.params){
				for(var paramName in this.params){
					if(this.params[paramName].description  ){
						this.params[paramName].description = converter.makeHtml(this.params[paramName].description)
					}
				}
			}
			(this.signatures || []).forEach(function(signature){
				signature.description = converter.makeHtml( signature.description );
				
				(signature.params || []).forEach(function(param){
					param.description = converter.makeHtml(param.description);
					
				})
				if(signature.returns && signature.returns.description){
					signature.returns.description = converter.makeHtml(signature.returns.description)
				}
			})
			delete this._curParam;
		}
	};

})