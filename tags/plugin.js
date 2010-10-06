DocumentJS.Tags.plugin = {
    add: function(line){
		this.plugin = line.match(/@plugin ([^ ]+)/)[1];
    }
}