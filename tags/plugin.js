steal(function() {

	return {
		add: function( line ) {
			this.plugin = line.match(/@plugin ([^ ]+)/)[1];
		}
	}
})