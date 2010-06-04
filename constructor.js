/**
 * Documents javascript constructor classes typically created like:
 * new MyContructor(args).
 * 
 * A constructor can be described by putting @constructor as the first declaritive.
 * To describe the construction function, write that after init.  Example:
 * 
 * @codestart
 * /* @constructor
 *  * Person represents a human with a name 
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
 * 
 */
DocumentJS.Pair.extend('DocumentJS.Constructor',
/* @Static */
{
    code_match: DocumentJS.Function.code_match,
    starts_scope: true,
    listing: [],
    create_index : function(){
        var res = '<html><head><link rel="stylesheet" href="../style.css" type="text/css" />'+
            '<title>Constructors</title></head><body>'
        res += '<h1>Constructors <label>LIST</label></h1>'
        for(var i = 0; i < this.listing.length; i++){
            var name = this.listing[i].name;
            res += "<a href='"+name+".html'>"+name+"</a> "
        }
        res +="</body></html>"
        new steal.File('docs/constructors/index2.html').save(res);
        //MVCOptions.save('docs/constructors/index2.html', res)
    },
    init : function(){
        this.add(
                DocumentJS.Directive.Init, 
                DocumentJS.Directive.Param, 
                DocumentJS.Directive.Inherits,
				DocumentJS.Directive.Parent,
                DocumentJS.Directive.Author,
                DocumentJS.Directive.Return,
				DocumentJS.Directive.Download,
                DocumentJS.Directive.Hide, DocumentJS.Directive.CodeStart, DocumentJS.Directive.CodeEnd, DocumentJS.Directive.Alias,
                DocumentJS.Directive.Plugin, DocumentJS.Directive.Tag, DocumentJS.Directive.iFrame, DocumentJS.Directive.Demo,
				DocumentJS.Directive.Test);
        this._super();
		this.serialize('name',['linker','children'],'inherits','alias',['real_comment','comment'],'shortName',
		'ret','params','plugin','tags','download','downloadSize',['init_description','init'],'test')
    }
},
/* @Prototype */
{
    /**
     * 
     * @param {Object} comment
     * @param {Object} code
     * @param {Object} scope
     */
    init: function(comment, code, scope ){
        this._super(comment, code, scope);
        //this.Class.listing.push(this);
    },
    add_parent : function(scope){
		while(scope.Class.shortName.toLowerCase() != 'script'){
            scope = scope.parent;
            if(!scope)
                print("cant find file parent of "+this.comment)
            
        }
        this.parent = scope;
        this.parent.add(this);
    },
    code_setup: DocumentJS.Function.prototype.code_setup,
    toFile : function(name){
        //try{
			var res = this.jsonp();
            new steal.File('apps/'+name+'/docs/'+this.name+".json").save(res);
        //}catch(e ){
        //    throw
        //}
    },
    /**
     * Returns the HTML signiture of the constructor function.
     */
    signiture : function(){
            var res = [];
            var ordered = this.ordered_params();
            for(var n = 0; n < ordered.length; n++){
                res.push(ordered[n].name)
            }
            var n = this.alias ? this.alias : this.name;
            //if(this.parent.Class.shortName == 'static')
            //    n = this.parent.parent.name+"."+this.name;
            //else if(this.parent.Class.shortName == 'prototype')
            //    n = this.parent.parent.name.toLowerCase()+"."+this.name;
            if(this.ret.type =='undefined'){
                n = "new "+n;
                this.ret.type = this.alias ? this.alias.toLowerCase() : this.name.toLowerCase();
            }
            return n+"("+res.join(", ")+") -> "+this.ret.type;
    },
    cleaned_comment : function(){
        return DocumentJS.link_content(this.real_comment).replace(/\n\s*\n/g,"<br/><br/>");
    },
    url : function(){
        return this.name+".html";
    },
    comment_setup_complete : function(){
        if(!this.name){
            print("Error! No name defined for \n-----------------------")
            print(this.comment)
            print('-----------------------')
        } else if(!this.init_description){
            print("Error! No init_description defined for "+this.name+"\n-----------------------")
            print(this.comment)
            print('-----------------------')
        }
    },
    constructor_add: function(line){
        var m = line.match(/^@\w+ ([\w\.]+)/)
        if(m){
            this.name = m[1];
        }
    }
});