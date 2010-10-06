DocumentJS.Tags.type = {
    add: function(line){
		var m = line.match(/^\s*@type\s*([\w\.\/]*)/)
        if(m){			
            this.attribute_type = m[0]
        }
    }
};