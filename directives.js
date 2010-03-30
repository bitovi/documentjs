/**
 * @hide
 * The base directive class.  Classes extending [DocumentJS.Pair] [DocumentJS.Pair.static.add|add] directives
 * to be matched against.  The available directives are:
 * <ul>
 *     <li>[DocumentJS.Directive.Init|init]</li>
 *     <li>[DocumentJS.Directive.Param|param]</li>
 *     <li>[DocumentJS.Directive.Inherits|inherits]</li>
 *     <li>[DocumentJS.Directive.Return|return]</li>
 *     <li>[DocumentJS.Directive.Author|author]</li>
 *     <li>[DocumentJS.Directive.Hide|hide]</li>
 *     <li>[DocumentJS.Directive.CodeStart|codestart]</li>
 *     <li>[DocumentJS.Directive.CodeEnd|codeend]</li>
 *     <li>[DocumentJS.Directive.Alias|alias]</li>
 *     <li>[DocumentJS.Directive.Plugin|plugin]</li>
 * </ul>
 * <h3>How directives work</h3>
 * Directives mix in their add and add_more functions into DocumentJS.Pair classes.  
 * These functions work with [DocumentJS.Pair.prototype.comment_setup|Pair::comment_setup] to
 * read directives (things that look like <i>@something</i>) and make sense of their data.
 * 
 * 
 */
DocumentJS.Class.extend("DocumentJS.Directive",
/* @prototype */
{
    /**
     * Called when [DocumentJS.Pair.prototype.comment_setup|comment_setup] first sees a line with the matching
     * directive.
     * If the function returns null or false, following lines without another directive will be added to 
     * real_comment.  If the function returns data, the add_more will be called with lines following this line
     * and the data returned.
     * 
     * In these functions, save the data from comments like:
     * @codestart
     * this.my_data = line.match(/\d\d/)
     * @codeend
     * It's important to note that this refers to the Pair instance of the class that has added this directive.
     * 
     * @param {String} line the line with the directive on it.
     * @return {Object} if false, add future lines to real_comment, otherwise, call add_more with future lines
     * and the data returned.
     */
    add: function(line){
        var m = line.match(/^\s*@(\w+)\s*(.*)/)
        if(m){
            this[m[1]] = m[2];
        }
    }
    /**
     * @function add_more
     * Adds lines following a directive.
     * @param {String} line the current comment line
     * @param {Object} prior data the data returned from the previous add or add_more.
     * @return {Object} if false, ends calling add_more with future lines, otherwise; calls add_more with the next
     * line and the return value.
     */
})
//start directives
/**
 * @hide
 * Describes constructor functionality.  Matches multiple lines
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Init',
{
    add: function(line){
            var parts = line.match(/\s?@init(.*)?/);
            if(!parts || !parts[1]){
                this.init_description = " ";
                return true;
            } 
            this.init_description = parts.pop();
            return this.init_description;
    },
    add_more: function(line){
        this.init_description +="\n"+ line;
    }
});
/**
 * @hide
 * Adds parameter information of the format: "@param {<i>optional:</i>type} name description" .
 * Matches multiple lines.
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Param',{
    add_more : function(line, last){
        if(last)
            last.description += "\n"+line;
    },
    /**
     * Adds @param data to the constructor function
     * @param {String} line
     */
    add: function(line){
        var parts = line.match(/\s*@param\s+(?:\{([^}]+)\})?\s+([^\s]+) ?(.*)?/);
        if(!parts){
            print("LINE: \n"+line+"\n does not match @params {optional:TYPE} NAME DESCRIPTION")
            return;
        }
        var description = parts.pop();
        var n = parts.pop(), optional = false, defaultVal;
        //check if it has anything ...
		var nameParts = n.match(/\[([\w\.]+)(?:=([^\]]*))?\]/)
		if(nameParts){
			optional = true;
			defaultVal = nameParts[2]
			n = nameParts[1]
		}
		
        var param = this.params[n] ? this.params[n] : this.params[n] = {order: this.ordered_params().length };

        param.description = description || "";
        param.name = n;
        param.type = parts.pop()|| "";
        

		param.optional = optional;
        if(defaultVal){
			param["default"] = defaultVal;
		}
		
		return this.params[n];
    }
});
/**
 * @hide
 * Says current class or constructor inherits from another class or contructor.
 * Looks for "@inherits <i>constructor or class name</i>"
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Inherits',{
    add: function(line){
        var m = line.match(/^\s*@\w+ ([\w\.]+)/)
        if(m){
            this.inherits = m[1];
        }
    }
})
/**
 * @hide
 * Describes return data in the format "@return {type} description".
 * Matches multiple lines.
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Return',{
    add: function(line){
        var parts = line.match(/\s*@return\s+(?:\{([\w\.\/]+)\})?\s*(.*)?/);
        
        if(!parts) {
           return; 
        }
        
        var description = parts.pop() || "";
        var type = parts.pop();
        this.ret = {description: description, type: type};
        return this.ret;
    },
    add_more : function(line){
        this.ret.description += "\n"+line;
    }
})
/**
 * @hide
 * Describes who the author of a class is.
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Author',{
    add: function(line){
        var m = line.match(/^\s*@author\s*(.*)/)
        if(m){
            this.author = m[1];
        }
    }
});
/**
 * @hide
 * Hides this class or constructor from the left hand side bar.
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Hide',{
    add: function(line){
        var m = line.match(/^\s*@hide/)
        if(m){
            this.hide = true;
        }
    }
});
/**
 * @hide
 * Starts a code block.  Looks for "@codestart code_type".  Matches
 * multiple lines.  Must end with "@codeend".
 */
