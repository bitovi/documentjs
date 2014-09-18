@page DocumentJS.guides.documenting documenting
@parent DocumentJS.guides 2

Learn how to document your code.

@body

This guide walks you through adding the right [DocumentJS.tags tags] to your source
or markdown files to create documentation useful to your users.

Every markdown file or comment block like `/** */` gets turned into 
a [DocumentJS.docObject docObject].  Those `docObjects` are used to render templates
to generate the output html.  

Tags like `@function` within a markdown file or comment block add or change
properties on the [DocumentJS.docObject docObject].  Understanding
the [DocumentJS.tags tags] behavior is the key to making useful documentation.

## Types

A [DocumentJS.docObject docObject's] most important tag is the one that determines its
type.  The following tags are the type tags and what they document:

 - [DocumentJS.tags.module @module] - A module's export value.
 - [DocumentJS.tags.typedef @typedef] - Defines a custom type.
 - [DocumentJS.tags.page @page] - A page of information.
 - [DocumentJS.tags.function @function] - A JavaScript function.
 - [DocumentJS.tags.constructor @constructor] - A JavaScript function intended to be called with `new`.
 - [DocumentJS.tags.static @static] - Creates a placeholder for static properties on a constructor.
 - [DocumentJS.tags.prototype @prototype] - Creates a placeholder for prototype properties on a constructor.
 - [DocumentJS.tags.property @property] - Creates a property value on an object.

## Documenting the `parent` page

DocumentJS expects one 

## Documenting a project that uses a module loader

This section describe how best to document a project or application that
has many individual modules that you want documented.

For example:

 - A server-side node application or client-side CanJS/Angular/Ember application
   that has many internal modules that you want documented.
 - A client-side open source project that is expected to be used with a module loader like
   [CanJS](http://canjs.com).

For this scenario, it's best to use the [DocumentJS.tags.module @module] tag.

[Here's an example](../examples/multi-model-project/index.html).

## Documenting a single module






