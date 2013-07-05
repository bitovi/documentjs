steal('documentjs/libs/underscore.js', 'documentjs/libs/handlebars.js',
	'documentjs/site/utilities.js', 'documentjs/site/defaults.js',
	'documentjs/types/script.js', 'documentjs/site/searchdata.js', 
	'documentjs/generator/getscripts.js',
	'steal/rhino/json.js',
	function (_, Handlebars, utils, defaults, Script, searchdata, getScripts) {


	var deepExtendWithoutBody = function(obj){
		if(!obj || typeof obj != "object"){
			return obj;
		}
		var isArray = obj.map && typeof obj.length == "number";
		if(isArray){
			return obj.map(function(item){
				return deepExtendWithoutBody(item)
			})
		} else {
			var clone = {};
			for(var prop in obj){
				if(prop != "body"){
					clone[prop] = deepExtendWithoutBody(obj[prop])
				}
				
			}
			return clone;
		}
	}

	// gets scripts, processes
	var getScriptsAndProcess = function(scripts, options, callback) {
		var totalScripts = getScripts(scripts, options);
		var objects = {};
		totalScripts.forEach(function(script) {
			print('processing ', script.src)
			Script.process(script, objects);
		});
		callback(totalScripts, objects, searchdata(objects));
	};

	var makeAndCopyStatic = function(options, callback){
		
		// if site/dist doesn't exist, make it
		if(!steal.URI("documentjs/site/static/dist").exists()){
			steal.URI("documentjs/site/static/dist").mkdirs()
		}
		if(!steal.URI("documentjs/site/static/build").exists()){
			steal.URI("documentjs/site/static/build").mkdirs()
		}
		
		// check if there is anything in site/dist
		if(!steal.URI("documentjs/site/static/dist/production.css").exists()){
			console.log("Copying default/static to static/build")
			// make the build
			
			// first copy everything from default to 
			steal.URI("documentjs/site/default/static")
				.copyTo("documentjs/site/static/build")
			
			
			// TODO: copy overwrites
			if(options["static"]){
				console.log("Copying "+options["static"]+" to static/build");
				steal.URI(options["static"])
					.copyTo("documentjs/site/static/build")
			}
			// run build
			console.log("Getting build module")
			steal("documentjs/site/static/build/build.js", function(build){
				console.log("calling build module");
				build()
				callback();
			})
		} else {
			console.log("Using files in documentjs/site/static/dist")
			callback();
		}		
	}
	var makeAndCopyTemplates = function(configuration){
		// if site/templates doesn't exist, make it
		if(!steal.URI("documentjs/site/templates").exists()){
			steal.URI("documentjs/site/templates").mkdirs()
		}
		// first copy everything from default to 
		steal.URI("documentjs/site/default/templates")
				.copyTo("documentjs/site/templates")
				
		if(configuration["templates"]){
			print("Copying tempaltes from "+configuration["templates"])
			steal.URI(configuration["templates"])
				.copyTo("documentjs/site/templates")
		}
	}
	var generate = function (files, options) {
		

		var configuration = _.extend(defaults, options);
		if(!configuration.parent){
			throw "must provide a parent"
		}
		
		var dir = new steal.URI(configuration.out);

		if (!dir.exists()) {
			dir.mkdirs();
		}
		// setup static
		makeAndCopyStatic(configuration, function(){
			// copies resources folder to destination folder
			var resourcesDest = new steal.URI(configuration.out+'/static');
			if (!resourcesDest.exists()) {
				resourcesDest.mkdirs();
			}
			new steal.URI('documentjs/site/static/dist').copyTo(resourcesDest)
		});
		
		// move templates
		makeAndCopyTemplates(configuration)
		
		// get important templates
		var layout = Handlebars.compile(readFile('documentjs/site/templates/layout.mustache')),
			renderer = Handlebars.compile(readFile('documentjs/site/templates/docs.mustache'));
			
		// setup partials
		utils.handlebarsPartials(steal.URI('documentjs/site/templates/'), Handlebars);
		
		
		// go through all files and 
		getScriptsAndProcess(files, configuration, function (scripts, docData, search) {
			
			// We will update this variable to the current doc object
			var current;
			
			// setup helpers through utils
			var helpers = utils.helpers(
				// maping of docObjects
				docData, 
				// the configuration settings
				configuration, 
				// a function that allows the helpers to get the current rendered object
				function(){
					return current;
				})
			
			// register all the helpers
			utils.handlebarsHelpers(_.extend({}, helpers, configuration.helpers), Handlebars);
			
			// go everything and render it
			_.each(docData, function (currentData, name) {
				if (!configuration.ignore(currentData, name)) {
					// Set the active item from the given name
					// update who is current
					current = currentData;
					var filename = configuration.out + '/' +
						(name === configuration.parent ? 'index.html' : utils.docsFilename(name));
						
					// merge the current DocObject with the configuration
					var data = _.extend({}, configuration, currentData);
					
					print('Writing ' + filename);

					if ( options.debug ) {
						data.debug = steal.toJSON(deepExtendWithoutBody(currentData));
					}
					
					// render the content
					var content = renderer(data);
					
					// pass that content to the layout
					var contents = layout(_.extend({
						content: content
					}, data));

					new steal.URI(filename).save(contents);
				}
			});
			
			// render static files
			utils.handlebarStatics(configuration,docData, layout, Handlebars);

			// write the searchdata.json
			var searchdataDest = new steal.URI(configuration.out+'/searchdata.json');
			new steal.URI(searchdataDest).save(steal.toJSON(search))

			
		});
	}

	return generate;
});
