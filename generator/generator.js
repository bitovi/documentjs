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

	var generate = function (files, options) {
		

		var configuration = _.extend(defaults, options);
		if(!configuration.parent){
			throw "must provide a parent"
		}
		var layout = Handlebars.compile(readFile(configuration.layout));
		var renderer = Handlebars.compile(readFile(configuration.docs));
		var dir = new steal.URI(configuration.out);

		if (!dir.exists()) {
			dir.mkdirs();
		}

		makeAndCopyStatic(options, function(){
			// copies resources folder to destination folder
			var resourcesDest = new steal.URI(configuration.out+'/static');
			if (!resourcesDest.exists()) {
				resourcesDest.mkdirs();
			}
			new steal.URI('documentjs/site/static/dist').copyTo(resourcesDest)
		});
		
		utils.handlebarsHelpers(_.extend({}, utils.helpers, configuration.helpers), Handlebars);
		utils.handlebarsPartials(new steal.URI(configuration.docs).dir() + '/', Handlebars);
		getScriptsAndProcess(files, configuration, function (scripts, docData, search) {
			var rootItem = utils.menuTree(docData, configuration.parent);
			// provides docData for helpers that need it
			utils.data(docData);
			utils.config(configuration);
			utils.menuData(rootItem);
			Handlebars.registerHelper('docLinks', function (text) {
				return utils.replaceLinks(text, docData);
			});
			_.each(docData, function (currentData, name) {
				if (!configuration.ignore(currentData, name)) {
					// Set the active item from the given name
					utils.activateItems(rootItem, name);

					var filename = configuration.out + '/' +
						(name === configuration.parent ? 'index.html' : utils.docsFilename(name));
					var data = _.extend({
						menu: rootItem
					}, configuration, currentData);
					print('Writing documentation ' + filename);

					if (options.debug) {
						data.debug = steal.toJSON(deepExtendWithoutBody(rootItem));
					}
					var content = renderer(data);
					var contents = layout(_.extend({
						content: content
					}, data));

					new steal.URI(filename).save(contents);
				}
			});

			// write the searchdata.json
			var searchdataDest = new steal.URI(configuration.out+'/searchdata.json');
			new steal.URI(searchdataDest).save(steal.toJSON(search))

			
		});
	}

	return generate;
});
