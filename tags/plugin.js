steal.then(function(){
/**
 * @class DocumentJS.Tags.plugin
 * @tag documentation
 * @parent DocumentJS.Tags 
 * 
 * Adds to another plugin. 
 * 
 * Format: "@plugin plugin_name". 
 */	
DocumentJS.Tags.plugin = {
    add: function(line){
		this.plugin = line.match(/@plugin ([^ ]+)/)[1];
    }
}
})