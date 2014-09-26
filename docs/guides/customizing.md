@page DocumentJS.guides.customizing customizing
@parent DocumentJS.guides 4

Learn how to change the appearence of your generated html documentation.

@body

The [documentjs.generators.html html generator] allows you to completely
customize the look and behavior of the site. You can also supply your
own generators to build other forms of documentation.

## Customizing the default HTML generator

You can customize the templates and helpers
used to render a [documentjs.process.docObject docObject] and customize
the JavaScript and CSS used by the HTML pages.  This behavior
is controlled mostly by the [DocumentJS.siteConfig siteConfig]'s
`templates` and `static` options.  However, some tags like [documentjs.tags.hide @hide]
allow you to alter the behavior slightly.

## Changing the HTML

The [documentjs.generators.html html generator] uses 
[Handlebars](http://handlebarsjs.com/) templates and helpers 
to render [documentjs.process.docObject docObjects]. Overwrite the 
default templates with the [DocumentJS.siteConfig siteConfig] `templates` 
option. If you are producing a multi-versioned site, and you want all versions
to have the same template, your website's [DocumentJS.docConfig documentjs.json] might
look like:

    {
      "versions": { ... }
      "siteDefaults": {
        "templates": "theme/templates"
      }
    } 

The `templates` path should be specified relative to the `documentjs.json` folder.

This will use the templates (and helpers) in "theme/templates" to overwrite
the default helpers and templates. The default templates can be found 
in `documentjs/site/default/templates`.  

`documentjs/site/default/templates` has the following templates:

 - _layout.mustache_ - Contains the outer most content that is the same on every page. 
   The page's script tags are loaded here.
 - _content.mustache_ - Rendered within _layout.mustache_. It calls out to all other templates as partials.
 - _menu.mustache_ - The sidebar menu.
 - _active-menu.mustache_ - The part of the sidebar menu that shows the children of the active item.
 - _signature.mustache_ - Shows a "signature" block.  A signature block for a function has the signature of the function and the params listed within it.
 - _title.mustache_ - The header of each rendered page.
 - _types.mustache_ - Convince template that given [documentjs.process.valueData] through each of their [documentjs.process.typeData types] and creates a signature with it.

For example, to make a change to the layout, copy _documentjs/site/default/templates/layout.mustache_
to _theme/templates_ and make changes in your copy.

#### Adding Helpers

You can add and use your own Handlebars helpers by creating a `.js` file in
your templates directory.  For example, you can 
create _theme/templates/helpers.js_.  Any `.js` file will be required
as a module with CommonJS.  The module is expect to export a 
[documentjs.generators.html.types.makeHelpers makeHelpers function] like:

    // theme/templates/helpers.js
    module.exports = function(docMap, options, getCurrent){
      return {
        "hello-world" : function(){
          return "Hello World!"
        }
      }
    };

This allows you to write `{{hello-world}}` and get back:

    Hello World!

This behavior is provided by [documentjs.generators.html.build.helpers generators.html.build.helpers].

## Changing static resources: Styles, Images, and JavaScript

The html generator [documentjs.generators.html.build.staticDist builds a static distributable] that
includes the CSS, Images, and JavaScript used by the site.  The default content
used to build the site can be found within _documentjs/site/default/static_.

You can overwrite the 
default static content with the [DocumentJS.siteConfig siteConfig] `static` 
option. If you are producing a multi-versioned site, and you want all versions
to have the same static content, your website's [DocumentJS.docConfig documentjs.json] might
look like:

    {
      "versions": { ... }
      "siteDefaults": {
        "static": "theme/static"
      }
    } 

After the default and static content have been combined, the `static/build.js` file
is required with CommonJS and run. `static/build.js` is expected to export a
[documentjs.generators.html.types.builder builder] function that builds the final static content
and copies it to a distributable location.

The default builder uses [StealJS](http://stealjs.com) to build a [CanJS](http://canjs.com) and
[LESS](http://lesscss.org) application.  It copies the minfied `css` and `js` bundles as well as
all files in the _static/fonts_, _static/img_, and _static/templates_ folder to the distributable location.  

It's likely you don't have to write a custom builder and can instead overwrite the default CSS, Image, and
JS files used by the builder.

### Changing Styles



### Changing Images


### Changing JavaScript

Not sure what to show.

## Writing your own generator


