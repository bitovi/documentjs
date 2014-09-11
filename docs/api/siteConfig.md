@typedef {{}} DocumentJS.siteConfig siteConfig
@parent DocumentJS.api

@option {Glob|Object} [pattern="**/*.{js,md}"] Configures the files search for
to find documentation.  By default the pattern `"**/*.{js,md}"` is used, which
searches for all `.js` and `.md` files within the project.

@option {String} [dest] The location of the folder where DocumentJS should
write the output. Locations should be relative to the parent folder of the 
_documentjs.json_ file. If this is not provided, the site name of the configuration
is used.

@option {Object} [pageConfig] An object that is made availalbe to the generated HTML pages.

@body 

## Use

