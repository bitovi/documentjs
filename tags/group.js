steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js', function (getParent, tnd) {
		/**
		 * @constructor DocumentJS.tags.group @group
		 * @parent DocumentJS
		 *
		 * Declares that other tags belong to a group within
		 * the preceeding [DocumentJS.tags.constructor @constructor].
		 * The name will be a child under the @constructor and the
		 * description will show up in the sidebar.
		 *
		 * @signature `@group name [ORDER] description`
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
				var m = line.match(/@group[\s+](.*?)([\s+]([\d]+))?[\s+](.*)/),
					currentName = this.name;

				if (m) {
					var name = m[1],
						title = m[4] || m[1],
						order = parseInt(m[3],10) || 0,
						docObject = docMap[name] ?
							docMap[name] :
							docMap[name] = {
								name: name,
								title: title || name,
								type: "group",
								parent: currentName,
								description: '',
								order: order
							};

					return ["scope", docObject]
				}
			}
		}
	})
