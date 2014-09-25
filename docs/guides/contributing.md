@page DocumentJS.guides.contributing contributing
@parent DocumentJS.guides 5

Learn how to contribute to DocumentJS.

@body

DocumentJS's functionality and code are broken down into the following folders within `documentjs/lib`:

- find - Gets each file that should be processed.
 
- [documentjs.process process] - Converts comments and files 
  into a [documentjs.process.docObject docObject] and puts every docObject in 
  the [documentjs.process.docMap docMap].

- [documentjs.tags tags] - Tags used by [documentjs.process process] to add properties to a [documentjs.process.docObject docObject].
 
- [documentjs.generators.html generators/html] - Generates an HTML 
  site given a [documentjs.process.docMap]. This process is futher broken down into:
  
  - generators/html/build - Compile the templates, static resources, and mustache helpers used to generate the site.
  - generators/html/write - Uses the compiled templates, static resources, and helpers to write out the site.

- generate - Given `options`, coordinates between [documentjs.find find] and the [documentjs.generators.html html generator] to 
  produce a site.

- configure - Reads `documentjs.json` and calls out to modules in the previous folders. 