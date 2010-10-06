DocumentJS.Tags.codeend = {
    add: function(line, data){

		if(!data.lines){
			print('you probably have a @codeend without a @codestart')
		}
		
        var joined = data.lines.join("\n");
		
		if(data.type == "javascript"){ //convert comments
			joined = joined.replace(/\*\|/g,"*/")
		}
		var out = "<pre><code class='"+data.type+"'>"+joined+"</code></pre>";
        
        return ["pop",out];
    }
};