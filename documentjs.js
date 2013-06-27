steal('documentjs/generator',
	function (generate) {
/**
	 * @function DocumentJS
	 * @module documentjs
	 * @parent javascriptmvc 4
	 * 
	 * @description DocumentJS makes it easy to produce beautiful
	 * and useful documentation for your JavaScript project.
	 * 
	 * @signature `DocumentJS(folder,[options])`
	 * Documents everything in a folder path.
	 * 
	 *     DocumentJS("myproject",{});
	 * 
	 * will generate "myproject/docs.html" and resources in "myproject/docs/".
	 * 
	 * @param {String} folder The folder location to search for files ending with
	 * `.js`.
	 * @param {{}} [options] Options that configure the behavior of DocumentJS.
	 * @option {Array.<String>} markdown An array of folders to look for markdown files in. Defaults to `folder`.
	 * @option {String} out Where to place the docs.html and the docs/ folder. Defaults to `folder`.
	 * @option {String} index The name of the object to be documented. Defaults to `folder`.
	 * @option {String} static The file location of static file overwrites for the content 
	 * in `documentjs/site/defaults/static`. The content at `static` is copied to `documentjs/site/static/build` where
	 * the `documentjs/site/static/build/build.js` module is stolen.  The function it returns is called. That
	 * function should copy the production ready files to `documentjs/site/static/dist` where they will
	 * be copied to `{out}/static`.
	 * 
	 * @option {String} templates The file location of template overrides of `documentjs/site/defaults/templates`.
	 * 
	 * The most common templates to overwrite are:
	 * 
	 *  - _layout.mustache_ - the page's headers / footers and script tags it loads.
	 *  - _docs.mustache_ - the the content of the page.
	 * 
	 * @signature `DocumentJS(files,[options])`
	 * Documents a set of code organized in files.
	 * @param {Array.<{src:String,text:String}>} files The files to document. Each file given should include these options:
	 *
	 * - `{String}` src The path to the file that contains some code.
	 * - `{String}` text The code from the file named in *src*.
	 *
	 * @codestart
	 * [{src: "path/to/file.js", text: "var a= 1;"}, { ... }]
	 * @codeend
	 * 
	 * @param {{}} [options] Options that configure the behavior of DocumentJS.
	 * These are the same as the options for [The other signature](#sig0).
	 * 
	 * @body
	 * 
     * ## Features
     * 
	 * 
     * - Flexible organization of your documentation
     * - An integrated documentation viewer where you can search your API
     * - Markdown support
     * - An extensible architecture
     * 
	 * DocumentJS provides powerful and easy to extend documentation functionality.
	 * It's smart enough to guess 
	 * at things like function names and parameters, but powerful enough to generate 
	 * <span class='highlight'>JavaScriptMVC's entire website</span>!
	 * 
	 * ## Organizing your documentation
	 *
	 * Let's use an hypothetical little CRM system as an example of how easy it is to organize your documentation with DocumentJS. 
	 * 
	 * First let's create our CRM documentation home page by creating a folder name __crm__. Paste this code into a file named __crm.js__ inside __crm__ folder.
	 * 
	 * @codestart
	 * /*
     *  * @@page index CRM
     *  * @@tag home
     *  *
     *  * ###Little CRM
     *  *  
     *  * Our little CRM only has two classes:
     *  *  
     *  * * Customer 
     *  * * Order 
     *  *|
	 * @codeend
	 * 
	 * Run the documentjs script to generate the docs:
	 * 
	 *
	 *     documentjs/doc.bat crm
	 * 
	 * 
	 * This is what you should see when you open __crm\docs.html__:
	 * 
	 * @image ../jmvc/site/images/crm_doc_demo_1.png
	 * 
	 * 
	 * There are a few things to notice:
	 * 
	 * * We create a link to another class with _[Animal here]_. 
	 * * We used the @@page directive to create the crm documentation home page. Don't worry about the @@tag directive for now, we'll get back to it later. 
	 * * In all the examples in this walkthrough we use markdown markup instead of html to make the documentation more maintainable and easier to read .
	 * 
	 * Next we document the two classes that make our little crm system. Paste each snippet of code into two files with names __customer.js__ and __order.js__:
	 * 
	 * __customer.js__
	 * 
	 * @codestart
     * /*
     *  * @@class Customer
     *  * @@parent index
     *  * @@constructor
     *  * Creates a new customer.
     *  * @@param {String} name
     *  *|
     *  var Customer = function(name) {
	 *     this.name = name;
     *  }
	 * @codeend 
	 * 
	 * __order.js__
	 * 
	 * @codestart
     * /*
     *  * @@class Order
     *  * @@parent index
     *  * @@constructor
     *  * Creates a new order.
     *  * @@param {String} id
     *  *|
     *  var Order = function(id) {
	 *     this.id = id;
     *  }
	 * @codeend 
	 * 
	 * After running the documentjs script once again you should be able to see this:
	 * 
	 * @image ../jmvc/site/images/crm_doc_demo_2.png
	 * 
	 * 
	 * We want to be able to both look for our customer's orders and dispatch them so let's add a _findById_ method to our Order class
	 * and a _dispatch_ method to our Order's prototype:
	 * 
	 * __order.js__
	 * 
	 * @codestart
	 * /*  
     *  * @class Order 
     *  * @parent index 
     *  * @@constructor
     *  * Creates a new order.
     *  * @@param {String} id
     *  *|
     * var Order = function(id) {
     *     this.id = id;
     * }
     *
     * $.extend(Order,
     * /*
     * * @@static
     * *|
     * {
	 *    /*
	 *     * Finds an order by id.
	 *     * @@param {String} id Order identification number.
	 *     * @@param {Date} [date] Filter order search by this date.
	 *     *|
	 *     findById: function(id, date) {
     *
	 *     }
     *  });
     *
     * $.extend(Order.prototype,
     * /*
     *  * @@prototype
     *  *|
     *  {
	 *     /*
	 *      * Dispatch an order.
	 *      * @@return {Boolean} Returns true if order dispatched successfully.
	 *      *|
	 *      dispatch: function() {
	 *     
	 *      }
     * });
	 * @codeend
	 * 
	 * Go ahead and produce the docs by running the documentjs script. You should see your Order methods organized by static and protoype categories.
	 * 
	 * There's one last thing we need to cover - customizing the document viewer template. The default viewer template file name is __summary.ejs__ and it's
	 * located in __documentjs/jmvcdoc/summary.ejs__. You can use a customized template by copying __summary__.ejs into the __crm__ folder and changing it 
	 * according to your needs. Let's try changing the navigation menu __core__ item to __crm__:
	 * 
	 * @codestart
	 * &lt;li class="ui-menu-item"&gt;
	 *     &lt;a class="menuLink" href="#&amp;search=crm"&gt;&lt;span class="menuSpan"&gt;CRM&lt;/span&gt;&lt;/a&gt;
     * &lt;/li&gt;
	 * @codeend
	 *
	 * Remember the @@tag directive? We can now change it in our examples from _core_ to _crm_. You will notice that our crm page will show up
	 * every time you click the CRM menu item or type _crm_ in the documentation viewer search box.
	 * 
	 * If you need for DocumentJS not to document a particular script you can do that by adding the @document-ignore directive to the top of the file. 
	 * 
	 * As you see DocumentJS makes it super easy and fun to organize your documentation!
	 * 
	 * ## How DocumentJS works
	 * 
	 * DocumentJS architecture is organized around the concepts of [DocumentJS.types types] and [DocumentJS.tags tags]. Types are meant to represent every JavaScript construct 
	 * you might want to comment like classes, functions and attributes. Tags add aditional information to the comments of the type being processed.
	 * 
	 * DocumentJS works by loading a set of JavaScript files, then by spliting each file into type/comments pairs 
	 * and finally parsing each type's comments tag directives to produce a set of html files (one per type) 
	 * that are used by the document viewer (jmvcdoc) to render the documentation.
	 * 
	 * DocumentJS was written thinking of extensibility, so it's very easy to add custom type/tag directives to handle your specific documentation needs.
	 *
	 * DocumentJS currently requires [stealjs Steal] to be included on the pages you are documenting.   
	 * 
	 * ###Type directives
	 * 
	 * * [DocumentJS.tags.add @add] - add docs to a class or constructor described in another file.
	 * * [DocumentJS.tags.constructor @constructor] - document a class or constructor. 
	 * * [DocumentJS.tags.function @function] - document functions.
	 * * [DocumentJS.tags.page @page] -  add a standalone page.
	 * * [DocumentJS.tags.property @property] -  document values on an object.
	 * * [DocumentJS.tags.prototype @prototype] - add to the previous class or constructor's prototype functions.
	 * * [DocumentJS.tags.static @static] - add to the previous class or constructor's static functions.
	 * 
	 * ###Tag directives
	 * 
	 * * [DocumentJS.tags.alias @alias] - another commonly used name for Class or Constructor.
	 * * [DocumentJS.tags.author @author] - author of class.
	 * * [DocumentJS.tags.codestart @codestart] and [DocumentJS.tags.codeend @codeend] - insert highlighted code block.
	 * * [DocumentJS.tags.constructor @constructor] - documents a contructor function and its parameters.
	 * * [DocumentJS.tags.demo @demo] - placeholder for an application demo.
	 * * [DocumentJS.tags.download @download] - adds a download link.
	 * * [DocumentJS.tags.hide @hide] - hide in Class view.
	 * * [DocumentJS.tags.iframe @iframe] - adds an iframe with example code.
	 * * [DocumentJS.tags.image @image] - adds an image.
	 * * [DocumentJS.tags.inherits @inherits] - what the Class or Constructor inherits.
	 * * [DocumentJS.tags.parent @parent] - says under which parent the current type should be located. 
	 * * [DocumentJS.tags.param @param] - A function's parameter.
	 * * [DocumentJS.tags.plugin @plugin] - by which plugin this object gets steal'd.
	 * * [DocumentJS.tags.release @release] - specifies the release.
	 * * [DocumentJS.tags.return @return] - what a function returns.
	 * * [DocumentJS.tags.tag @tag] - tags for searching.
	 * * [DocumentJS.tags.test @test] - link for test cases.
	 * * [DocumentJS.tags.typedef @typedef] - aliases a complex type for use in other documentation.
	 * 
	 * 
	 * ## Inspiration
	 * 
	 * DocumentJS was inspired by the [http://api.jquery.com/ jQuery API Browser] by [http://remysharp.com/ Remy Sharp]
	 */

	return generate;
});
