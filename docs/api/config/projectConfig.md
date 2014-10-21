@typedef {{}} DocumentJS.projectConfig projectConfig
@parent DocumentJS.apis.config

The configuration options for a project to retrieve and document.

@option {String} source The source location of the project.



@option {String} [version] The version name of the project. The default value is
this project config's `versions` key.

@option {String} [path] The location of where the project should be 
installed. The default is to use [DocumentJS.docConfig]'s `versionDest`.



@option {Boolean} [npmInstall=false] Use npm to install the resource.

