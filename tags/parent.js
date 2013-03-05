steal(function() {
	return (function() {
		var waiting = {}

		/**
		 * @constructor documentjs/tags/parent @parent
		 * @parent DocumentJS
		 * 
		 * Says under which parent the current type should be located.
		 * 
		 * ###Example:
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
		 * ###End Result:
		 * 
		 * @image site/images/parent_tag_example.png
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
