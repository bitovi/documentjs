steal('documentjs/showdown.js','./helpers/typeNameDescription.js',
	function(converter, tnd ) {


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
	 * @constructor DocumentJS.tags.param @param
	 * @tag documentation
	 * @parent DocumentJS 
	 * 
	 * Adds parameter information to a [documentjs/tags/function @function] or
	 * [documentjs/tags/signature @signature].
	 * 
	 * @signature `@param {TYPE} NAME [DESCRIPTION]`
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
	 * Use `@param` within a [documentjs/tags/function @function] comment block or after 
	 * a [documentjs/tags/signature @signature] tag. 
	 * 
	 * @param {documentjs/type} TYPE A [documentjs/type type expression]. Examples:
	 * 
	 * `{String}` - type is a `String`.  
	 * `{function(name)}` - type is a `function` that takes one `name` argument.  
	 * 
	 * Use [documentjs/tags/option @option] to detail a function's arguments or an
	 * object's properties.
	 * 
	 * @param {documentjs/name} NAME A [documentjs/name name expression]. Examples:
	 * 
	 * `age` - age is item.  
	 * `[age]` - age is item, age is optional.  
	 * `[age=0]` - age defaults to 0.  
	 *  
	 * @body
	 * 
	 * ## @param within a function comment
	 * 
	 * If using a comment preceeds a function like ...
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
	 * ... DocumentJS will automatically
	 * make the comment's [documentjs/DocObject DocObject] type a function
	 * and create params with just names (in this case `id` and `success`).
	 * 
	 * The comment's `@param`s tags should use the same names as the function. Any
	 * params that specifies a name that isn't present is added at the end of
	 * the arguments.
	 * 
	 * ## @param within a signature
	 * 
	 * Use `@param` to specify the params in a signature. 
	 * 
	 * @codestart
     * /**
     *  * Finds an order by id.
     *  * 
     *  * @signature `Order.findById(id=0,[success])`
     *  * 
     *  * @@param {String} [id=0] Order identification number.
     *  * @@param {function(Order)} [success(order)] Filter order search by this date.
     *  *|
     * findById: function( id, success ) {
	 * @codeend
	 * 
	 * When a `@signature` is used, any params automatically created from code 
	 * are overwritten.
	 * 
	 */
	return {

		addMore: function( line, last ) {
			if ( last ) last.description += "\n" + line;
		},
		add: function( line ) {
	
			var param = tnd(line);
			/* TODO no print statements
			if(!param.type && !param.name){
				print("LINE: \n" + line + "\n does not match @param {TYPE} NAME DESCRIPTION");
			}
			*/
			
			
			
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