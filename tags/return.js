steal.then(function() {
	/**
	 * @class DocumentJS.Tags.return
	 * @tag documentation
	 * @parent DocumentJS.Tags 
	 * 
	 * Describes return data in the format "@return {type} description".
	 * 
	 * Matches multiple lines. 
	 */
	DocumentJS.Tags["return"] = {
		add: function( line ) {
			if (!this.ret ) {
				this.ret = {
					type: 'undefined',
					description: ""
				}
			}

			var parts = line.match(/\s*@return\s+(?:\{([\w\|\.\/]+)\})?\s*(.*)?/);

			if (!parts ) {
				return;
			}

			var description = parts.pop() || "";
			var type = parts.pop();
			this.ret = {
				description: description,
				type: type
			};
			return this.ret;
		},
		addMore: function( line ) {
			this.ret.description += "\n" + line;
		}
	};
})