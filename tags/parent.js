steal.then(function() {
	(function() {
		var waiting = {}

		/**
		 * @class DocumentJS.Tags.parent
		 * @tag documentation
		 * @parent DocumentJS.Tags 
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
		 * @image jmvc/images/parent_tag_example.png
		 */
		DocumentJS.Tags.parent = {
			add: function( line ) {
				var m = line.match(/^\s*@parent\s*([\w\.\/]*)\s*([\w]*)/)
				var name = m[1],
					Class = DocumentJS.Page,
					inst = DocumentJS.Application.objects[name]

					if (!inst ) {
						inst = DocumentJS.Application.objects[name] = {
							name: name
						}
					}
					if (!this.parents ) {
						this.parents = [];
					}
					this.parents.push(inst.name);

				if (!inst.children ) {
					inst.children = [];
				}
				inst.children.push(this.name)
			}
		};

	})();
})