@page DocumentJS.guides.contributing contributing
@parent DocumentJS.guides 5

Learn how to contribute to DocumentJS.

@body

DocumentJS's code is broken down into the following folders:

 - find - get each file that should be processed
 - build - build the templates used to generate the site and 
   the static resources used by the generated site
 - process - convert each file into a [Document.docObject].
 - generate - write out the 
 - configure - Reads `documentjs.json` and calls out to modules in the previous folders. 