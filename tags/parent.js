steal(function() {
	return (function() {
		var waiting = {}

		/**
		 * @constructor DocumentJS.tags.parent @parent
		 * @parent DocumentJS
		 * 
		 * Specifies the parent 
		 * [documentjs/DocObject DocObject]'s name. The
		 * current DocObject will be displayed under the
		 * the parent in the navigation. 
		 * 
		 * @signature `@signature NAME`
		 * 
		 * @codestart
		 * /**
		 *  * @constructor jQuery.Drag
		 *  * @parent specialevents
		 *  * ...
		 *  *|
		 *  $.Drag = function(){}
		 * @codeend
		 * 
		 * @param {String} NAME The name of the parent
		 * [documentjs/DocObject DocObject].
		 */
		return {
			add: function( line , curData, objects) {
				var m = line.match(/^\s*@parent\s*([\w\.\/\$]*)\s*([\d]*)/);
				this.parent = m[1];
				if(m[2]){
					this.order =  parseInt(m[2]) || 0;
				}
			}
		};

	})();
})
