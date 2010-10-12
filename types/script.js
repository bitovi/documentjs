steal.then(function() {
	/**
	 * Represents a file.
	 * Breaks up file into comment and code parts.
	 * Creates new [DocumentJS.Pair | Doc.Pairs].
	 * @hide
	 */
	DocumentJS.Script = {
		group: new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[^\\w\\{\\(\\[/]*[^\\n]*)", "g"),

		splitter: new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w\\{\\(\\[\"'\$]*([^\\r\\n]*))"),

		/**
		 * Generates docs for a file.
		 * @param {Object} inc an object that has path and text attributes
		 */
		process: function( inc, objects ) {


			var source = inc.src
			//check if the source has @documentjs-ignore
			if (/\@documentjs-ignore/.test(source) ) {
				return;
			}
			var script = {
				type: "script",
				name: inc.path
			}
			print("  " + script.name);
			objects[script.name] = script;
			var pairs = source.match(this.group);
			//clean comments
			var scope = script;
			if (!pairs ) return;
			for ( var i = 0; i < pairs.length; i++ ) {
				var splits = pairs[i].match(this.splitter),
					comment = splits[1].replace(/\r?\n(\s*\*+)?/g, '\n');

				//print(splits[1].replace(/^[^\w@]*/,''))
				var code = splits[2],
					removeSpace = Infinity;

				var lines = comment.split("\n"),
					noSpace = /\S/g,
					match,
					l;
					
					for ( l = 0; l < lines.length; l++ ) {
						match = noSpace.exec(lines[l]);
						if ( match && lines[l] && noSpace.lastIndex < removeSpace ) {
							removeSpace = noSpace.lastIndex;
						}
						noSpace.lastIndex = 0;
					}
					//print(removeSpace)
					if ( isFinite(removeSpace) ) {
						for ( l = 0; l < lines.length; l++ ) {

							lines[l] = lines[l].substr(removeSpace - 1)
						}
					}
					comment = lines.join("\n")

					var type = DocumentJS.Type.create(comment, code, scope, objects);

				if ( type ) {

					objects[type.name] = type;
					//get the new scope if you need it
					// if we don't have a type, assume we can have children
					scope = !type.type || DocumentJS.Type.types[type.type].hasChildren ? type : scope;
				}

			}

		}
	};

	DocumentJS.Type("script", {
		useName: false,
		hasChildren: true
	})
})