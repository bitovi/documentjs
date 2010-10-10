/**
 * @class DocumentJS.Tags.test
 * @tag documentation
 * @parent DocumentJS.Tags 
 * 
 * Link to test cases.
 */
DocumentJS.Tags.test = {
    add: function(line){
		this.test = line.match(/@test ([^ ]+)/)[1];
    }
};