// js documentjs/toHTML/convert.js jmvc\docs ../../../index.html

var path = _args[0], 
	docsPageName = _args[1];

if (!path) {
	print("Please pass the docs directory into the script");
	quit();
}

if(!docsPageName){
	docsPageName = "../../docs.html"
}

load('steal/rhino/steal.js')

steal.plugins('steal/generate').then('//jmvcdoc/resources/helpers', function(steal){
		
	ToHTML = {
		searchData: {},
		// takes a path to a docs directory and gets all files in the directory, calling renderPage on each
		getFiles: function(path){
			var searchDataText = readFile(path+"/searchData.json")
			this.searchData = eval( searchDataText );
			var dir = new java.io.File(path), 
				children = dir.list(), i, script, child, htmlFilePath, bodyHTML, fullPageHTML;
			for (i = 0; i < children.length; i++) {
				child = ""+children[i];
				if (child === "searchData.json" || (new java.io.File(path+"/"+child)).isDirectory()) {
					continue;
				}
				script = readFile(path+"/"+child);
				htmlFilePath = path+"/html/"+child.replace(/\.json$/, ".html");
				bodyHTML = this.renderPage(script, child);
				fullPageHTML = this.renderLayout(bodyHTML, child);
				this.saveHTML(fullPageHTML, htmlFilePath);
			}
		},
		// saves html to a file
		saveHTML: function(html, filePath){
			new steal.File( filePath ).save( html );
		},
		// renders the full page html, inserting the body html
		renderLayout: function(bodyHTML, fileName){
			// fileName is something like jQuery.Model.static.wrapMany.json
			// redirectPage needs to be something like index.html#&who=jQuery.Model.static.wrapMany
			var redirectPage = docsPageName + "#&who=" + fileName.replace(/\.json$/, ""),
				template = readFile( "documentjs/toHTML/page.ejs" );
			
			html = new steal.EJS({ text : template }).render( {
				body: bodyHTML,
				redirectPage: redirectPage
			} ); 
			
			return html;				
		},
		// creates the body's html
		renderPage: function(text, fileName){
			var json = eval(text),
				name = json.shortName.toLowerCase(),
				templateName = "jmvcdoc/views/"+json.shortName.toLowerCase()+".ejs",
				template = readFile( templateName ), html;
			
			html = new steal.EJS({ text : template }).render( json, this.helpers ); 
			return html;				
		},
		// creates docs/html directory
		createDir: function(path){
			new steal.File(path+"/html").mkdir()
		},
		helpers:  steal.extend(DocumentationHelpers, {
			link : function(content, dontReplace){
				return content.replace(/\[\s*((?:['"][^"']*["'])|[^\|\]\s]*)\s*\|?\s*([^\]]*)\s*\]/g, function(match, first, n){
					//need to get last
					//need to remove trailing whitespace
					if(/^["']/.test(first)){
						first = first.substr(1, first.length-2)
					}
					var url = ToHTML.searchData.list[first] ? first : null;
					if(url){
						if(!n){
							n = dontReplace ? first : first.replace(/\.prototype|\.static/,"")
						}
						return "<a href='"+url+".html'>"+n+"</a>"
					}else if(typeof first == 'string' && first.match(/^https?|www\.|#/)){
						return "<a href='"+first+"'>"+(n || first)+"</a>"
					}
					return  match;
				})
			}
		})
	}
	
	
	// callback function
	var C = function( json ) {
		return json;
	}
	
	jQuery = {
		String: {
			underscore: function(s){
				var regs = {
					undHash: /_|-/,
					colons: /::/,
					words: /([A-Z]+)([A-Z][a-z])/g,
					lowerUpper: /([a-z\d])([A-Z])/g,
					dash: /([a-z\d])([A-Z])/g
				};
				return s.replace(regs.colons, '/').replace(regs.words, '$1_$2').replace(regs.lowerUpper, '$1_$2').replace(regs.dash, '_').toLowerCase()
			}
		}
	}
	
	ToHTML.createDir(path);
	ToHTML.getFiles(path);
	
});
