@page DocumentJS
@group DocumentJS.guides 0 guides
@group DocumentJS.apis.config 2 Configuration APIS
@group DocumentJS.apis.document 3 Document APIS
@group DocumentJS.apis.command-line 4 Command Line APIS

@group DocumentJS.apis.internal 5 Internal APIS

DocumentJS creates beautiful, articulate, multi-versioned documentation. With DocumentJS, you can:

 - Write documentation inline or in markdown files. 
 - Specify your code's behavior precisely with JSDoc
   and [Google Closure Compiler](https://developers.google.com/closure/compiler/docs/js-for-compiler) 
   annotations.
 - Customize your site's theme and layout.
 - Generate docs for each version of your code.

## Quick Start

This quick start guide reads through all the `.js`, `.md` and `.markdown` files
in a folder and creates a sibling `docs` folder with the 
generated documentation. DocumentJS has many powerful ways of 
configuring its behavior.  Please read through the
guides on your left for more complete examples.

### Install

Install [Node.js](http://nodejs.org/) on your 
computer. Open a console. Use [npm](https://www.npmjs.org/) to 
install DocumentJS:

    > npm install -g documentjs

### Run

Use `cd` to change your working directory to your project. Run
`documentjs`:

    > cd path/to/myproject
    > documentjs

This will find every file that ends with `.js`, `.md` and `.markdown` and
try to create documentation from it. 

### Configure

You probably don't want to document everything, and 
might want to configure the behavior of things like:

 - What files are documented
 - Where the output of the documentation is written
 - What shows up in the navigation sidebar
 - Custom templates, styles, and behavior

To customize DocumentJS's default behavior, create a `documentjs.json`
file in the top level of your project like:

    {
      "sites": {
        "docs": {
          "glob": "src/**/*.{js,md}",
          "out": "api"
        },
        "guides": {
          "glob": "guides/**/*.md",
          "templates": "./site/templates"
        }
      }
    }

This is the [DocumentJS.docConfig docConfig] object.  Each one of 
its [DocumentJS.siteConfig sites configuration objects]
configures the output of a site generated from some source.  In this case, all
JavaScript and Markdown files in `src` are used to generate an `api` site and
all Markdown files in `guides` are used to generate a `guides` 
site rendered with custom templates. Read through the [DocumentJS.docConfig] API to better 
understand all the potential options.

### Document

DocumentJS supports a large amount of [DocumentJS.tags tags] used to mark up the
comments in your code.

### Run Automatically

If you don't want to keep running `documentjs` everytime you make a change,
add `--watch` and DocumentJS will produce a new site whenever a file is changed:

    > documentjs --watch

Read the [DocumentJS.apis.generate.documentjs command line] API for other options.
