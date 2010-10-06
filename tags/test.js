DocumentJS.Tags.test = {
    add: function(line){
		this.test = line.match(/@test ([^ ]+)/)[1];
    }
};