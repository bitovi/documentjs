/**
 * @class DocumentJS.Tags.download
 * @tag documentation
 * @parent DocumentJS.Tags 
 * 
 * Adds a download link.
 */
DocumentJS.Tags.download ={
    add: function(line){
		var parts = line.match(/^\s*@download\s*([^ ]*)\s*([\w]*)/)
		this.download = parts[1];
		this.downloadSize = parts[2] || 0
    }
};