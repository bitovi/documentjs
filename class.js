/**
 * @hide
 * Documents a 'Class'.  A class is typically a collection of static and prototype functions.
 * steal Doc can automatically detect classes created with jQuery.Class.  However, you can make anything
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
DocumentJS.Pair.extend('DocumentJS.Class',
/* @Static */
{
    code_match: /([\w\.\$]+?).extend\(\s*["']([^"']*)["']/,  // /([\w\.]*)\s*=\s*([\w\.]+?).extend\(/,
    starts_scope: true,
    listing: [],
    /**
     * Loads the class view.
     */
    init : function(){
        this.add(DocumentJS.Directive.Inherits, 
        DocumentJS.Directive.Author,
        DocumentJS.Directive.Hide,
		DocumentJS.Directive.Download,
        DocumentJS.Directive.CodeStart, 
		DocumentJS.Directive.CodeEnd, 
		DocumentJS.Directive.Alias,
        DocumentJS.Directive.Plugin, 
		DocumentJS.Directive.Tag, 
		DocumentJS.Directive.iFrame, 
		DocumentJS.Directive.Parent, 
		DocumentJS.Directive.Demo,
		DocumentJS.Directive.Test)
        
        this._super();
        
        var ejs = "jmvc/plugins/documentation/templates/file.ejs"
        
		this.serialize('name',['linker','children'],'author','inherits','alias',['real_comment','comment'],
		'plugin','shortName','tags','download','downloadSize','test')
    }
},
/* @Prototype */
{
    /**
     * Called when a new class comment is encountered.
     * @param {String} comment the comment text
     * @param {String} code the first line of source following the comment
     * @param {DocumentJS.Pair} scope where the class was created, typically the file
     */
    init: function(comment, code, scope ){
        this._super(comment, code, scope);
        
    },
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
    /**
     * Adds this class to the file it was created in.
     * @param {DocumentJS.Pair} scope
     */
    add_parent : function(scope){
        //always go back to the file:
        while(scope.Class.shortName.toLowerCase() != 'script') scope = scope.parent;
        this.parent = scope;
        this.parent.add(this);
    },
    
    code_setup: function(){
        var parts = this.code.match(this.Class.code_match);
        this.name = parts[2];
        this.inherits = parts[1].replace("$.","jQuery.");
    },
    class_add: function(line){
        
        var m = line.match(/^@\w+ ([\w\.]+)/)
        if(m){
            this.name = m[1];
        }
    },
    /**
     * Renders this class to a file.
     * @param {String} left_side The left side content / list of all documented classes & constructors.
     */
    toFile : function(name){
        try{
            var res = this.jsonp();
            new steal.File('apps/'+name+'/docs/'+this.name+".json").save(res);
            
        }catch(e ){
            print("Unable to generate class for "+this.name+" !")
            print("  Error: "+e)
        }
    },
    /**
     * Returns a comment that has been cleaned.
     */
    cleaned_comment : function(){
        return DocumentJS.link_content(this.real_comment).replace(/\n\s*\n/g,"<br/><br/>");
    },
    /**
     * Returns the url for this page
     * @return {String}
     */
    url : function(){
        return this.name+".html";
    }
    
});