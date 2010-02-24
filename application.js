
/**
 * @class DocumentJS
 * @tag core, documentation
 * JavaScriptMVC comes with powerful and easy to extend documentation functionality.
 * Include.Doc is smart enough to guess 
 * at things like function names and parameters, but powerful enough to generate 
 * <span class='highlight'>JavaScriptMVC's entire website</span>!
 * 
 * <br/>
 * 
 * <p>steal Doc is pure JavaScript so it is easy to modify and make improvements.  First, lets show what
 * steal Doc can document: </p>
 * <ul>
 *     <li>[DocumentJS.Attribute | @attribute] -  values on an object.</li>
 *     <li>[DocumentJS.Function | @function] - functions on an object.</li>
 *     <li>[DocumentJS.Constructor | @constructor] - functions you call like: new Thing()</li>
 *     <li>[DocumentJS.Class| @class] - normal JS Objects and source that uses [jQuery.Class]</li>
 * </ul>
 * <p>You can also specifify where your functions and attributes are being added with: </p>
 * <ul>
 *     <li>[DocumentJS.Prototype | @prototype] - add to the previous class or constructor's prototype functions</li>
 *     <li>[DocumentJS.Static | @static] - add to the previous class or constructor's static functions</li>
 *     <li>[DocumentJS.Add |@add] - add docs to a class or construtor described in another file</li>
 * </ul>    
 * <p>Finally, you have [DocumentJS.Directive|directives] that provide addtional info about the comment:</p>
 * <ul>
 *     <li>[DocumentJS.Directive.Alias|@alias] - another commonly used name for Class or Constructor</li>
 *     <li>[DocumentJS.Directive.Author|@author] - author of class</li>
 *     <li>[DocumentJS.Directive.CodeStart|@codestart] -> [DocumentJS.Directive.CodeEnd|@codeend] - insert highlighted code block</li>
 *     <li>[DocumentJS.Directive.Hide|@hide] - hide in Class view</li>
 *     <li>[DocumentJS.Directive.Inherits|@inherits] - what the Class or Constructor inherits</li>
 *     <li>[DocumentJS.Directive.Init|@init] - constructor function</li>
 *     <li>[DocumentJS.Directive.Param|@param] - A function's parameter</li>
 *     <li>[DocumentJS.Directive.Plugin|@plugin] - by which plugin this object gets steald</li>
 *     <li>[DocumentJS.Directive.Return|@return] - what a function returns</li>
 *     <li>[DocumentJS.Directive.Tag|@tag] - tags for searching</li>
 * </ul>
 * <h3>Example</h3>
 * The following documents a Person constructor.
 * @codestart
 * /* @constructor
 *  * Person represents a human with a name.  Read about the 
 *  * animal class [Animal | here].
 *  * @init 
 *  * You must pass in a name.
 *  * @params {String} name A person's name
 *  *|
 * Person = function(name){
 *    this.name = name
 *    Person.count ++;
 * }
 * /* @Static *|
 * steal.Object.extend(Person, {
 *    /* Number of People *|
 *    count: 0
 * })
 * /* @Prototype *|
 * Person.prototype = {
 *   /* Returns a formal name 
 *    * @return {String} the name with "Mrs." added
 *    *|
 *   fancy_name : function(){
 *      return "Mrs. "+this.name;
 *   }
 * }
 * @codeend
 * There are a few things to notice:
 * <ul>
 *     <li>The example closes comments with <i>*|</i>.  You should close them with / instead of |.</li>
 *     <li>We create a link to another class with <i>[Animal | here]</i>.</li>
 * </ul>
 * 
 * <h3>Using with a JavaScritpMVC application</h3>
 * By default, compression will automatically document your code.  Simply compress your application with:
 * <pre>js apps/app_name/compress.js</pre>
 * The docs will be put in your docs folder.
 * <h3>Using without JavaScriptMVC</h3>
 * Coming soon ... maybe.
 * <h3>Inspiration</h3>
 * DocumentJS was inspired by the [http://api.jquery.com/ jQuery API Browser] by [http://remysharp.com/ Remy Shharp]
 */
