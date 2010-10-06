DocumentJS.Tags.codestart = {
    add: function(line, last){
        var m = line.match(/^\s*@codestart\s*([\w-]*)\s*(.*)/)
        
		
		if(m){
            return ["push",{
				type: m[1] ? m[1].toLowerCase() : 'javascript',
				lines : [],
				last: last,
				_last: this._last
			}];
        }
		
    },
    addMore : function(line, data){
        data.lines.push(line);
    }
};