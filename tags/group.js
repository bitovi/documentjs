steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js', function (getParent, tnd) {
		/**
		 * @constructor DocumentJS.tags.group @group
		 * @parent DocumentJS
		 *
		 * Declares that other tags belong to a group within
		 * the preceeding [DocumentJS.tags.constructor @constructor].
		 *
		 * @signature `@group`
		 *
		 * @codestart
		 * /**
		 *  * @@constructor
		 *  * Creates an Animal
		 *  *|
		 * Animal = function(){ ... }
		 * /** @@group plugin Plugin *|
		 * Animal.prototype = {
	     *    /**
	     *     * Eats another animal.
	     *     *|
	     *     eat: function(animal){ ... }
	     * }
		 * @codeend
		 *
		 */
		return {
			add: function (line, curData, scope, docMap) {
				var m = line.match(/@group[\s+](.*?)[\s](.*)/),
					currentName = this.name;

				if (m) {
					var name = m[1],
						title = m[2] || m[1],
						docObject = docMap[name] ?
							docMap[name] :
							docMap[name] = {
								name: name,
								title: title || name,
								type: title,
								parent: currentName,
								description: ''
							};

					return ["scope", docObject]
				}
			}
		}
	})
