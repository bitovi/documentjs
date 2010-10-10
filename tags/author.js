/**
 * @class DocumentJS.Tags.author
 * @tag documentation
 * @parent DocumentJS.Tags 
 * Describes who the author of a class is.
 */
DocumentJS.Tags.author={
    add: function(line){
        var m = line.match(/^\s*@author\s*(.*)/)
        if(m){
            this.author = m[1];
        }
    }
};