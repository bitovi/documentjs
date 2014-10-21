@typedef {{}} documentjs.process.docObject docObject
@parent documentjs.process.types

An object that represents something that is documented. Any 
property added to a docObject is available to the templates and the
client.

The following lists the important, near
universal properties:

@option {String} name The unique name of the object being documented. 
@option {String} type The type of the DocType. This typically represents
the type of the object being documented:

 - constructor
 - prototype
 - static
 - function
 - property
 - typedef
 - module

@option {String} parent The parent 
@option {Array.<String>} children An array of children names. This typically gets
added by the system based on the `parent` property.

@body

## Use

You can see a page's `docObject` by typing `docObject` in the console.