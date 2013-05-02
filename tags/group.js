steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js', function (getParent, tnd) {
		/**
		 * @constructor documentjs/tags/grout @group
		 * @parent DocumentJS
		 *
		 * Declares that other tags belong to a groupt withing
		 * the preceeding [documentjs/tags/function @constructor].
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
				var m = line.match(/^\s*@group\s*([\w\-\.]*)[\s*](.*)/);

				console.log(m);
				if (m && scope) {
					var parentAndName = getParent.andName({
						parents: ["constructor", "function", "page"],
						useName: ["constructor", "function", "page"],
						scope: scope,
						docMap: docMap,
						name: m[1]
					});

					this.type = m[1];
					this.title = m[2] || this.type;
					this.name = parentAndName.name;
					this.parent = parentAndName.parent;
					return ['scope', this]
				}

			}
		}
	})
