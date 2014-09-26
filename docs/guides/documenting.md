@page DocumentJS.guides.documenting documenting
@parent DocumentJS.guides 2

Learn how to document your code.

@body

This guide walks you through adding the right [documentjs.tags tags] to your source
or markdown files to create documentation useful to your users.  

Every markdown file or comment block like `/** */` gets turned into 
a [documentjs.process.docObject docObject].  Those `docObjects` are used to render templates
to generate the output html.  

Tags like `@function` within a markdown file or comment block add or change
properties on the [documentjs.process.docObject docObject].  Understanding
the [documentjs.tags tags] behavior is the key to making useful documentation.

## Types

A [documentjs.process.docObject docObject's] most important tag is the one that determines its
type.  The following tags are the type tags and what they document:

 - [documentjs.tags.module @module] - A module's export value.
 - [documentjs.tags.typedef @typedef] - Defines a custom type.
 - [documentjs.tags.page @page] - A page of information.
 - [documentjs.tags.function @function] - A JavaScript function.
 - [documentjs.tags.constructor @constructor] - A JavaScript function intended to be called with `new`.
 - [documentjs.tags.static @static] - Creates a placeholder for static properties on a constructor.
 - [documentjs.tags.prototype @prototype] - Creates a placeholder for prototype properties on a constructor.
 - [documentjs.tags.property @property] - Creates a property value on an object.

A `module` and `typedef` tag can document other types like a function.  For example,
use `@module` when something is both module and a function.

## Structuring your documentation

DocumentJS is very flexible about how your modules get organized in the sidebar and how they
link to each other. The following describes useful patterns for different types of projects:

 - Multi module projects that use a module loader.

### Multi module projects that use a module loader

This section describe how best to document a project or application that
has many individual modules that you want documented.

For this scenario, it's common to use the [documentjs.tags.module @module] tag. It can be used
to document modules that return:

 - A single function. Ex: `@module {function} module/name`
 - An object with properties. Ex: `@module {{}} module/name`
 - A single constructor function. Ex: `@module {function():module/name} module/name`

[Here's an example multi-module project](https://github.com/bitovi/documentjs/tree/multi-version/examples/multi) 
and its [generated docs](../examples/multi/index.html).  It consists of:

 - An overview page with a grouping for modules and guides.
 - An example of a [constructor function](examples/multi/multi|lib|graph.html).
 - An example [typedef](../examples/multi/multi|lib|graph.graphData.html) used by the constructor function
   to document the constructor function's arguments.
 - An example [function](../examples/multi/multi|util|add.html) module.
 - An example [object](../multi/multi|util|date-helpers.html) module.







