/**
 * @hide
 * Documents a 'Class'.  A class is typically a collection of static and prototype functions.
 * steal Doc can automatically detect classes created with steal.Class.  However, you can make anything
 * a class with the <b>@class <i>ClassName</i></b> directive.
 * @author Jupiter IT
 * @codestart
 * /**
 *  * Person represents a human with a name.  Read about the 
 *  * animal class [Animal | here].
 *  * @init 
 *  * You must pass in a name.
 *  * @params {String} name A person's name
 *  *|
 * Person = Animal.extend(
 * /* @Static *|
 * {
 *    /* Number of People *|
 *    count: 0
 * },
 * /* @Prototype *|
 * {
 *    init : function(name){
 *      this.name = name
 *      this._super({warmblood: true})
 *    },
 *    /* Returns a formal name 
 *    * @return {String} the name with "Mrs." added
 *    *|
 *   fancy_name : function(){
 *      return "Mrs. "+this.name;
 *   }
 * })
 * @codeend
 */
DocumentJS.Pair.extend('DocumentJS.Page',
/* @Static */
{
    starts_scope: true,
    listing: [],
    /**
     * Loads the class view.
     */
    init : function(){
        this.add(
        DocumentJS.Directive.CodeStart, DocumentJS.Directive.CodeEnd,
		DocumentJS.Directive.Tag, DocumentJS.Directive.iFrame, DocumentJS.Directive.Demo, DocumentJS.Directive.Parent)
        
        this._super();
        
        var ejs = "jmvc/plugins/documentation/templates/file.ejs"
        
		this.serialize("name",['real_comment','comment'],"shortName","title",['linker','children'])
    }
},
/* @Prototype */
{
    /**
     * Verifies the class was created successfully.
     */
    comment_setup_complete : function(){
        if(!this.name){
            print("Error! No name defined for \n-----------------------")
            print(this.comment)
            print('-----------------------')
        }  
    },

    
    code_setup: function(){
        
    },
    page_add: function(line){
        var m = line.match(/^@\w+\s+([^\s]+)\s+(.+)/)
        if(m){
            this.name = m[1];
            this.title = m[2] || this.name;
        }
    },
    /**
     * Renders this class to a file.
     * @param {String} left_side The left side content / list of all documented classes & constructors.
     */
    toFile : function(name){
        try{
            var res = this.jsonp();
            new steal.File('apps/'+name+'/docs/'+this.name.replace(/ /g,"_")+".json").save(res);
            
        }catch(e ){
            print("Unable to generate class for "+this.name+" !")
            print("  Error: "+e)
        }
    },
    cleaned_comment : function(){
        return DocumentJS.link_content(this.real_comment).replace(/\n\s*\n/g,"<br/><br/>");
    },
	full_name : function(){
		return this.name;
	},
	add_parent : function(scope){
        //always go back to the file:
        while(scope.Class.shortName.toLowerCase() != 'script') scope = scope.parent;
        this.parent = scope.children.length ? scope.children[0] : scope;
        this.parent.add(this);
    }
    
});