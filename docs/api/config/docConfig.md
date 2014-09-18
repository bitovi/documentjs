@typedef {{}} DocumentJS.docConfig docConfig
@parent DocumentJS.apis.config

Configures the behavior of DocumentJS.

@option {Object<String,DocumentJS.resourceConfig|String>} versions A map of version names
to their location or to a [DocumentJS.resourceConfig resourceConfig] that specifies where and how
to install the release.

@option {String} defaultVersion The default version that will be copied
into the `defaultDest` location. This is so users can go to `http://site.com/api`
to find the latest docs and not `http://site.com/2.0.1/api`.

@option {String} [defaultDest="."] The location of where the default docs should
be rendered to.

@option {String} versionDest The templated directory name of where each version's download
and docs should be created.  The default is `"<%= version%>"`.  This means
that a _2.0.1_ version name will be downloaded to a _2.0.1_ folder. DocumentJS
will then look for that version's `documentjs.json` and run that.

@option {Object<String,DocumentJS.siteConfig>} sites A map of site names and
options that configure their behavior.

@body

## Use

A `docConfig` is most commonly found in `documentjs.json`. It configures
the behavior of DocumentJS.  There are two main behaviors that `docObject` controls:

 - The retrieval of other projects or versions to be documented.
 - The documentation behavior of the current project.

A complex configuration, like the one used for [producing CanJS.com](http://github.com/bitovi/canjs.com),
might looks like:

    {
      versions: {
        "1.1.8" : "https://github.com/bitovi/canjs/tree/1.1-legacy",
        "2.1.4" : "https://github.com/bitovi/canjs/tree/v2.1.4",
        "2.2.0-pre" : "https://github.com/bitovi/canjs/tree/minor",
        "3.0.0-pre" : "https://github.com/bitovi/canjs/tree/major"
      },
      dest: "<%= version %>",
      defaultVersion: "2.1.4",
      defaultDest: "."
      sites: {
      	pages: {
      	  pattern: "_pages/*.md",
      	  dest: "."
      	}
      }
    }
    
This con
    
