/**
 * A base class for a comment and the line of code following it.
 * @hide
 */
DocumentJS.Class.extend("DocumentJS.Pair",
/* @Static */
{
    code_match: function(){ return null},
    classes: [],
    /**
     * From the comment and code, guesses at the type of comment and creates a new
     * instance of that type.
     * @param {String} comment - the comment
     * @param {String} code - the first line of source following the comment
     * @param {DocumentJS.Pair} scope - The current scope of documentation.  
     * This is typically a Class, Constructor, Static, or Prototype
     * @return {DocumentJS.Pair} - If a type can be found, the new Doc object; otherwise, null.
     */
    create: function(comment, code, scope){
        var check =  comment.match(/^@(\w+)/), type

        if(!(type = this.has_type(check ? check[1] : null)) ){ //try code
            type = this.guess_type(code);
        }
        if(!type) return null;
        
		return new type(comment, code, scope)
    },
    /**
     * Looks for a Doc class with a shortName for the given type
     * @param {String} type a potential shortName
     */
    has_type: function(type){
        if(!type) return null;
		for(var i=0;i< this.classes.length; i++){
            if(this.classes[i].shortName.toLowerCase() == type.toLowerCase() ) 
                return this.classes[i];
        }
        return null;
    },
    /**
     * Tries to guess at a piece of code's type.
     * @param {Object} code
     */
    guess_type: function(code){

		for(var i=0;i< this.classes.length; i++){
            if(this.classes[i].code_match(code) ) 
                return this.classes[i];
        }
        return null;
    },
	suggest_type : function(incorrect, line){
		var lowest = 1000, suggest = "";
		for(var i=0;i< this.classes.length; i++){
            var dist = DocumentJS.distance(incorrect.toLowerCase(), this.classes[i].shortName.toLowerCase())
			if(dist < lowest ){
				lowest = dist
				suggest = this.classes[i].shortName.toLowerCase()
			} 
        }
		for(var i=0;i< DocumentJS.Directive.directives.length; i++){
            var dist = DocumentJS.distance(incorrect.toLowerCase(),  DocumentJS.Directive.directives[i].toLowerCase())
			if(dist < lowest ){
				lowest = dist
				suggest = DocumentJS.Directive.directives[i].toLowerCase()
			} 
        }
		if(suggest){
			print("\nWarning!!\nThere is no @"+incorrect+" directive. did you mean @"+suggest+" ?\n")
		}
	},
    starts_scope: false,
    /**
     * Given a and b, sorts by their full_name property.
     * @param {Object} a
     * @param {Object} b
     */
    sort_by_full_name : function(a, b){
       var af = a.full_name ? a.full_name.toLowerCase() : a.full_name
       var bf = b.full_name ? b.full_name.toLowerCase() : a.full_name
       if(af == bf) return 0;
       return af > bf ? 1: -1;
    },
    sort_by_name : function(a, b){
       var af = a.name ? a.name.toLowerCase() : a.name
       var bf = b.name ? b.name.toLowerCase() : a.name
       
       if(af == bf) return 0;
       return af > bf ? 1: -1;
    },
    /**
     * Loads a template to use to render different doc types.
     */
    init : function(){
		if(this.shortName){   
			 if(DocumentJS.Pair)
			 	DocumentJS.Pair.classes.push(this)
        }
		this.listing = [];
    },
    /**
     * Adds [DocumentJS.Directive|directives] to this class.
     * @codestart
     * {
     *   init: function(){
     *     this._super();
     *     this.add(DocumentJS.Directive.Return, DocumentJS.Directive.Param)
     *   }
     * }
     * @codeend
     */
    add : function(){
        var args = DocumentJS.makeArray(arguments)   
        for(var i = 0; i < args.length; i++){
            this._add(args[i]);
        }
    },
    _add : function(directive){
        var start = directive.shortName.toLowerCase()+"_"
        this.prototype[start+"add"] = directive.prototype.add
        if(directive.prototype.add_more)
            this.prototype[start+"add_more"] = directive.prototype.add_more
    },
    matchDirective : /^\s*@(\w+)/
},
/* @Prototype */
{
    /**
     * Saves coment, code.  Adds self to parent.  Calls code_setup and comment_setup.
     * Finally, adds to DocumentJS.objects.
     * @param {String} comment
     * @param {String} code
     * @param {DocumentJS.Pair} scope
     */
    init : function(comment, code, scope ){
		this.children = [];
		this.shallowParents = [];
        this.comment = comment;
        this.code = code;

        
        
        if(this.Class.code_match(this.code))
            this.code_setup();
        this.comment_setup();
        
		//we need to add to a class if we 
		this.add_parent(scope);
        
        var par = this;
        while(par && !par.url){
            par = par.parent;
        }
        if(par){
            DocumentJS.objects[this.full_name()] = par.url()+(this.url ? "" : "#"+this.full_name() );
        }
		this.Class.listing.push(this);
		if(DocumentJS.Directive.Parent.waiting.hasOwnProperty(this.name)){
			var addOns = DocumentJS.Directive.Parent.waiting[this.name]
			this.children = this.children.concat(addOns)
			for(var i=0;i< addOns.length;i++){
				addOns[i].shallowParents.push(this);
			}
		}
    },
    add: function(child){
        this.children.push(child);
    },
    add_parent : function(scope){
         this.parent = scope;
         this.parent.add(this);
    },
    scope: function(){
        return this.Class.starts_scope ? this : this.parent
    },
    code_setup: function(){},
	jsonp: function(){
		return "C("+$.toJSON(this.json())+")";
	},
    full_name: function(){
        var par = ""
        //print("has parent "+this.parent)
		if(!this.parent){
            print(this.name+" has no parent ")
        }else
            par = this.parent.full_name();
        //print(par+" - "+this.name)
		return (par ? par+"." : "")+this.name ;
    },
    make : function(arr){
        var res = ["<div>"];
        //we should alphabetize by name
        
        for(var c=0; c<arr.length; c++){
            var child = arr[c];
            res.push(child.toHTML());
        }
        res.push("</div>");
        return res.join("");
    },
	/**
	 * Checks if this child should not add its children for the given parent
	 */
	shallowParent : function(parent){
		for(var i = 0; i < this.shallowParents.length;i++){
			if(this.shallowParents[i] === parent){
				return true;
			}
		}
		return false;
	},
    linker : function(stealSelf, parent){
        var result = stealSelf ? [ {name: this.full_name(), shortName : this.Class.shortName.toLowerCase(), title: this.title, hide: (this.hide ? true: false) }] : [];
		if(this.children && ! this.shallowParent(parent)){
            //print(this.name)
			for(var c=0; c<this.children.length; c++){
                var adds = this.children[c].linker(true, this);
                if(adds)
                    result = result.concat( adds );
            }
        }
        return result;
    },
    /**
     * Orders params into an array.
     */
    ordered_params : function(){
            var arr = [];
            for(var n in this.params){
                var param = this.params[n];
                arr[param.order] = param;
            }
            return arr;
    },
    /**
     * Goes through the comment line by line.  Searches for lines starting with a <i>@directive</i>.
     * If a line with a directive is found, it sees if the instance has a function that matches
     * <i>directive</i>_add exists.  If it does, <i>directive</i>_add is called on that object.
     * If following lines do not have a directive, the <i>directive</i>_add_more function is called
     * on the instance
     * <br/>
     * Initial comments are added to real_comment.<br>
     * This function is shared by Class and Constructor.
     */
    comment_setup: function(){
        var i = 0,
			lines = this.comment.split("\n"),
			last, 
			last_data; //what data we are going to be called with
        
		this.real_comment = '';
        if(!this.params) this.params = {};
        if(!this.ret) this.ret = {type: 'undefined',description: ""};
		
		this._last; //what we should be adding too.
		
        for(var l=0; l < lines.length; l++){
            var line = lines[l],
				match = line.match(DocumentJS.Pair.matchDirective)
            
			if (match) {
			
				var fname = (match[1] + '_add').toLowerCase();
				if (!this[fname]) {
					if (!DocumentJS.Pair.has_type(match[1])) {
						DocumentJS.Pair.suggest_type(match[1])
					}
					
					this.real_comment += line + "\n"
					continue;
				}
				last_data = this[fname](line, last_data);
				//horrible ... fix
				if (last_data && last_data.length == 2 && last_data[0] == 'keep') {
					last_data = last_data[1]
				}
				else 
					if (last_data) {
						this._last = match[1].toLowerCase();
					}
					else {
						this._last = null;
					}
				
			}
			else {
				line = line.replace(/@@/g,"@")
				if (!line.match(/^constructor/i) && !this._last) {
					this.real_comment += line + "\n"
				}
				else if (this._last && this[this._last + '_add_more']) {
					this[this._last + '_add_more'](line, last_data);
				}
			}
        }
        if(this.comment_setup_complete) this.comment_setup_complete();
    },
	shortName : function(){
		return this.Class.shortName;
	}
})