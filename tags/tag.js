DocumentJS.Tags.tag = {
    add: function(line){
        var parts = line.match(/^\s*@tag\s*(.+)/);
        
        if(!parts) {
           return; 
        }
        this.tags = parts[1].split(/\s*,\s*/g)
        //return this.ret;
    }//,
    //add_more : function(line){
    //    this.tags.concat(line.split(/\s*,\s*/g))
    //}
};