DocumentJS.extend(DocumentJS,
/* @Static */
{    
    render_to: function(file, ejs, data){
        new DocumentJS.File(file).save( new DocumentJS.EJS({ absolute_url : ejs }).render(data)  );
        //MVCOptions.save(file,  this.render(ejs, data) );
    },
    render : function(ejs, data){
         var v = new DocumentJS.EJS({text: readFile(ejs), name: ejs });
        return v.render(data)
    },
    /**
     * Replaces content in brackets [] with a link to source.
     * @param {String} content Any text, usually a commment.
     */
    link_content : function(content){
        return content.replace(/\[\s*([^\|\]\s]*)\s*\|?\s*([^\]]*)\s*\]/g, function(match, first, n){
            //need to get last
            //need to remove trailing whitespace
            var url = DocumentJS.objects[first];
            if(url){
                if(!n){
                    n = first.replace(/\.prototype|\.static/,"")
                }
                return "<a href='"+url+"'>"+n+"</a>"
            }else if(typeof first == 'string' && first.match(/^https?|www\.|#/)){
                return "<a href='"+first+"'>"+(n || first)+"</a>"
            }
            return  match;
        })
    },
    /**
     * Will replace with a link to a class or function if appropriate.
     * @param {Object} content
     */
    link : function(content){
        var url = DocumentJS.objects[content];
        return url ? "<a href='#&who="+content+"'>"+content+"</a>" : content;
    },
    /**
     * A map of the full name of all the objects the application creates and the url to 
     * the documentation for them.
     */
    objects : {},
    get_template : function(template_name){
        var temp = readFile("docs/templates/"+template_name+".ejs");
        if(!temp)
            temp = readFile("jmvc/plugins/documentation/templates/"+template_name+".ejs");
        
        var v = new DocumentJS.EJS({text: temp, name: template_name });
        return v;
    }
});

/**
 * @constructor
 * @hide
 * Creates documentation for an application
 * @init
 * Generates documentation from the passed in files.
 * @param {Array} total An array of path names or objects with a path and text.
 * @param {Object} app_name The application name.
 */
DocumentJS.Application = function(total, app_name){
    
    this.name = app_name;
    this.total = total;
    this.files = [];
    
    
    for(var s=0; s < total.length; s++){
        //print(total[s].path+"->"+total[s].src)
		print("calling ...")
		this.files.push( new DocumentJS.Script(total[s]) ) 
	}
}


