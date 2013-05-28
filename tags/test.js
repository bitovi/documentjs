steal(function() {
	/**
	 * @constructor DocumentJS.tags.test @test
	 * @parent DocumentJS
	 * 
	 * Link to test page.
	 * 
	 * @signature `@test URL`
	 * 
	 * @codestart
	 * /**
	 *  * A component for the lib library.
	 *  * @test lib/component/component.test
	 *  *|
	 * lib.Component = function( name ) { ... }
	 * @codeend
	 * 
	 * @param {String} URL The url of the test page.
	 */
	return {
		add: function( line ) {
			this.test = line.match(/@test ([^ ]+)/)[1];
		}
	};
})