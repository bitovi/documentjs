DocumentJS.Tags.constructor = 
{
    add: function(line){
		var parts = line.match(/\s?@constructor(.*)?/);
		
		this.construct = parts && parts[1] ? " "+parts[1]+"\n" : ""
		return ["default",'construct'];
    }
};