DocumentJS.Directive.extend('DocumentJS.Directive.CodeStart',{
    add: function(line){
        var m = line.match(/^\s*@codestart\s*([\w-]*)\s*(.*)/)
        if(m){
            this.comment_code_type = m[1] ? m[1].toLowerCase() : 'javascript';
            this.comment_code = [];
            return true;
        }
    },
    add_more : function(line){
        this.comment_code.push(line);
    }
});
/**
 * @hide
 * Stops a code block
 */
DocumentJS.Directive.extend('DocumentJS.Directive.CodeEnd',{
    add: function(line){
        var m = line.match(/^\s*@codeend/)
        
        if(m){
            var joined = this.comment_code.join("\n");
			if(this.comment_code_type == "javascript")
				joined = joined.replace(/\*\|/g,"*/")
			this.real_comment += 
            "<pre><code class='"+this.comment_code_type+"'>"+joined+"</code></pre>"
        }
        return false;
    }
});
/**
 * @hide
 * This Class or Constructor is known by another name. Format: "@alias other_name"
 * 
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Alias',{
    add: function(line){
        var m = line.match(/^\s*@alias\s*([\w\-\.]*)/)
        if(m){
            this.alias = m[1];
        }
    }
});
/**
 * @hide
 * Adds to another plugin. Format: "@plugin plugin_name"
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Plugin',{
    add: function(line){
        this.plugin = line.match(/@plugin ([^ ]+)/)[1];
    }
});

/**
 * @hide
 * Adds tags for searching
 */
DocumentJS.Directive.extend('DocumentJS.Directive.Tag',{
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
});

/**
 * @hide
 * Adds an iframe to some page with example code, e.g. @iframe phui/menu/menu.html 320 
 * 320 is the iframe height. 
 */
DocumentJS.Directive.extend('DocumentJS.Directive.iFrame',{
    add: function(line){
        var m = line.match(/^\s*@iframe\s*([\w\.\/]*)\s*([\w]*)\s*(.*)/)
        
        if(m){
            var iframe_src = m[1] ? m[1].toLowerCase() : '';
			var iframe_height = m[2] ? m[2] : '320';
			this.real_comment += 
            "<iframe src='" + iframe_src + "' width='100%' " +
			"height='" + iframe_height + "' " +
			"frameborder=0 " +
			"style='display:block;border:1px solid #cccccc;" + 
			"padding:0 0 10px 10px;margin:10px 0 10px 0;background-color:#eeeeee;'></iframe>"
        }
    }
});
