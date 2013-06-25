steal('documentjs/libs/showdown.js','./helpers/typeNameDescription.js','steal',
	'./helpers/typer.js',
	function(converter, tnd, steal, typer ) {


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
	

	
	return {

		addMore: function( line, last ) {
			if ( last ) last.description += "\n" + line;
		},
		add: function( line ) {
			// this code is VERY similar to @return and should be shared
			// get type and description
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
			
			var that = typer.process(children[1].children, {});
			that.description = line.substr(children[1].end).replace(/^\s+/,"");
			

			var context;
			
			// find the current function's context
			if(this.signatures){
				context = this.signatures[this.signatures.length-1].context
			} else {
				// check types (created by typedef) for a function type
				if(this.types){
					for(var i =0; i< this.types.length; i++ ){
						if(this.types[i].type === "function"){
							context = this.types[i].context
						}
					}
				}
				
				// context not found
				if(!context){
					// create a context directly on the current object
					if (!this.context ) {
						this.context = that;
					}
					context = this.context;
				}
			}
			if(context && context !== that){
				// copy props
				steal.extend(context, that)
			}
			return context;
		}
	};

})