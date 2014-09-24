@typedef {function(documentjs.process.docObject)} documentjs.build.types.renderer(docObject) renderer
@parent documentjs.build.types

A renderer built by [documentjs.build.renderer] that is used to
render each [documentjs.process.docObject docObject].  

@param {documentjs.process.docObject} docObject The [documentjs.tags tag] data
of a comment.

@return {String} The HTML to be outputted.

@body

## Properties

A renderer function also has a `.layout` property which can be used
to render the layout template and a `.content` property that can be used
to render the `content` template.