DocumentJS.Application.prototype = 
/* @prototype */
{
    /**
     * Creates the documentation files.
     */
    generate : function(){
        /* Make the needed directory structure for documentation */
        //new steal.File('docs/classes/').mkdirs();
         this.all_sorted = DocumentJS.Class.listing.concat( DocumentJS.Constructor.listing ).sort( DocumentJS.Pair.sort_by_name )
        var summary = this.left_side();
        
        //make classes
        for(var i = 0; i < DocumentJS.Class.listing.length; i++){
            DocumentJS.Class.listing[i].toFile(this.name);
        }
        //DocumentJS.Class.create_index();
        
        //make constructors
        for(var i = 0; i < DocumentJS.Constructor.listing.length; i++){
            DocumentJS.Constructor.listing[i].toFile(this.name);
        }
        //make functions
        
        for(var i = 0; i < DocumentJS.Function.listing.length; i++){
            DocumentJS.Function.listing[i].toFile(this.name);
        }
        for(var i = 0; i < DocumentJS.Page.listing.length; i++){
            DocumentJS.Page.listing[i].toFile(this.name);
        }
        
        for(var i = 0; i < DocumentJS.Attribute.listing.length; i++){
            DocumentJS.Attribute.listing[i].toFile(this.name);
        }
        
        
        this.summary_page(summary)
    },
    /**
     * @return {string} The left side bar.
     */
    left_side: function(){

        return readFile("docs/templates/left_side.ejs") ? 
            DocumentJS.render("docs/templates/left_side.ejs", this) : 
            DocumentJS.render("jmvc/plugins/documentation/templates/left_side.ejs" , this)
    },
    get_name : function(i){
        var me = this.all_sorted[i].name
        if(i == 0) return me;
        
        //break previous and self
        var previous = this.all_sorted[i-1].name;
        var t = me.split(/\./)
        var p = previous.split(/\./);
        var left_res = [], right_res = []
        for(var j = 0; j < t.length; j++){
            if(p[j] && p[j] ==  t[j])
                left_res.push(t[j])
            else
                right_res.push(t[j])
        }
        return (left_res.length > 0 ? 
        "<span class='matches_previous'>"+left_res.join(".")+".</span>" : "")+right_res.join(".")
    },
    /**
     * Creates a page for all classes and constructors
     * @param {String} summary the left hand side.
     */
    summary_page : function(summary){
        //find index page
        for(var p = 0; p < DocumentJS.Page.listing.length; p++){
            if(DocumentJS.Page.listing[p].full_name() == 'index')
                this.indexPage = DocumentJS.Page.listing[p];
        }
        //checks if you have a summary
        if( readFile("apps/"+this.name+"/summary.ejs") ){
            DocumentJS.render_to(this.name+"_doc.html","../../apps/"+this.name+"/summary.ejs" , this)
        }else{
            print("Using default page layout.  Overwrite by creating: apps/"+this.name+"/summary.ejs");
            DocumentJS.render_to(this.name+"_doc.html","../../jmvc/plugins/documentation/templates/summary.ejs" , this)
        }
        this.searchData();
        
    },
    indexOf : function(array, item){
        var i = 0, length = array.length;
        for (; i < length; i++)
          if (array[i] === item) return i;
        return -1;
    },
    addTagToSearchData : function(data, tag, searchData){
        
        var letter, l, depth=2, current= searchData;
        
        for(l=0; l < depth; l++){
            letter = tag.substring(l,l+1);
            if(!current[letter]){
                current[letter] = {};
                current[letter].list = [];
            }
            if(this.indexOf(current[letter].list, data) == -1)
                current[letter].list.push(data);
            current = current[letter];
        }
    },
	addToSearchData : function(list, searchData){
		var c, parts, part,  p,  fullName;
		for(var i =0; i < list.length; i++){
            c = list[i];
            //break up into parts
            fullName = c.full_name();
            searchData.list[fullName] = {name: fullName, shortName: c.Class.shortName.toLowerCase(), title: c.title, tags: c.tags};
			parts = fullName.split(".");
            for(p=0; p< parts.length; p++){
                part = parts[p].toLowerCase();
                if(part == "jquery") continue;
                this.addTagToSearchData(fullName, part, searchData)
            }
            //now add tags if there are tags
            if(c.tags){
                for(var t=0; t< c.tags.length; t++)
                    this.addTagToSearchData(fullName, c.tags[t], searchData);
            }
            
        }
	},
    searchData : function(){
        var sortedClasses = DocumentJS.Class.listing.sort( DocumentJS.Pair.sort_by_name )
        
		//go through and create 2 level hash structure
        var searchData = {list: {}};
        
        var docData = {};
        
        
        
        this.addToSearchData(sortedClasses, searchData)
        this.addToSearchData(DocumentJS.Function.listing, searchData)
        this.addToSearchData(DocumentJS.Constructor.listing, searchData)
		this.addToSearchData(DocumentJS.Static.listing, searchData)
		this.addToSearchData(DocumentJS.Prototype.listing, searchData)
		this.addToSearchData(DocumentJS.Page.listing, searchData)
        this.addToSearchData(DocumentJS.Attribute.listing, searchData)
        
        new DocumentJS.File(this.name+"/docs/searchData.json").save("C("+DocumentJS.toJSON(searchData, false)+")");

    },
    /**
     * Only shows five folders in a path.
     * @param {String} path a file path to convert
     * @return {String}
     */
    clean_path : function(path){
        return path;
        var parts = path.split("/")
         if(parts.length > 5) parts = parts.slice(parts.length - 5);
         return parts.join("/");
    }
}