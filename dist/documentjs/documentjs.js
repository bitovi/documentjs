(function( steal ) {


	var rsplit = function( string, regex ) {
		var result = regex.exec(string),
			retArr = [],
			first_idx, last_idx, first_bit;
		while ( result !== null ) {
			first_idx = result.index;
			last_idx = regex.lastIndex;
			if ((first_idx) !== 0 ) {
				first_bit = string.substring(0, first_idx);
				retArr.push(string.substring(0, first_idx));
				string = string.slice(first_idx);
			}
			retArr.push(result[0]);
			string = string.slice(result[0].length);
			result = regex.exec(string);
		}
		if (!string == '' ) {
			retArr.push(string);
		}
		return retArr;
	},
		chop = function( string ) {
			return string.substr(0, string.length - 1);
		},
		extend = function( d, s ) {
			for ( var n in s ) {
				if ( s.hasOwnProperty(n) ) {
					d[n] = s[n];
				}
			}
		};

		steal.EJS = function( options ) {
			options = typeof options === "string" ? {
				view: options
			} : options;
			
			this.set_options(options);
			if ( options.precompiled ) {
				this.template = {};
				this.template.process = options.precompiled;
				vEJS.update(this.name, this);
				return;
			}
			if ( options.element ) {
				if ( typeof options.element === 'string' ) {
					var name = options.element;
					options.element = document.getElementById(options.element);
					
					if ( options.element == null ){
						throw name + 'does not exist!';
					}
				}
				if ( options.element.value ) {
					this.text = options.element.value;
				} else {
					this.text = options.element.innerHTML;
				}
				this.name = options.element.id;
				this.type = '[';
			} else if ( options.url ) {
				options.url = vEJS.endExt(options.url, this.extMatch);
				this.name = this.name ? this.name : options.url;
				var url = options.url;
				//options.view = options.absolute_url || options.view || options.;
				var template = vEJS.get(this.name
				/*url*/
				, this.cache);
				
				if ( template ){
					return template;
				}
				
				if ( template === vEJS.INVALID_PATH ){
					return null;
				}
				
				try {
					this.text = vEJS.request(url + (this.cache ? '' : '?' + Math.random()));
				} catch (e) {}

				if ( this.text == null ) {
					throw ('There is no template at ' + url);
				}
				//this.name = url;
			}
			
			var template = new vEJS.Compiler(this.text, this.type);

			template.compile(options, this.name);

			vEJS.update(this.name, this);
			this.template = template;
		};
	var vEJS = steal.EJS;
	/* @Prototype*/
	vEJS.prototype = {
		/**
		 * Renders an object with extra view helpers attached to the view.
		 * @param {Object} object data to be rendered
		 * @param {Object} extra_helpers an object with additonal view helpers
		 * @return {String} returns the result of the string
		 */
		render: function( object, extra_helpers ) {
			object = object || {};
			this._extra_helpers = extra_helpers;
			var v = new vEJS.Helpers(object, extra_helpers || {});
			return this.template.process.call(object, object, v);
		},
		update: function( element, options ) {
			if ( typeof element === 'string' ) {
				element = document.getElementById(element);
			}
			if ( options == null ) {
				_template = this;
				return function( object ) {
					vEJS.prototype.update.call(_template, element, object);
				};
			}
			if ( typeof options === 'string' ) {
				params = {};
				params.url = options;
				_template = this;
				
				params.onComplete = function( request ) {
					var object = eval(request.responseText);
					vEJS.prototype.update.call(_template, element, object);
				};
				
				vEJS.ajax_request(params);
			} else {
				element.innerHTML = this.render(options);
			}
		},
		out: function() {
			return this.template.out;
		},
		/**
		 * Sets options on this view to be rendered with.
		 * @param {Object} options
		 */
		set_options: function( options ) {
			this.type = options.type || vEJS.type;
			this.cache = options.cache != null ? options.cache : vEJS.cache;
			this.text = options.text || null;
			this.name = options.name || null;
			this.ext = options.ext || vEJS.ext;
			this.extMatch = new RegExp(this.ext.replace(/\./, '\.'));
		}
	};
	vEJS.endExt = function( path, match ) {
		if (!path ){
			return null;
		}
		match.lastIndex = 0;
		return path + (match.test(path) ? '' : this.ext);
	};

	/* @Static*/
	vEJS.Scanner = function( source, left, right ) {

		extend(this, {
			left_delimiter: left + '%',
			right_delimiter: '%' + right,
			double_left: left + '%%',
			double_right: '%%' + right,
			left_equal: left + '%=',
			left_comment: left + '%#'
		});

		this.SplitRegexp = left === '[' 
							? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ 
							: new RegExp('(' + this.double_left + ')|(%%' + this.double_right + ')|(' + this.left_equal + ')|(' + this.left_comment + ')|(' + this.left_delimiter + ')|(' + this.right_delimiter + '\n)|(' + this.right_delimiter + ')|(\n)');

		this.source = source;
		this.stag = null;
		this.lines = 0;
	};

	vEJS.Scanner.to_text = function( input ) {
		if ( input == null || input === undefined ){
			return '';
		}
		
		if ( input instanceof Date ) {
			return input.toDateString();
		}
		
		if ( input.toString ) {
			return input.toString();
		}
		
		return '';
	};

	vEJS.Scanner.prototype = {
		scan: function( block ) {
			scanline = this.scanline;
			regex = this.SplitRegexp;
			if ( !this.source == '' ) {
				var source_split = rsplit(this.source, /\n/);
				for ( var i = 0; i < source_split.length; i++ ) {
					var item = source_split[i];
					this.scanline(item, regex, block);
				}
			}
		},
		scanline: function( line, regex, block ) {
			this.lines++;
			var line_split = rsplit(line, regex);
			for ( var i = 0; i < line_split.length; i++ ) {
				var token = line_split[i];
				if ( token != null ) {
					try {
						block(token, this);
					} catch (e) {
						throw {
							type: 'vEJS.Scanner',
							line: this.lines
						};
					}
				}
			}
		}
	};


	vEJS.Buffer = function( pre_cmd, post_cmd ) {
		this.line = [];
		this.script = "";
		this.pre_cmd = pre_cmd;
		this.post_cmd = post_cmd;
		for ( var i = 0; i < this.pre_cmd.length; i++ ) {
			this.push(pre_cmd[i]);
		}
	};
	vEJS.Buffer.prototype = {

		push: function( cmd ) {
			this.line.push(cmd);
		},

		cr: function() {
			this.script = this.script + this.line.join('; ');
			this.line = [];
			this.script = this.script + "\n";
		},

		close: function() {
			if ( this.line.length > 0 ) {
				for ( var i = 0; i < this.post_cmd.length; i++ ) {
					this.push(pre_cmd[i]);
				}
				this.script = this.script + this.line.join('; ');
				line = null;
			}
		}

	};


	vEJS.Compiler = function( source, left ) {
		this.pre_cmd = ['var ___ViewO = [];'];
		this.post_cmd = [];
		this.source = ' ';
		if ( source != null ) {
			if ( typeof source === 'string' ) {
				source = source.replace(/\r\n/g, "\n");
				source = source.replace(/\r/g, "\n");
				this.source = source;
			} else if ( source.innerHTML ) {
				this.source = source.innerHTML;
			}
			if ( typeof this.source !== 'string' ) {
				this.source = "";
			}
		}
		left = left || '<';
		var right = '>';
		switch ( left ) {
		case '[':
			right = ']';
			break;
		case '<':
			break;
		default:
			throw left + ' is not a supported deliminator';
			//break;
		}
		this.scanner = new vEJS.Scanner(this.source, left, right);
		this.out = '';
	};
	vEJS.Compiler.prototype = {
		compile: function( options, name ) {
			options = options || {};
			this.out = '';
			var put_cmd = "___ViewO.push(";
			var insert_cmd = put_cmd;
			var buff = new vEJS.Buffer(this.pre_cmd, this.post_cmd);
			var content = '';
			var clean = function( content ) {
				content = content.replace(/\\/g, '\\\\');
				content = content.replace(/\n/g, '\\n');
				content = content.replace(/"/g, '\\"');
				return content;
			};
			this.scanner.scan(function( token, scanner ) {
				if ( scanner.stag == null ) {
					switch ( token ) {
					case '\n':
						content = content + "\n";
						buff.push(put_cmd + '"' + clean(content) + '");');
						buff.cr();
						content = '';
						break;
					case scanner.left_delimiter:
					case scanner.left_equal:
					case scanner.left_comment:
						scanner.stag = token;
						if ( content.length > 0 ) {
							buff.push(put_cmd + '"' + clean(content) + '")');
						}
						content = '';
						break;
					case scanner.double_left:
						content = content + scanner.left_delimiter;
						break;
					default:
						content = content + token;
						break;
					}
				}
				else {
					switch ( token ) {
					case scanner.right_delimiter:
						switch ( scanner.stag ) {
						case scanner.left_delimiter:
							if ( content[content.length - 1] === '\n' ) {
								content = chop(content);
								buff.push(content);
								buff.cr();
							}
							else {
								buff.push(content);
							}
							break;
						case scanner.left_equal:
							buff.push(insert_cmd + "(vEJS.Scanner.to_text(" + content + ")))");
							break;
						}
						scanner.stag = null;
						content = '';
						break;
					case scanner.double_right:
						content = content + scanner.right_delimiter;
						break;
					default:
						content = content + token;
						break;
					}
				}
			});
			if ( content.length > 0 ) {
				// Chould be content.dump in Ruby
				buff.push(put_cmd + '"' + clean(content) + '")');
			}
			buff.close();
			this.out = buff.script + ";";
			var to_be_evaled = '/*' + name + '*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {' + this.out + " return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";

			try {
				eval(to_be_evaled);
			} catch (e) {
				if ( typeof JSLINT !== 'undefined' ) {
					JSLINT(this.out);
					for ( var i = 0; i < JSLINT.errors.length; i++ ) {
						var error = JSLINT.errors[i];
						if ( error.reason !== "Unnecessary semicolon." ) {
							error.line++;
							e = new Error();
							e.lineNumber = error.line;
							e.message = error.reason;
							if ( options.view ){
								e.fileName = options.view;
							}
							throw e;
						}
					}
				} else {
					throw e;
				}
			}
		}
	};


	//type, cache, folder
	vEJS.config = function( options ) {
		vEJS.cache = options.cache != null ? options.cache : vEJS.cache;
		vEJS.type = options.type != null ? options.type : vEJS.type;
		vEJS.ext = options.ext != null ? options.ext : vEJS.ext;

		var templates_directory = vEJS.templates_directory || {}; //nice and private container
		vEJS.templates_directory = templates_directory;
		vEJS.get = function( path, cache ) {
			if ( cache == false ){
				return null;
			}
			
			if ( templates_directory[path] ){ 
				return templates_directory[path];
			}
			
			return null;
		};

		vEJS.update = function( path, template ) {
			if ( path == null ) {
				return;
			}
			
			templates_directory[path] = template;
		};

		vEJS.INVALID_PATH = -1;
	};
	vEJS.config({
		cache: true,
		type: '<',
		ext: '.ejs'
	});




	vEJS.Helpers = function( data, extras ) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};
	/* @prototype*/
	vEJS.Helpers.prototype = {
		view: function( options, data, helpers ) {
			if ( !helpers ){
				helpers = this._extras;
			}
			if ( !data ){
				data = this._data;
			}
			
			return new vEJS(options).render(data, helpers);
		},
		to_text: function( input, null_text ) {
			if ( input == null || input === undefined ) {
				return null_text || '';
			}
			
			if ( input instanceof Date ) {
				return input.toDateString();
			}
			
			if ( input.toString ) {
				return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
			}
			
			return '';
		}
	};
	vEJS.newRequest = function() {
		var factories = [function() {
			return new ActiveXObject("Msxml2.XMLHTTP");
		}, function() {
			return new XMLHttpRequest();
		}, function() {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}];
		for ( var i = 0; i < factories.length; i++ ) {
			try {
				var request = factories[i]();
				if ( request != null ) {
					return request;
				} 
			}
			catch (e) {
				continue;
			}
		}
	};

	vEJS.request = function( path ) {
		var request = new vEJS.newRequest();
		
		request.open("GET", path, false);

		try {
			request.send(null);
		}
		catch (e) {
			return null;
		}

		if ( request.status == 404 || request.status == 2 || (request.status == 0 && request.responseText == '') ){
			return null;
		} 

		return request.responseText;
	};
	
	vEJS.ajax_request = function( params ) {
		params.method = (params.method ? params.method : 'GET');

		var request = new vEJS.newRequest();
		
		request.onreadystatechange = function() {
			if ( request.readyState == 4 ) {
				if ( request.status == 200 ) {
					params.onComplete(request);
				} else {
					params.onComplete(request);
				}
			}
		};
		
		request.open(params.method, params.url);
		request.send(null);
	};
})(steal);
(function() {
	(function() {
		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			isArray = function( arr ) {
				return Object.prototype.toString.call(arr) === "[object Array]"
			}


			JSONparse = function( text, reviver ) {

				var j;

				function walk(holder, key) {
					var k, v, value = holder[key];
					if ( value && typeof value === 'object' ) {
						for ( k in value ) {
							if ( Object.hasOwnProperty.call(value, k) ) {
								v = walk(value, k);
								if ( v !== undefined ) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}

				cx.lastIndex = 0;
				if ( cx.test(text) ) {
					text = text.replace(cx, function( a ) {
						return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
				}
				if (/^[\],:{}\s]*$/.
				test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
				replace(/["'][^"\\\n\r]*["']|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
				replace(/(?:^|:|,)(?:\s*\[)+/g, '')) ) {


					j = eval('(' + text + ')');

					// In the optional fourth stage, we recursively walk the new structure, passing
					// each name/value pair to a reviver function for possible transformation.
					return typeof reviver === 'function' ? walk({
						'': j
					}, '') : j;
				}

				// If the text is not JSON parseable, then a SyntaxError is thrown.
				throw new SyntaxError('JSONparse');
			};


		var toIntegersAtLease = function( n )
		// Format integers to have at least two digits.
		{
			return n < 10 ? '0' + n : n;
		}

		Date.prototype.toJSON = function( date )
		// Yes, it polutes the Date namespace, but we'll allow it here, as
		// it's damned usefull.
		{
			return this.getUTCFullYear() + '-' + toIntegersAtLease(this.getUTCMonth()) + '-' + toIntegersAtLease(this.getUTCDate());
		};

		var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
		var meta = { // table of character substitutions
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"': '\\"',
			'\\': '\\\\'
		};

		var quoteString = function( string )
		// Places quotes around a string, inteligently.
		// If the string contains no control characters, no quote characters, and no
		// backslash characters, then we can safely slap some quotes around it.
		// Otherwise we must also replace the offending characters with safe escape
		// sequences.
		{
			if ( escapeable.test(string) ) {
				return '"' + string.replace(escapeable, function( a ) {
					var c = meta[a];
					if ( typeof c === 'string' ) {
						return c;
					}
					c = a.charCodeAt();
					return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
				}) + '"';
			}
			return '"' + string + '"';
		};
		var vtoJSON = null;
		var steal = steal;
		vtoJSON = function( o, compact ) {
			var type = typeof(o), ret;

			if ( type == "undefined" ) return "undefined";
			else if ( type == "number" || type == "boolean" ) return o + "";
			else if ( o === null ) return "null";

			// Is it a string?
			if ( type == "string" ) {
				return quoteString(o);
			}

			// Does it have a .toJSON function?
			if ( type == "object" && typeof o.toJSON == "function" ) return o.toJSON(compact);

			// Is it an array?
			if ( isArray(o) ) {
				ret = [];
				for ( var i = 0; i < o.length; i++ ) {
					ret.push(vtoJSON(o[i], compact));
				}
				if ( compact ) return "[" + ret.join(",") + "]";
				else return "[" + ret.join(", ") + "]";
			}

			// If it's a function, we have to warn somebody!
			if ( type == "function" ) {
				throw new TypeError("Unable to convert object of type 'function' to json.");
			}

			// It's probably an object, then.
			ret = [];
			for ( var k in o ) {
				var name;
				type = typeof(k);

				if ( type == "number" ) name = '"' + k + '"';
				else if ( type == "string" ) name = quoteString(k);
				else continue; //skip non-string or number keys
				var val = vtoJSON(o[k], compact);
				if ( typeof(val) != "string" ) {
					// skip non-serializable values
					continue;
				}

				if ( compact ) ret.push(name + ":" + val);
				else ret.push(name + ": " + val);
			}
			return "{" + ret.join(", ") + "}";
		};
		toJSON = vtoJSON;


	})();
})(steal);
(function() {
	//
	// showdown.js -- A javascript port of Markdown.
	//
	// Copyright (c) 2007 John Fraser.
	//
	// Original Markdown Copyright (c) 2004-2005 John Gruber
	//   <http://daringfireball.net/projects/markdown/>
	//
	// Redistributable under a BSD-style open source license.
	// See license.txt for more information.
	//
	// The full source distribution is at:
	//
	//				A A L
	//				T C A
	//				T K B
	//
	//   <http://www.attacklab.net/>
	//
	//
	// Wherever possible, Showdown is a straight, line-by-line port
	// of the Perl version of Markdown.
	//
	// This is not a normal parser design; it's basically just a
	// series of string substitutions.  It's hard to read and
	// maintain this way,  but keeping Showdown close to the original
	// design makes it easier to port new features.
	//
	// More importantly, Showdown behaves like markdown.pl in most
	// edge cases.  So web applications can do client-side preview
	// in Javascript, and then build identical HTML on the server.
	//
	// This port needs the new RegExp functionality of ECMA 262,
	// 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers
	// should do fine.  Even with the new regular expression features,
	// We do a lot of work to emulate Perl's regex functionality.
	// The tricky changes in this file mostly have the "attacklab:"
	// label.  Major or self-explanatory changes don't.
	//
	// Smart diff tools like Araxis Merge will be able to match up
	// this file with markdown.pl in a useful way.  A little tweaking
	// helps: in a copy of markdown.pl, replace "#" with "//" and
	// replace "$text" with "text".  Be sure to ignore whitespace
	// and line endings.
	//

	//
	// Showdown usage:
	//
	//   var text = "Markdown *rocks*.";
	//
	//   var converter = new Showdown.converter();
	//   var html = converter.makeHtml(text);
	//
	//   alert(html);
	//
	// Note: move the sample code to the bottom of this
	// file before uncommenting it.
	//

	//
	// Showdown namespace
	//
	Showdown = {};

	//
	// converter
	//
	// Wraps all "globals" so that the only thing
	// exposed is makeHtml().
	//
	Showdown.converter = function() {

		//
		// Globals:
		//
		// Global hashes, used by various utility routines
		var g_urls;
		var g_titles;
		var g_html_blocks;

		// Used to track when we're inside an ordered or unordered list
		// (see _ProcessListItems() for details):
		var g_list_level = 0;


		this.makeHtml = function( text ) {
			//
			// Main function. The order in which other subs are called here is
			// essential. Link and image substitutions need to happen before
			// _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>
			// and <img> tags get encoded.
			//
			// Clear the global hashes. If we don't clear these, you get conflicts
			// from other articles when generating a page which contains more than
			// one article (e.g. an index page that shows the N most recent
			// articles):
			g_urls = new Array();
			g_titles = new Array();
			g_html_blocks = new Array();

			// attacklab: Replace ~ with ~T
			// This lets us use tilde as an escape char to avoid md5 hashes
			// The choice of character is arbitray; anything that isn't
			// magic in Markdown will work.
			text = text.replace(/~/g, "~T");

			// attacklab: Replace $ with ~D
			// RegExp interprets $ as a special character
			// when it's in a replacement string
			text = text.replace(/\$/g, "~D");

			// Standardize line endings
			text = text.replace(/\r\n/g, "\n"); // DOS to Unix
			text = text.replace(/\r/g, "\n"); // Mac to Unix
			// Make sure text begins and ends with a couple of newlines:
			text = "\n\n" + text + "\n\n";

			// Convert all tabs to spaces.
			text = _Detab(text);

			// Strip any lines consisting only of spaces and tabs.
			// This makes subsequent regexen easier to write, because we can
			// match consecutive blank lines with /\n+/ instead of something
			// contorted like /[ \t]*\n+/ .
			text = text.replace(/^[ \t]+$/mg, "");

			// Turn block-level HTML blocks into hash entries
			text = _HashHTMLBlocks(text);

			// Strip link definitions, store in hashes.
			text = _StripLinkDefinitions(text);

			text = _RunBlockGamut(text);

			text = _UnescapeSpecialChars(text);

			// attacklab: Restore dollar signs
			text = text.replace(/~D/g, "$$");

			// attacklab: Restore tildes
			text = text.replace(/~T/g, "~");

			return text;
		}


		var _StripLinkDefinitions = function( text ) {
			//
			// Strips link definitions from text, stores the URLs and titles in
			// hash references.
			//
			// Link defs are in the form: ^[id]: url "optional title"
/*
		var text = text.replace(/
				^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
				  [ \t]*
				  \n?				// maybe *one* newline
				  [ \t]*
				<?(\S+?)>?			// url = $2
				  [ \t]*
				  \n?				// maybe one newline
				  [ \t]*
				(?:
				  (\n*)				// any lines skipped = $3 attacklab: lookbehind removed
				  ["(]
				  (.+?)				// title = $4
				  [")]
				  [ \t]*
				)?					// title is optional
				(?:\n+|$)
			  /gm,
			  function(){...});
	*/
			var text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm, function( wholeMatch, m1, m2, m3, m4 ) {
				m1 = m1.toLowerCase();
				g_urls[m1] = _EncodeAmpsAndAngles(m2); // Link IDs are case-insensitive
				if ( m3 ) {
					// Oops, found blank lines, so it's not a title.
					// Put back the parenthetical statement we stole.
					return m3 + m4;
				} else if ( m4 ) {
					g_titles[m1] = m4.replace(/"/g, "&quot;");
				}

				// Completely remove the definition from the text
				return "";
			});

			return text;
		}


		var _HashHTMLBlocks = function( text ) {
			// attacklab: Double up blank lines to reduce lookaround
			text = text.replace(/\n/g, "\n\n");

			// Hashify HTML blocks:
			// We only want to do this for block-level HTML tags, such as headers,
			// lists, and tables. That's because we still want to wrap <p>s around
			// "paragraphs" that are wrapped in non-block-level tags, such as anchors,
			// phrase emphasis, and spans. The list of tags we're looking for is
			// hard-coded:
			var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
			var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"

			// First, look for nested blocks, e.g.:
			//   <div>
			//     <div>
			//     tags for inner block must be indented.
			//     </div>
			//   </div>
			//
			// The outermost tags must start at the left margin for this to match, and
			// the inner nested divs must be indented.
			// We need to do this before the next, more liberal match, because the next
			// match will start at the first `<div>` and stop at the first `</div>`.
			// attacklab: This regex can be expensive when it fails.
/*
		var text = text.replace(/
		(						// save in $1
			^					// start of line  (with /m)
			<($block_tags_a)	// start tag = $2
			\b					// word break
								// attacklab: hack around khtml/pcre bug...
			[^\r]*?\n			// any number of lines, minimally matching
			</\2>				// the matching end tag
			[ \t]*				// trailing spaces/tabs
			(?=\n+)				// followed by a newline
		)						// attacklab: there are sentinel newlines at end of document
		/gm,function(){...}};
	*/
			text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, hashElement);

			//
			// Now match more liberally, simply from `\n<tag>` to `</tag>\n`
			//
/*
		var text = text.replace(/
		(						// save in $1
			^					// start of line  (with /m)
			<($block_tags_b)	// start tag = $2
			\b					// word break
								// attacklab: hack around khtml/pcre bug...
			[^\r]*?				// any number of lines, minimally matching
			.*</\2>				// the matching end tag
			[ \t]*				// trailing spaces/tabs
			(?=\n+)				// followed by a newline
		)						// attacklab: there are sentinel newlines at end of document
		/gm,function(){...}};
	*/
			text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, hashElement);

			// Special case just for <hr />. It was easier to make a special case than
			// to make the other regex more complicated.  
/*
		text = text.replace(/
		(						// save in $1
			\n\n				// Starting after a blank line
			[ ]{0,3}
			(<(hr)				// start tag = $2
			\b					// word break
			([^<>])*?			// 
			\/?>)				// the matching end tag
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
			text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashElement);

			// Special case for standalone HTML comments:
/*
		text = text.replace(/
		(						// save in $1
			\n\n				// Starting after a blank line
			[ ]{0,3}			// attacklab: g_tab_width - 1
			<!
			(--[^\r]*?--\s*)+
			>
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
			text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, hashElement);

			// PHP and ASP-style processor instructions (<?...?> and <%...%>)
/*
		text = text.replace(/
		(?:
			\n\n				// Starting after a blank line
		)
		(						// save in $1
			[ ]{0,3}			// attacklab: g_tab_width - 1
			(?:
				<([?%])			// $2
				[^\r]*?
				\2>
			)
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
			text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, hashElement);

			// attacklab: Undo double lines (see comment at top of this function)
			text = text.replace(/\n\n/g, "\n");
			return text;
		}

		var hashElement = function( wholeMatch, m1 ) {
			var blockText = m1;

			// Undo double lines
			blockText = blockText.replace(/\n\n/g, "\n");
			blockText = blockText.replace(/^\n/, "");

			// strip trailing blank lines
			blockText = blockText.replace(/\n+$/g, "");

			// Replace the element text with a marker ("~KxK" where x is its key)
			blockText = "\n\n~K" + (g_html_blocks.push(blockText) - 1) + "K\n\n";

			return blockText;
		};

		var _RunBlockGamut = function( text ) {
			//
			// These are all the transformations that form block-level
			// tags like paragraphs, headers, and list items.
			//
			text = _DoHeaders(text);

			// Do Horizontal Rules:
			var key = hashBlock("<hr />");
			text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, key);
			text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, key);
			text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, key);

			text = _DoLists(text);
			text = _DoCodeBlocks(text);
			text = _DoBlockQuotes(text);

			// We already ran _HashHTMLBlocks() before, in Markdown(), but that
			// was to escape raw HTML in the original Markdown source. This time,
			// we're escaping the markup we've just created, so that we don't wrap
			// <p> tags around block-level tags.
			text = _HashHTMLBlocks(text);
			text = _FormParagraphs(text);

			return text;
		}


		var _RunSpanGamut = function( text ) {
			//
			// These are all the transformations that occur *within* block-level
			// tags like paragraphs, headers, and list items.
			//
			text = _DoCodeSpans(text);
			text = _EscapeSpecialCharsWithinTagAttributes(text);
			text = _EncodeBackslashEscapes(text);

			// Process anchor and image tags. Images must come first,
			// because ![foo][f] looks like an anchor.
			text = _DoImages(text);
			text = _DoAnchors(text);

			// Make links out of things like `<http://example.com/>`
			// Must come after _DoAnchors(), because you can use < and >
			// delimiters in inline links like [this](<url>).
			text = _DoAutoLinks(text);
			text = _EncodeAmpsAndAngles(text);
			text = _DoItalicsAndBold(text);

			// Do hard breaks:
			text = text.replace(/  +\n/g, " <br />\n");

			return text;
		}

		var _EscapeSpecialCharsWithinTagAttributes = function( text ) {
			//
			// Within tags -- meaning between < and > -- encode [\ ` * _] so they
			// don't conflict with their use in Markdown for code, italics and strong.
			//
			// Build a regex to find HTML tags and comments.  See Friedl's 
			// "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
			var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

			text = text.replace(regex, function( wholeMatch ) {
				var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g, "$1`");
				tag = escapeCharacters(tag, "\\`*_");
				return tag;
			});

			return text;
		}

		var _DoAnchors = function( text ) {
			//
			// Turn Markdown link shortcuts into XHTML <a> tags.
			//
			//
			// First, handle reference-style links: [link text] [id]
			//
/*
		text = text.replace(/
		(							// wrap whole match in $1
			\[
			(
				(?:
					\[[^\]]*\]		// allow brackets nested one level
					|
					[^\[]			// or anything else
				)*
			)
			\]

			[ ]?					// one optional space
			(?:\n[ ]*)?				// one optional newline followed by spaces

			\[
			(.*?)					// id = $3
			\]
		)()()()()					// pad remaining backreferences
		/g,_DoAnchors_callback);
	*/
			text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeAnchorTag);

			//
			// Next, inline-style links: [link text](url "optional title")
			//
/*
		text = text.replace(/
			(						// wrap whole match in $1
				\[
				(
					(?:
						\[[^\]]*\]	// allow brackets nested one level
					|
					[^\[\]]			// or anything else
				)
			)
			\]
			\(						// literal paren
			[ \t]*
			()						// no id, so leave $3 empty
			<?(.*?)>?				// href = $4
			[ \t]*
			(						// $5
				(['"])				// quote char = $6
				(.*?)				// Title = $7
				\6					// matching quote
				[ \t]*				// ignore any spaces/tabs between closing quote and )
			)?						// title is optional
			\)
		)
		/g,writeAnchorTag);
	*/
			text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeAnchorTag);

			//
			// Last, handle reference-style shortcuts: [link text]
			// These must come last in case you've also got [link test][1]
			// or [link test](/foo)
			//
/*
		text = text.replace(/
		(		 					// wrap whole match in $1
			\[
			([^\[\]]+)				// link text = $2; can't contain '[' or ']'
			\]
		)()()()()()					// pad rest of backreferences
		/g, writeAnchorTag);
	*/
			text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

			return text;
		}

		var writeAnchorTag = function( wholeMatch, m1, m2, m3, m4, m5, m6, m7 ) {
			if ( m7 == undefined ) m7 = "";
			var whole_match = m1;
			var link_text = m2;
			var link_id = m3.toLowerCase();
			var url = m4;
			var title = m7;

			if ( url == "" ) {
				if ( link_id == "" ) {
					// lower-case and turn embedded newlines into spaces
					link_id = link_text.toLowerCase().replace(/ ?\n/g, " ");
				}
				url = "#" + link_id;

				if ( g_urls[link_id] != undefined ) {
					url = g_urls[link_id];
					if ( g_titles[link_id] != undefined ) {
						title = g_titles[link_id];
					}
				}
				else {
					if ( whole_match.search(/\(\s*\)$/m) > -1 ) {
						// Special case for explicit empty url
						url = "";
					} else {
						return whole_match;
					}
				}
			}

			url = escapeCharacters(url, "*_");
			var result = "<a href=\"" + url + "\"";

			if ( title != "" ) {
				title = title.replace(/"/g, "&quot;");
				title = escapeCharacters(title, "*_");
				result += " title=\"" + title + "\"";
			}

			result += ">" + link_text + "</a>";

			return result;
		}


		var _DoImages = function( text ) {
			//
			// Turn Markdown image shortcuts into <img> tags.
			//
			//
			// First, handle reference-style labeled images: ![alt text][id]
			//
/*
		text = text.replace(/
		(						// wrap whole match in $1
			!\[
			(.*?)				// alt text = $2
			\]

			[ ]?				// one optional space
			(?:\n[ ]*)?			// one optional newline followed by spaces

			\[
			(.*?)				// id = $3
			\]
		)()()()()				// pad rest of backreferences
		/g,writeImageTag);
	*/
			text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeImageTag);

			//
			// Next, handle inline images:  ![alt text](url "optional title")
			// Don't forget: encode * and _
/*
		text = text.replace(/
		(						// wrap whole match in $1
			!\[
			(.*?)				// alt text = $2
			\]
			\s?					// One optional whitespace character
			\(					// literal paren
			[ \t]*
			()					// no id, so leave $3 empty
			<?(\S+?)>?			// src url = $4
			[ \t]*
			(					// $5
				(['"])			// quote char = $6
				(.*?)			// title = $7
				\6				// matching quote
				[ \t]*
			)?					// title is optional
		\)
		)
		/g,writeImageTag);
	*/
			text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeImageTag);

			return text;
		}

		var writeImageTag = function( wholeMatch, m1, m2, m3, m4, m5, m6, m7 ) {
			var whole_match = m1;
			var alt_text = m2;
			var link_id = m3.toLowerCase();
			var url = m4;
			var title = m7;

			if (!title ) title = "";

			if ( url == "" ) {
				if ( link_id == "" ) {
					// lower-case and turn embedded newlines into spaces
					link_id = alt_text.toLowerCase().replace(/ ?\n/g, " ");
				}
				url = "#" + link_id;

				if ( g_urls[link_id] != undefined ) {
					url = g_urls[link_id];
					if ( g_titles[link_id] != undefined ) {
						title = g_titles[link_id];
					}
				}
				else {
					return whole_match;
				}
			}

			alt_text = alt_text.replace(/"/g, "&quot;");
			url = escapeCharacters(url, "*_");
			var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

			// attacklab: Markdown.pl adds empty title attributes to images.
			// Replicate this bug.
			//if (title != "") {
			title = title.replace(/"/g, "&quot;");
			title = escapeCharacters(title, "*_");
			result += " title=\"" + title + "\"";
			//}
			result += " />";

			return result;
		}


		var _DoHeaders = function( text ) {

			// Setext-style headers:
			//	Header 1
			//	========
			//  
			//	Header 2
			//	--------
			//
			text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm, function( wholeMatch, m1 ) {
				return hashBlock("<h1>" + _RunSpanGamut(m1) + "</h1>");
			});

			text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm, function( matchFound, m1 ) {
				return hashBlock("<h2>" + _RunSpanGamut(m1) + "</h2>");
			});

			// atx-style headers:
			//  # Header 1
			//  ## Header 2
			//  ## Header 2 with closing hashes ##
			//  ...
			//  ###### Header 6
			//
/*
		text = text.replace(/
			^(\#{1,6})				// $1 = string of #'s
			[ \t]*
			(.+?)					// $2 = Header text
			[ \t]*
			\#*						// optional closing #'s (not counted)
			\n+
		/gm, function() {...});
	*/

			text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, function( wholeMatch, m1, m2 ) {
				var h_level = m1.length;
				return hashBlock("<h" + h_level + ">" + _RunSpanGamut(m2) + "</h" + h_level + ">");
			});

			return text;
		}

		// This declaration keeps Dojo compressor from outputting garbage:
		var _ProcessListItems;

		var _DoLists = function( text ) {
			//
			// Form HTML ordered (numbered) and unordered (bulleted) lists.
			//
			// attacklab: add sentinel to hack around khtml/safari bug:
			// http://bugs.webkit.org/show_bug.cgi?id=11231
			text += "~0";

			// Re-usable pattern to match any entirel ul or ol list:
/*
		var whole_list = /
		(									// $1 = whole list
			(								// $2
				[ ]{0,3}					// attacklab: g_tab_width - 1
				([*+-]|\d+[.])				// $3 = first list item marker
				[ \t]+
			)
			[^\r]+?
			(								// $4
				~0							// sentinel for workaround; should be $
			|
				\n{2,}
				(?=\S)
				(?!							// Negative lookahead for another list item marker
					[ \t]*
					(?:[*+-]|\d+[.])[ \t]+
				)
			)
		)/g
	*/
			var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

			if ( g_list_level ) {
				text = text.replace(whole_list, function( wholeMatch, m1, m2 ) {
					var list = m1;
					var list_type = (m2.search(/[*+-]/g) > -1) ? "ul" : "ol";

					// Turn double returns into triple returns, so that we can make a
					// paragraph for the last item in a list, if necessary:
					list = list.replace(/\n{2,}/g, "\n\n\n");
					var result = _ProcessListItems(list);

					// Trim any trailing whitespace, to put the closing `</$list_type>`
					// up on the preceding line, to get it past the current stupid
					// HTML block parser. This is a hack to work around the terrible
					// hack that is the HTML block parser.
					result = result.replace(/\s+$/, "");
					result = "<" + list_type + ">" + result + "</" + list_type + ">\n";
					return result;
				});
			} else {
				whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
				text = text.replace(whole_list, function( wholeMatch, m1, m2, m3 ) {
					var runup = m1;
					var list = m2;

					var list_type = (m3.search(/[*+-]/g) > -1) ? "ul" : "ol";
					// Turn double returns into triple returns, so that we can make a
					// paragraph for the last item in a list, if necessary:
					var list = list.replace(/\n{2,}/g, "\n\n\n");;
					var result = _ProcessListItems(list);
					result = runup + "<" + list_type + ">\n" + result + "</" + list_type + ">\n";
					return result;
				});
			}

			// attacklab: strip sentinel
			text = text.replace(/~0/, "");

			return text;
		}

		_ProcessListItems = function( list_str ) {
			//
			//  Process the contents of a single ordered or unordered list, splitting it
			//  into individual list items.
			//
			// The $g_list_level global keeps track of when we're inside a list.
			// Each time we enter a list, we increment it; when we leave a list,
			// we decrement. If it's zero, we're not in a list anymore.
			//
			// We do this because when we're not inside a list, we want to treat
			// something like this:
			//
			//    I recommend upgrading to version
			//    8. Oops, now this line is treated
			//    as a sub-list.
			//
			// As a single paragraph, despite the fact that the second line starts
			// with a digit-period-space sequence.
			//
			// Whereas when we're inside a list (or sub-list), that line will be
			// treated as the start of a sub-list. What a kludge, huh? This is
			// an aspect of Markdown's syntax that's hard to parse perfectly
			// without resorting to mind-reading. Perhaps the solution is to
			// change the syntax rules such that sub-lists must start with a
			// starting cardinal number; e.g. "1." or "a.".
			g_list_level++;

			// trim trailing blank lines:
			list_str = list_str.replace(/\n{2,}$/, "\n");

			// attacklab: add sentinel to emulate \z
			list_str += "~0";

/*
		list_str = list_str.replace(/
			(\n)?							// leading line = $1
			(^[ \t]*)						// leading whitespace = $2
			([*+-]|\d+[.]) [ \t]+			// list marker = $3
			([^\r]+?						// list item text   = $4
			(\n{1,2}))
			(?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))
		/gm, function(){...});
	*/
			list_str = list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm, function( wholeMatch, m1, m2, m3, m4 ) {
				var item = m4;
				var leading_line = m1;
				var leading_space = m2;

				if ( leading_line || (item.search(/\n{2,}/) > -1) ) {
					item = _RunBlockGamut(_Outdent(item));
				}
				else {
					// Recursion for sub-lists:
					item = _DoLists(_Outdent(item));
					item = item.replace(/\n$/, ""); // chomp(item)
					item = _RunSpanGamut(item);
				}

				return "<li>" + item + "</li>\n";
			});

			// attacklab: strip sentinel
			list_str = list_str.replace(/~0/g, "");

			g_list_level--;
			return list_str;
		}


		var _DoCodeBlocks = function( text ) {
			//
			//  Process Markdown `<pre><code>` blocks.
			//  
/*
		text = text.replace(text,
			/(?:\n\n|^)
			(								// $1 = the code block -- one or more lines, starting with a space/tab
				(?:
					(?:[ ]{4}|\t)			// Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
					.*\n+
				)+
			)
			(\n*[ ]{0,3}[^ \t\n]|(?=~0))	// attacklab: g_tab_width
		/g,function(){...});
	*/

			// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
			text += "~0";

			text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g, function( wholeMatch, m1, m2 ) {
				var codeblock = m1;
				var nextChar = m2;

				codeblock = _EncodeCode(_Outdent(codeblock));
				codeblock = _Detab(codeblock);
				codeblock = codeblock.replace(/^\n+/g, ""); // trim leading newlines
				codeblock = codeblock.replace(/\n+$/g, ""); // trim trailing whitespace
				codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

				return hashBlock(codeblock) + nextChar;
			});

			// attacklab: strip sentinel
			text = text.replace(/~0/, "");

			return text;
		}

		var hashBlock = function( text ) {
			text = text.replace(/(^\n+|\n+$)/g, "");
			return "\n\n~K" + (g_html_blocks.push(text) - 1) + "K\n\n";
		}


		var _DoCodeSpans = function( text ) {
			//
			//   *  Backtick quotes are used for <code></code> spans.
			// 
			//   *  You can use multiple backticks as the delimiters if you want to
			//	 include literal backticks in the code span. So, this input:
			//	 
			//		 Just type ``foo `bar` baz`` at the prompt.
			//	 
			//	   Will translate to:
			//	 
			//		 <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
			//	 
			//	There's no arbitrary limit to the number of backticks you
			//	can use as delimters. If you need three consecutive backticks
			//	in your code, use four for delimiters, etc.
			//
			//  *  You can use spaces to get literal backticks at the edges:
			//	 
			//		 ... type `` `bar` `` ...
			//	 
			//	   Turns to:
			//	 
			//		 ... type <code>`bar`</code> ...
			//
/*
		text = text.replace(/
			(^|[^\\])					// Character before opening ` can't be a backslash
			(`+)						// $2 = Opening run of `
			(							// $3 = The code block
				[^\r]*?
				[^`]					// attacklab: work around lack of lookbehind
			)
			\2							// Matching closer
			(?!`)
		/gm, function(){...});
	*/

			text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function( wholeMatch, m1, m2, m3, m4 ) {
				var c = m3;
				c = c.replace(/^([ \t]*)/g, ""); // leading whitespace
				c = c.replace(/[ \t]*$/g, ""); // trailing whitespace
				c = _EncodeCode(c);
				return m1 + "<code>" + c + "</code>";
			});

			return text;
		}


		var _EncodeCode = function( text ) {
			//
			// Encode/escape certain characters inside Markdown code runs.
			// The point is that in code, these characters are literals,
			// and lose their special Markdown meanings.
			//
			// Encode all ampersands; HTML entities are not
			// entities within a Markdown code span.
			text = text.replace(/&/g, "&amp;");

			// Do the angle bracket song and dance:
			text = text.replace(/</g, "&lt;");
			text = text.replace(/>/g, "&gt;");

			// Now, escape characters that are magic in Markdown:
			text = escapeCharacters(text, "\*_{}[]\\", false);

			// jj the line above breaks this:
			//---
			//* Item
			//   1. Subitem
			//            special char: *
			//---
			return text;
		}


		var _DoItalicsAndBold = function( text ) {

			// <strong> must go first:
			text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, "<strong>$2</strong>");

			text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, "<em>$2</em>");

			return text;
		}


		var _DoBlockQuotes = function( text ) {

/*
		text = text.replace(/
		(								// Wrap whole match in $1
			(
				^[ \t]*>[ \t]?			// '>' at the start of a line
				.+\n					// rest of the first line
				(.+\n)*					// subsequent consecutive lines
				\n*						// blanks
			)+
		)
		/gm, function(){...});
	*/

			text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm, function( wholeMatch, m1 ) {
				var bq = m1;

				// attacklab: hack around Konqueror 3.5.4 bug:
				// "----------bug".replace(/^-/g,"") == "bug"
				bq = bq.replace(/^[ \t]*>[ \t]?/gm, "~0"); // trim one level of quoting
				// attacklab: clean up hack
				bq = bq.replace(/~0/g, "");

				bq = bq.replace(/^[ \t]+$/gm, ""); // trim whitespace-only lines
				bq = _RunBlockGamut(bq); // recurse
				bq = bq.replace(/(^|\n)/g, "$1  ");
				// These leading spaces screw with <pre> content, so we need to fix that:
				bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function( wholeMatch, m1 ) {
					var pre = m1;
					// attacklab: hack around Konqueror 3.5.4 bug:
					pre = pre.replace(/^  /mg, "~0");
					pre = pre.replace(/~0/g, "");
					return pre;
				});

				return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
			});
			return text;
		}


		var _FormParagraphs = function( text ) {
			//
			//  Params:
			//    $text - string to process with html <p> tags
			//
			// Strip leading and trailing lines:
			text = text.replace(/^\n+/g, "");
			text = text.replace(/\n+$/g, "");

			var grafs = text.split(/\n{2,}/g);
			var grafsOut = new Array();

			//
			// Wrap <p> tags.
			//
			var end = grafs.length;
			for ( var i = 0; i < end; i++ ) {
				var str = grafs[i];

				// if this is an HTML marker, copy it
				if ( str.search(/~K(\d+)K/g) >= 0 ) {
					grafsOut.push(str);
				}
				else if ( str.search(/\S/) >= 0 ) {
					str = _RunSpanGamut(str);
					str = str.replace(/^([ \t]*)/g, "<p>");
					str += "</p>"
					grafsOut.push(str);
				}

			}

			//
			// Unhashify HTML blocks
			//
			end = grafsOut.length;
			for ( var i = 0; i < end; i++ ) {
				// if this is a marker for an html block...
				while ( grafsOut[i].search(/~K(\d+)K/) >= 0 ) {
					var blockText = g_html_blocks[RegExp.$1];
					blockText = blockText.replace(/\$/g, "$$$$"); // Escape any dollar signs
					grafsOut[i] = grafsOut[i].replace(/~K\d+K/, blockText);
				}
			}

			return grafsOut.join("\n\n");
		}


		var _EncodeAmpsAndAngles = function( text ) {
			// Smart processing for ampersands and angle brackets that need to be encoded.
			// Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
			//   http://bumppo.net/projects/amputator/
			text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;");

			// Encode naked <'s
			text = text.replace(/<(?![a-z\/?\$!])/gi, "&lt;");

			return text;
		}


		var _EncodeBackslashEscapes = function( text ) {
			//
			//   Parameter:  String.
			//   Returns:	The string, with after processing the following backslash
			//			   escape sequences.
			//
			// attacklab: The polite way to do this is with the new
			// escapeCharacters() function:
			//
			// 	text = escapeCharacters(text,"\\",true);
			// 	text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
			//
			// ...but we're sidestepping its use of the (slow) RegExp constructor
			// as an optimization for Firefox.  This function gets called a LOT.
			text = text.replace(/\\(\\)/g, escapeCharacters_callback);
			text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g, escapeCharacters_callback);
			return text;
		}


		var _DoAutoLinks = function( text ) {

			text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi, "<a href=\"$1\">$1</a>");

			// Email addresses: <address@domain.foo>
/*
		text = text.replace(/
			<
			(?:mailto:)?
			(
				[-.\w]+
				\@
				[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
			)
			>
		/gi, _DoAutoLinks_callback());
	*/
			text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, function( wholeMatch, m1 ) {
				return _EncodeEmailAddress(_UnescapeSpecialChars(m1));
			});

			return text;
		}


		var _EncodeEmailAddress = function( addr ) {
			//
			//  Input: an email address, e.g. "foo@example.com"
			//
			//  Output: the email address as a mailto link, with each character
			//	of the address encoded as either a decimal or hex entity, in
			//	the hopes of foiling most address harvesting spam bots. E.g.:
			//
			//	<a href="&#x6D;&#97;&#105;&#108;&#x74;&#111;:&#102;&#111;&#111;&#64;&#101;
			//	   x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;">&#102;&#111;&#111;
			//	   &#64;&#101;x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;</a>
			//
			//  Based on a filter by Matthew Wickline, posted to the BBEdit-Talk
			//  mailing list: <http://tinyurl.com/yu7ue>
			//
			// attacklab: why can't javascript speak hex?


			function char2hex(ch) {
				var hexDigits = '0123456789ABCDEF';
				var dec = ch.charCodeAt(0);
				return (hexDigits.charAt(dec >> 4) + hexDigits.charAt(dec & 15));
			}

			var encode = [

			function( ch ) {
				return "&#" + ch.charCodeAt(0) + ";";
			}, function( ch ) {
				return "&#x" + char2hex(ch) + ";";
			}, function( ch ) {
				return ch;
			}];

			addr = "mailto:" + addr;

			addr = addr.replace(/./g, function( ch ) {
				if ( ch == "@" ) {
					// this *must* be encoded. I insist.
					ch = encode[Math.floor(Math.random() * 2)](ch);
				} else if ( ch != ":" ) {
					// leave ':' alone (to spot mailto: later)
					var r = Math.random();
					// roughly 10% raw, 45% hex, 45% dec
					ch = (
					r > .9 ? encode[2](ch) : r > .45 ? encode[1](ch) : encode[0](ch));
				}
				return ch;
			});

			addr = "<a href=\"" + addr + "\">" + addr + "</a>";
			addr = addr.replace(/">.+:/g, "\">"); // strip the mailto: from the visible part
			return addr;
		}


		var _UnescapeSpecialChars = function( text ) {
			//
			// Swap back in all the special characters we've hidden.
			//
			text = text.replace(/~E(\d+)E/g, function( wholeMatch, m1 ) {
				var charCodeToReplace = parseInt(m1);
				return String.fromCharCode(charCodeToReplace);
			});
			return text;
		}


		var _Outdent = function( text ) {
			//
			// Remove one level of line-leading tabs or spaces
			//
			// attacklab: hack around Konqueror 3.5.4 bug:
			// "----------bug".replace(/^-/g,"") == "bug"
			text = text.replace(/^(\t|[ ]{1,4})/gm, "~0"); // attacklab: g_tab_width
			// attacklab: clean up hack
			text = text.replace(/~0/g, "")

			return text;
		}

		var _Detab = function( text ) {
			// attacklab: Detab's completely rewritten for speed.
			// In perl we could fix it by anchoring the regexp with \G.
			// In javascript we're less fortunate.
			// expand first n-1 tabs
			text = text.replace(/\t(?=\t)/g, "    "); // attacklab: g_tab_width
			// replace the nth with two sentinels
			text = text.replace(/\t/g, "~A~B");

			// use the sentinel to anchor our regex so it doesn't explode
			text = text.replace(/~B(.+?)~A/g, function( wholeMatch, m1, m2 ) {
				var leadingText = m1;
				var numSpaces = 4 - leadingText.length % 4; // attacklab: g_tab_width
				// there *must* be a better way to do this:
				for ( var i = 0; i < numSpaces; i++ ) leadingText += " ";

				return leadingText;
			});

			// clean up sentinels
			text = text.replace(/~A/g, "    "); // attacklab: g_tab_width
			text = text.replace(/~B/g, "");

			return text;
		}


		//
		//  attacklab: Utility functions
		//

		var escapeCharacters = function( text, charsToEscape, afterBackslash ) {
			// First we have to escape the escape characters so that
			// we can build a character class out of them
			var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g, "\\$1") + "])";

			if ( afterBackslash ) {
				regexString = "\\\\" + regexString;
			}

			var regex = new RegExp(regexString, "g");
			text = text.replace(regex, escapeCharacters_callback);

			return text;
		}


		var escapeCharacters_callback = function( wholeMatch, m1 ) {
			var charCodeToEscape = m1.charCodeAt(0);
			return "~E" + charCodeToEscape + "E";
		}

	} // end of Showdown.converter
})(steal);
(function( $ ) {
	//if we already have DocumentJS, don't create another, this is so we can document documentjs
	if(typeof DocumentJS != 'undefined'){
		return;
	}
	
	/**
	 * @class DocumentJS
	 * @tag core, documentation
     * There are several reasons why documentation is important:
     * 
     * * As apps grow, source code becomes complex and difficult to maintain.
     * * It's beneficial for customers because it helps to educate them on a product.
     * * Perhaps most importantly, it keeps a project going by bringing new developers up to speed - while also keeping the whole team on the same page.
	 * 
	 * DocumentJS is a new documentation solution for JavaScript applications. It makes creating, viewing, and maintaining documentation easy and fun. Out of the box, it features:
	 * 
     * * Fexible organization of your documentation
     * * An integrated documentation viewer where you can search your API
     * * Markdown support
     * * An extensible architecture
     * 
	 * DocumentJS provides powerful and easy to extend documentation functionality.
	 * It's smart enough to guess 
	 * at things like function names and parameters, but powerful enough to generate 
	 * <span class='highlight'>JavaScriptMVC's entire website</span>!
	 * 
	 * ###Organizing your documentation
	 *
	 * Let's use an hypothetical little CRM system as an example of how easy it is to organize your documentation with DocumentJS. 
	 * 
	 * First let's create our CRM documentation home page by creating a folder name __crm__. Paste this code into a file named __crm.js__ inside __crm__ folder.
	 * 
	 * @codestart
	 * /*
     *  * @@page crm CRM
     *  * @@tag home
     *  *
     *  * ###Little CRM
     *  *  
     *  * Our little CRM only has two classes:
     *  *  
     *  * * Customer 
     *  * * Order 
     *  *|
	 * @codeend
	 * 
	 * Run the documentjs script to generate the docs:
	 * 
	 * @codestart
	 * documentjs/doc.bat crm
	 * @codeend
	 * 
	 * This is what you should see when you open __crm\docs.html__:
	 * 
	 * @image jmvc/images/crm_doc_demo_1.png
	 * 
	 * 
	 * There are a few things to notice:
	 * 
	 * * The example closes comments with _*|_.  You should close them with / instead of |.
	 * * We create a link to another class with _[Animal | here]_. 
	 * * We used the @@page directive to create the crm documentation home page. Don't worry about the @@tag directive for now, we'll get back to it later. 
	 * * In all the examples in this walkthrough we use markdown markup instead of html to make the documentation more maintainable and easier to read .
	 * 
	 * Next we document the two classes that make our little crm system. Paste each snippet of code into two files with names __customer.js__ and __order.js__:
	 * 
	 * __customer.js__
	 * 
	 * @codestart
     * /*
     *  * @@class Customer
     *  * @@parent crm 
     *  * @@constructor
     *  * Creates a new customer.
     *  * @@param {String} name
     *  *|
     *  var Customer = function(name) {
	 *     this.name = name;
     *  }
	 * @codeend 
	 * 
	 * __order.js__
	 * 
	 * @codestart
     * /*
     *  * @@class Order
     *  * @@parent crm 
     *  * @@constructor
     *  * Creates a new order.
     *  * @@param {String} id
     *  *|
     *  var Order = function(id) {
	 *     this.id = id;
     *  }
	 * @codeend 
	 * 
	 * After runnig the documentjs script once again you should be able to see this:
	 * 
	 * @image jmvc/images/crm_doc_demo_2.png
	 * 
	 * 
	 * We want to be able to both look for our customer's orders and dispatch them so let's add a _findById_ method to our Order class
	 * and a _dispatch_ method to our Order's prototype:
	 * 
	 * __order.js__
	 * 
	 * @codestart
	 * /*  
     *  * @class Order 
     *  * @parent crm 
     *  * @@constructor
     *  * Creates a new order.
     *  * @@param {String} id
     *  *|
     * var Order = function(id) {
     *     this.id = id;
     * }
     *
     * $.extend(Order,
     * /*
     * * @@static
     * *|
     * {
	 *    /*
	 *     * Finds an order by id.
	 *     * @@param {String} id Order identification number.
	 *     * @@param {Date} [date] Filter order search by this date.
	 *     *|
	 *     findById: function(id, date) {
     *
	 *     }
     *  });
     *
     * $.extend(Order.prototype,
     * /*
     *  * @@prototype
     *  *|
     *  {
	 *     /*
	 *      * Dispatch an order.
	 *      * @@return {Boolean} Returns true if order dispatched successfully.
	 *      *|
	 *      dispatch: function() {
	 *     
	 *      }
     * });
	 * @codeend
	 * 
	 * Go ahead and produce the docs by running the documentjs script. You should see your Order methods organized by static and protoype categories.
	 * 
	 * There's one last thing we need to cover - customizing the document viewer template. The default viewer template file name is __summary.ejs__ and it's
	 * located in __documentjs/jmvcdoc/summary.ejs__. You can use a customized template by copying __summary__.ejs into the __crm__ folder and changing it 
	 * according to your needs. Let's try changing the navigation menu __core__ item to __crm__:
	 * 
	 * @codestart
	 * &lt;li class="ui-menu-item"&gt;
	 *     &lt;a class="menuLink" href="#&amp;search=crm"&gt;&lt;span class="menuSpan"&gt;CRM&lt;/span&gt;&lt;/a&gt;
     * &lt;/li&gt;
	 * @codeend
	 *
	 * Remember the @@tag directive? We can now change it in our examples from _core_ to _crm_. You will notice that our crm page will show up
	 * every time you click the CRM menu item or type _crm_ in the documentation viewer search box.
	 * 
	 * If you need for DocumentJS not to document a particular script you can do that by adding the @document-ignore directive to the top of the file. 
	 * 
	 * As you see DocumentJS makes it super easy and fun to organize your documentation!
	 * 
	 * ###How DocumentJS works
	 * 
	 * DocumentJS architecture is organized around the concepts of [DocumentJS.types | types] and [DocumentJS.tags | tags]. Types are meant to represent every javascript construct 
	 * you might want to comment like classes, functions and attributes. Tags add aditional information to the comments of the type being processed.
	 * 
	 * DocumentJS works by loading a set of javascript files, then by spliting each file into type/comments pairs 
	 * and finally parsing each type's comments tag directives to produce a set of jsonp files (one per type) 
	 * that are used by the document viewer (jmvcdoc) to render the documentation.
	 * 
	 * DocumentJS was written thinking of extensibility and it's very easy to add custom type/tag directives to handle your specific documentation needs.   
	 * 
	 * ###Type directives
	 * 
	 * * [DocumentJS.types.page | @page] -  add a standalone page.
	 * * [DocumentJS.types.attribute | @attribute] -  document values on an object.
	 * * [DocumentJS.types.function | @function] - document functions.
	 * * [DocumentJS.types.class| @class] - document a class. 
	 * * [DocumentJS.types.prototype | @prototype] - add to the previous class or constructor's prototype functions.
	 * * [DocumentJS.types.static | @static] - add to the previous class or constructor's static functions.
	 * * [DocumentJS.types.add |@add] - add docs to a class or construtor described in another file.
	 * 
	 * ###Tag directives
	 * 
	 * * [DocumentJS.tags.alias|@alias] - another commonly used name for Class or Constructor.
	 * * [DocumentJS.tags.author|@author] - author of class.
	 * * [DocumentJS.tags.codestart|@codestart] -> [DocumentJS.tags.codeend|@codeend] - insert highlighted code block.
	 * * [DocumentJS.tags.constructor | @constructor] - documents a contructor function and its parameters.
	 * * [DocumentJS.tags.demo|@demo] - placeholder for an application demo.
	 * * [DocumentJS.tags.download|@download] - adds a download link.
	 * * [DocumentJS.tags.iframe|@iframe] - adds an iframe with example code.
	 * * [DocumentJS.tags.hide|@hide] - hide in Class view.
	 * * [DocumentJS.tags.inherits|@inherits] - what the Class or Constructor inherits.
	 * * [DocumentJS.tags.parent|@parent] - says under which parent the current type should be located. 
	 * * [DocumentJS.tags.param|@param] - A function's parameter.
	 * * [DocumentJS.tags.plugin|@plugin] - by which plugin this object gets steald.
	 * * [DocumentJS.tags.return|@return] - what a function returns.
	 * * [DocumentJS.tags.scope|@scope] - forces the current type to start scope.
	 * * [DocumentJS.tags.tag|@tag] - tags for searching.
	 * * [DocumentJS.tags.test|@test] - link for test cases.
	 * * [DocumentJS.tags.type|@type] - sets the type for the current commented code.
	 * * [DocumentJS.tags.image|@image] - adds an image.
	 * 
	 * 
	 * ###Inspiration
	 * 
	 * DocumentJS was inspired by the [http://api.jquery.com/ jQuery API Browser] by [http://remysharp.com/ Remy Sharp]
	 * 
	 * 
	 * @param {Array|String} scripts an array of script objects that have src and text properties like:
	 * @codestart
	 * [{src: "path/to/file.js", text: "var a= 1;"}, { ... }]
	 * @codeend
	 * @param {Object} options an options hash including
	 * 
	 *   . name - the name of the application
	 *   . out - where to generate the documentation files
	 */
	DocumentJS = function(scripts, options) {
		// an html file, a js file or a directory
		options = options || {};
		if(typeof scripts == 'string'){
			if(!options.out){
				if(/\.html?$|\.js$/.test(scripts)){
					options.out = scripts.replace(/[^\/]*$/, 'docs')
				}else{ //folder
					options.out = scripts+"/docs";
				}
			}

			scripts = DocumentJS.getScripts(scripts)
		}
		
 		//all the objects live here, have a unique name
		DocumentJS.objects = {};
		
		//create each Script, which will create each class/constructor, etc
		print("PROCESSING SCRIPTS\n")
		for ( var s = 0; s < scripts.length; s++ ) {
			DocumentJS.Script.process(scripts[s])
		}
		print('\nGENERATING DOCS -> '+options.out+'\n')
		
		// generate individual JSONP forms of individual comments
		DocumentJS.generate(options)

		// make combined search data
		DocumentJS.searchData(options )

		//make summary page (html page to load it all)
		DocumentJS.summaryPage(options);
		
	};
	
	var extend = steal.extend,
		build = steal.build,
		docJS = DocumentJS;
	
	extend(docJS, {
		// gets scripts from a path
		getScripts : function(file){
			var scripts = [];
			if (/\.html?$/.test(file)) { // load all the page's scripts

				steal.plugins('steal/build', function(steal){

					steal.build.open(file).each(function(script, text, i){
						if (text && script.src) {
							scripts.push({
								src: script.src,
								text:  text
							})
						}
					});
				});
			}
			else if (/\.js$/.test(file)) { // load just this file
				scripts.push(file)
			}
			else { // assume its a directory
				var getJSFiles = function(dir){
				  new steal.File(dir).contents(function(f, type){
					if(type == 'directory'){
				       getJSFiles(dir+"/"+f)
				    }else if(/\.js$/.test(f)){

					  scripts.push( (dir+"/"+f).replace('\\', '/') )
				    }
				  })
				};
				getJSFiles(file);
			}
					
			return scripts;
		},
		generate : function(options){

			// go through all the objects and generate their docs
			var output = options.out ? options.out+ "/" : "";

			for ( var name in docJS.objects ) {
				if (docJS.objects.hasOwnProperty(name)){
					//get a copy of the object (we will modify it with children)
					var obj = docJS.extend({}, docJS.objects[name]),
						toJSON;
					
					// eventually have an option allow scripts
					if ( obj.type == 'script' || typeof obj != "object" ) {
						continue;
					}
					
					//get all children					
					obj.children = this.listedChildren(obj);
	
					var converted = name.replace(/ /g, "_")
										.replace(/&#46;/g, ".")
										.replace(/&gt;/g, "_gt_")
										.replace(/\*/g, "_star_")
					toJSON = this.out(obj);
					new docJS.File(output + converted + ".json").save(toJSON);
				}
	
			}
		},
		// takes an object and returns how DocumentJS likes to save data
		out: function() {
			return "C(" + docJS.toJSON.apply(docJS.toJSON, arguments) + ")"
		},
		// tests if item is a shallow child of parent
		shallowParent: function( item, parent ) {
			if ( item.parents && parent ) {
				for ( var i = 0; i < item.parents.length; i++ ) {
					if ( item.parents[i] == parent.name ) {
						return true;
					}
				}
			}
			return false;
		},
		// returns all recustive 'hard' children and one level of 'soft' children.
		listedChildren: function( item, stealSelf, parent ) {
			var result = stealSelf ? [item.name] : [];
			if ( item.children && !this.shallowParent(item, parent) ) {
				for ( var c = 0; c < item.children.length; c++ ) {
					var child = docJS.objects[item.children[c]];
					var adds = this.listedChildren(child, true, item);
					if ( adds ) {
						result = result.concat(adds);
					}

				}
			}
			return result;
		},
		summaryPage: function( options ) {
			//find index page
			var path = options.out,
				base = path.replace(/[^\/]*$/, ""),
				renderData = {
					pathToRoot: new docJS.File(base.replace(/\/[^\/]*$/, "")).pathToRoot(),
					path: path,
					indexPage: docJS.objects.index
				}

			//checks if you have a summary
			if ( readFile(base + "summary.ejs") ) {
				print("Using summary at " + base + "summary.ejs");
				docJS.renderTo(base + "docs.html", base + "summary.ejs", renderData)
			} else {
				print("Using default page layout.  Overwrite by creating: " + base + "summary.ejs");
				docJS.renderTo(base + "docs.html", "documentjs/jmvcdoc/summary.ejs", renderData);
			}
		},
		renderTo: function( file, ejs, data ) {
			new docJS.File(file).save(new docJS.EJS({
				text: readFile(ejs)
			}).render(data));
		}
	})
	//Add things to StealJS we like, then remove them from the global namespace
	
	
	extend(docJS, steal); //even if we delete steal, we still have it's goodness
	DocumentJS.EJS = steal.EJS;
	DocumentJS.JSONparse = JSONparse;
	DocumentJS.toJSON = toJSON;
	DocumentJS.extend = extend;
	
	DocumentJS.converter = new Showdown.converter();
	
	delete Showdown;
	delete JSONparse;


})(steal);
(function() {
	// the distance between 2 strings
	DocumentJS.distance = function( s1, s2 ) {
		if ( s1 == s2 ) {
			return 0;
		}
		var s1_len = s1.length,
			s2_len = s2.length;
		if ( s1_len === 0 ) {
			return s2_len;
		}
		if ( s2_len === 0 ) {
			return s1_len;
		}

		s1 = s1.split('');
		s2 = s2.split('');


		var v0 = new Array(s1_len + 1),
			v1 = new Array(s1_len + 1),
			s1_idx = 0,
			s2_idx = 0,
			cost = 0;
		for ( s1_idx = 0; s1_idx < s1_len + 1; s1_idx++ ) {
			v0[s1_idx] = s1_idx;
		}
		var char_s1 = '',
			char_s2 = '';
		for ( s2_idx = 1; s2_idx <= s2_len; s2_idx++ ) {
			v1[0] = s2_idx;
			char_s2 = s2[s2_idx - 1];

			for ( s1_idx = 0; s1_idx < s1_len; s1_idx++ ) {
				char_s1 = s1[s1_idx];
				cost = (char_s1 == char_s2) ? 0 : 1;
				var m_min = v0[s1_idx + 1] + 1;
				var b = v1[s1_idx] + 1;
				var c = v0[s1_idx] + cost;
				if ( b < m_min ) {
					m_min = b;
				}
				if ( c < m_min ) {
					m_min = c;
				}
				v1[s1_idx + 1] = m_min;
			}
			var v_tmp = v0;
			v0 = v1;
			v1 = v_tmp;
		}
		return v0[s1_len];
	}
})(steal);
(function(){
	
	// Makes a JSON object for search data
	DocumentJS.searchData = function(options){
		
		var searchData = {
				list: {}
		};

		addToSearchData(DocumentJS.objects, searchData)
		
		return new DocumentJS.File(options.out + "/searchData.json").save(DocumentJS.out(searchData, false));
	}
	
	// goes through list and adds to search data
	var addToSearchData = function( list, searchData ) {
		var c, parts, part, p, fullName;
		for ( var name in list ) {
			if (list.hasOwnProperty(name)){
				c = list[name];
				if ( c.type == 'script' ) {
					continue;
				}
				//break up into parts
				fullName = c.name;
				searchData.list[fullName] = {
					name: c.name,
					type: c.type
				};
				if ( c.title ) {
					searchData.list[fullName].title = c.title
				}
				if ( c.tags ) {
					searchData.list[fullName].tags = c.tags
				}
				if ( c.hide ) {
					searchData.list[fullName].hide = c.hide
				}
				parts = fullName.split(".");
				for ( p = 0; p < parts.length; p++ ) {
					part = parts[p].toLowerCase();
					if ( part == "jquery" ){
						continue;
					}
					addTagToSearchData(fullName, part, searchData)
				}
				//now add tags if there are tags
				if ( c.tags ) {
					for ( var t = 0; t < c.tags.length; t++ ){
						addTagToSearchData(fullName, c.tags[t], searchData);
					}
				}
			}
		}
	},
		//adds a component to the search data
		addTagToSearchData = function( data, tag, searchData ) {

			var letter, l, depth = 2,
				current = searchData;

			for ( l = 0; l < depth; l++ ) {
				letter = tag.substring(l, l + 1);
				if (!current[letter] ) {
					current[letter] = {};
					current[letter].list = [];
				}
				if ( indexOf(current[letter].list, data) == -1 ) {
					current[letter].list.push(data);
				}
				current = current[letter];
			}
		},
		indexOf = function( array, item ) {
			var i = 0,
				length = array.length;
			for (; i < length; i++ ){
				if ( array[i] === item ){
					return i;
				}
			}
			return -1;
		}
	

	
	
})(steal);
(function() {
	
	
	/**
	 * @attribute DocumentJS.tags
	 * @parent DocumentJS
	 * A tag adds additional information to the comment being processed.
	 * For example, if you want the current comment to include the author,
	 * include an @@author tag.
	 * 
	 * ## Creating your own tag
	 * 
	 * To create a tag, you need to add to DocumentJS.tags an object with an add and an optional
	 * addMore method like:
	 * 
	 * @codestart
	 * DocumentJS.tags.mytag = {
	 *   add : function(line){ ... },
	 *   addMore : function(line, last){ ... }
	 * }
	 * @codeend 
	 */
	
	
	DocumentJS.tags = {};

})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.alias
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * The Class or Constructor is known by another name.
	 * 
	 * ###Example:
	 *  
	 * @codestart
	 * /*
	 *  * @alias WidgetFactory
	 *  *|
	 *  $.Class.extend("jQuery.Controller",
	 *  ...
	 * @codeend 
	 */
	DocumentJS.tags.alias = {
		add: function( line ) {
			var m = line.match(/^\s*@alias\s*([\w\-\.]*)/)
			if ( m ) {
				this.alias = m[1];
			}
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.author
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * Describes who the author of a class is.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /*
	 *  * @author Justin Meyer
	 *  * @author Brian Moschel
	 *  *|
	 * @codeend
	 */
	DocumentJS.tags.author = {
		add: function( line ) {
			var m = line.match(/^\s*@author\s*(.*)/)
			if ( m ) {
				this.author = m[1];
			}
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.codeend
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Stops a code block.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 *
	 *  /* 
	 *   * @codestart
	 *   *  /* @class
	 *   *   * Person represents a human with a name.  Read about the 
	 *   *   * animal class [Animal | here].
	 *   *   * @constructor
	 *   *   * You must pass in a name.
	 *   *   * @param {String} name A person's name
	 *   *   *|
	 *   *   Person = function(name){
	 *   *      this.name = name
	 *   *      Person.count ++;
	 *   *   }
	 *   *  /* @Static *|
	 *   *  steal.Object.extend(Person, {
	 *   *      /* Number of People *|
	 *   *      count: 0
	 *   *  })
	 *   *  /* @Prototype *|
	 *   *  Person.prototype = {
	 *   *     /* Returns a formal name 
	 *   *      * @return {String} the name with "Mrs." added
	 *   *      *|
	 *   *      fancyName : function(){
	 *   *         return "Mrs. "+this.name;
	 *   *      }
	 *   *  }
	 *   * @codeend
	 *   *|
	 *
	 * @codeend 
	 */
	DocumentJS.tags.codeend = {
		add: function( line, data ) {

			if (!data.lines ) {
				print('you probably have a @codeend without a @codestart')
			}

			var joined = data.lines.join("\n");

			if ( data.type == "javascript" ) { //convert comments
				joined = joined.replace(/\*\|/g, "*/")
			}
			var out = "<pre><code class='" + data.type + "'>" + joined + "</code></pre>";

			return ["pop", out];
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.codestart
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Starts a code block.  
	 * 
	 * Looks for "@codestart codeType".
	 *   
	 * Matches multiple lines.
	 *   
	 * Must end with "@codeend".
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 *
	 *  /* 
	 *   * @codestart
	 *   *  /* @class
	 *   *   * Person represents a human with a name.  Read about the 
	 *   *   * animal class [Animal | here].
	 *   *   * @constructor
	 *   *   * You must pass in a name.
	 *   *   * @param {String} name A person's name
	 *   *   *|
	 *   *   Person = function(name){
	 *   *      this.name = name
	 *   *      Person.count ++;
	 *   *   }
	 *   *  /* @Static *|
	 *   *  steal.Object.extend(Person, {
	 *   *      /* Number of People *|
	 *   *      count: 0
	 *   *  })
	 *   *  /* @Prototype *|
	 *   *  Person.prototype = {
	 *   *     /* Returns a formal name 
	 *   *      * @return {String} the name with "Mrs." added
	 *   *      *|
	 *   *      fancyName : function(){
	 *   *         return "Mrs. "+this.name;
	 *   *      }
	 *   *  }
	 *   * @codeend
	 *   *|
	 *
	 * @codeend 
	 */
	DocumentJS.tags.codestart = {
		add: function( line, last ) {
			var m = line.match(/^\s*@codestart\s*([\w-]*)\s*(.*)/)


			if ( m ) {
				return ["push", {
					type: m[1] ? m[1].toLowerCase() : 'javascript',
					lines: [],
					last: last,
					_last: this._last
				}];
			}

		},
		addMore: function( line, data ) {
			data.lines.push(line);
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.constructor
	 * @parent DocumentJS.tags
	 *   
	 * Documents a constructor function and its parameters. 
	 * 
	 * ###Example:
	 * 
	 * @codestart
     * /*
     *  * @@class Customer 
     *  * @@constructor
     *  * Creates a new customer.
     *  * @param {String} name
     *  *|
     *  var Customer = function(name) {
	 *     this.name = name;
     *  }
	 * @codeend
	 */
	DocumentJS.tags.constructor =
	{
		add: function( line ) {
			var parts = line.match(/\s?@constructor(.*)?/);

			this.construct = parts && parts[1] ? " " + parts[1] + "\n" : ""
			this.ret = {
				type: this.alias ? this.alias.toLowerCase() : this.name.toLowerCase(),
				description: ""
			}
			return ["default", 'construct'];
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.demo
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Placeholder for an application demo.
	 * 
	 * ###Demo Example:
	 * 
	 * @codestart
	 * /*
	 *  * @demo jquery/controller/controller.html
	 *  *|
	 * @codeend
	 * 
	 * ###End Result:
	 *   
	 * @demo jquery/controller/controller.html
	 */
	DocumentJS.tags.demo = {
		add: function( line ) {
			var m = line.match(/^\s*@demo\s*([\w\.\/\-]*)\s*([\w]*)/)
			if ( m ) {
				var src = m[1] ? m[1].toLowerCase() : '';
				this.comment += "<div class='demo_wrapper' data-demo-src='" + src + "'></div>";
			}
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.download
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Adds a download link.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 *  * @constructor jQuery.Drag
	 *  * ...
	 *  * @plugin jquery/event/drag
	 *  * @download jquery/dist/jquery.event.drag.js
	 *  * @test jquery/event/drag/qunit.html
	 *  * ...
	 *  *|
	 *  $.Drag = function(){}
	 * @codeend
	 * 
	 * You can click the example download link on this [jQuery.Drag | page]
     *
	 */
	DocumentJS.tags.download = {
		add: function( line ) {
			var parts = line.match(/^\s*@download\s*([^ ]*)\s*([\w]*)/)
			this.download = parts[1];
			this.downloadSize = parts[2] || 0
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.hide
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Hides this construct from the left hand side bar.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /*
	 *  * Checks if there is a set_<i>property</i> value.  
	 *  * If it returns true, lets it handle; otherwise saves it.
	 *  * @@hide
	 *  * @@param {Object} property
	 *  * @@param {Object} value
	 *  *|
	 *  _setProperty: function( property, value, success, error, capitalized ) {
	 * @codeend
	 */
	DocumentJS.tags.hide = {
		add: function( line ) {
			var m = line.match(/^\s*@hide/)
			if ( m ) {
				this.hide = true;
			}
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.iframe
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Adds an iframe to some page with example code.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /*
	 *  * @iframe jquery/view/view.html 700
	 *  *|
	 * @codeend
	 * 
	 * ###End Result:
	 * 
	 * @iframe jquery/view/view.html 700
	 */
	DocumentJS.tags.iframe = {
		add: function( line ) {
			var m = line.match(/^\s*@iframe\s*([\w\.\/]*)\s*([\w]*)\s*(.*)/)

			if ( m ) {
				var src = m[1] ? m[1].toLowerCase() : '';
				var height = m[2] ? m[2] : '320';
				this.comment += "<div class='iframe_wrapper' "
				this.comment += "data-iframe-src='" + src + "' "
				this.comment += "data-iframe-height='" + height + "'></div>";
			}
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.inherits
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Says current class inherits from another class.
	 *
	 * ###Example:
	 * 
	 * @codestart
	 * /*
	 *  * @class Client
	 *  * @inherits Person
	 *  * ...
	 *  *|
	 *  var client = new Client() {
	 *  ...
	 * @codeend
	 */
	DocumentJS.tags.inherits = {
		add: function( line ) {
			var m = line.match(/^\s*@\w+ ([\w\.]+)/)
			if ( m ) {
				this.inherits = m[1];
			}
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.page
	 * @parent DocumentJS.tags
	 */
	DocumentJS.tags.page = {
		add: function( line ) {
			var m = line.match(/^\s*@\w+\s+([^\s]+)\s+(.+)/)
			if ( m ) {
				this.name = m[1];
				this.title = m[2] || this.name;
			}
		}
	};
})(steal);
(function() {
	(function() {

		var ordered = function( params ) {
			var arr = [];
			for ( var n in params ) {
				var param = params[n];
				arr[param.order] = param;
			}
			return arr;
		}


		/**
		 * @class DocumentJS.tags.param
		 * @tag documentation
		 * @parent DocumentJS.tags 
		 * 
		 * Adds parameter information.
		 * 
		 * ###Use cases:
		 * 
		 * 1. Common use:
		 * 
		 *      __@@params {TYPE} name description__
		 * 
		 * 2. Optional parameters use case:
		 * 
         *     __@@params {TYPE} [name] description__
         * 
         * 3. Default value use case:
         * 
         *     __@@params {TYPE} [name=default] description__
		 *
		 * ###Example:
		 * 
		 * @codestart
	     * /*
	     *  * Finds an order by id.
	     *  * @@param {String} id Order identification number.
	     *  * @@param {Date} [date] Filter order search by this date.
	     *  *|
	     *  findById: function(id, date) {
         *      // looks for an order by id
	     *  }   
    	 *  @codeend
    	 *  
    	 * 
		 */
		DocumentJS.tags.param = {

			addMore: function( line, last ) {
				if ( last ) last.description += "\n" + line;
			},
			/**
			 * Adds @param data to the constructor function
			 * @param {String} line
			 */
			add: function( line ) {
				if (!this.params ) {
					this.params = {};
				}
				var parts = line.match(/\s*@param\s+(?:\{?([^}]+)\}?)?\s+([^\s]+) ?(.*)?/);
				if (!parts ) {
					print("LINE: \n" + line + "\n does not match @params {TYPE} NAME DESCRIPTION")
					return;
				}
				var description = parts.pop();
				var n = parts.pop(),
					optional = false,
					defaultVal;
				//check if it has anything ...
				var nameParts = n.match(/\[([\w\.]+)(?:=([^\]]*))?\]/)
				if ( nameParts ) {
					optional = true;
					defaultVal = nameParts[2]
					n = nameParts[1]
				}

				var param = this.params[n] ? this.params[n] : this.params[n] = {
					order: ordered(this.params).length
				};

				param.description = description || "";
				param.name = n;
				param.type = parts.pop() || "";


				param.optional = optional;
				if ( defaultVal ) {
					param["default"] = defaultVal;
				}

				return this.params[n];
			},
			done : function(){
				if(this.ret && this.ret.description && this.ret.description ){
					this.ret.description = DocumentJS.converter.makeHtml(this.ret.description)
				}
				if(this.params){
					for(var paramName in this.params){
						if(this.params[paramName].description  ){
							this.params[paramName].description = DocumentJS.converter.makeHtml(this.params[paramName].description)
						}
					}
				}
			}
		};

	})()
})(steal);
(function() {
	(function() {
		var waiting = {}

		/**
		 * @class DocumentJS.tags.parent
		 * @tag documentation
		 * @parent DocumentJS.tags 
		 * 
		 * Says under which parent the current type should be located.
		 * 
		 * ###Example:
		 * 
		 * @codestart
		 * /**
		 *  * @constructor jQuery.Drag
		 *  * @parent specialevents
		 *  * ...
		 *  *|
		 *  $.Drag = function(){}
		 * @codeend
		 * 
		 * ###End Result:
		 * 
		 * @image jmvc/images/parent_tag_example.png
		 */
		DocumentJS.tags.parent = {
			add: function( line ) {
				var m = line.match(/^\s*@parent\s*([\w\.\/]*)\s*([\w]*)/)
				var name = m[1],
					Class = DocumentJS.Page,
					inst = DocumentJS.objects[name]

					if (!inst ) {
						inst = DocumentJS.objects[name] = {
							name: name
						}
					}
					if (!this.parents ) {
						this.parents = [];
					}
					this.parents.push(inst.name);

				if (!inst.children ) {
					inst.children = [];
				}
				inst.children.push(this.name)
			}
		};

	})();
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.plugin
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Adds to another plugin. 
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 *  * @tag core
	 *  * @plugin jquery/controller
	 *  * @download jquery/dist/jquery.controller.js
	 *  * @test jquery/controller/qunit.html
	 *  * ...
	 *  *|
	 *  $.Class.extend("jQuery.Controller",
	 * @codeend
	 * 
	 * ###End Result:
	 * 
	 * @image jmvc/images/plugin_tag_example.png
	 */
	DocumentJS.tags.plugin = {
		add: function( line ) {
			this.plugin = line.match(/@plugin ([^ ]+)/)[1];
		}
	}
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.return
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Describes return data in the format.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 *  /**
	 *   * Capitalizes a string
	 *   * @param {String} s the string to be lowercased.
	 *   * @return {String} a string with the first character capitalized, and everything else lowercased
	 *   *|
	 *   capitalize: function( s, cache ) {
	 *       return s.charAt(0).toUpperCase() + s.substr(1);
	 *   }
	 * @codeend
	 * 
	 * ###End Result:
	 * 
	 * @image jmvc/images/return_tag_example.png
	 */
	DocumentJS.tags["return"] = {
		add: function( line ) {
			if (!this.ret ) {
				this.ret = {
					type: 'undefined',
					description: ""
				}
			}

			var parts = line.match(/\s*@return\s+(?:\{([\w\|\.\/]+)\})?\s*(.*)?/);

			if (!parts ) {
				return;
			}

			var description = parts.pop() || "";
			var type = parts.pop();
			this.ret = {
				description: description,
				type: type
			};
			return this.ret;
		},
		addMore: function( line ) {
			this.ret.description += "\n" + line;
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.scope
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Forces the current type to start scope. 
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
     *  * @attribute convert
     *  * @scope
	 *  * An object of name-function pairs that are used to convert attributes.
	 *  * Check out [jQuery.Model.static.attributes]
	 *  * for examples.
	 *  *|
	 *  convert: {
	 *      "date": function( str ) {
	 *          return typeof str == "string" ? (Date.parse(str) == NaN ? null : Date.parse(str)) : str
	 *      },
	 *      "number": function( val ) {
	 *          return parseFloat(val)
	 *      },
	 *      "boolean": function( val ) {
	 *          return Boolean(val)
	 *      }
	 *  }
	 * @codeend
	 * 
	 * In the example above the use of @@scope forces __date__, __number__ and __boolean__ methods to be __convert's__ children.
	 */
	DocumentJS.tags.scope = {
		add: function( line ) {
			print("Scope! " + line)
			this.starts_scope = true;
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.tag
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Tags for searching.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 *  * @tag core
	 *  * @plugin jquery/controller
	 *  * @download jquery/dist/jquery.controller.js
	 *  *`@test jquery/controller/qunit.html
	 *  * ...
	 *  *|
	 *  $.Class.extend("jQuery.Controller", 
	 * @codeend
	 * 
	 * ###End Result:
	 * 
	 * @image jmvc/images/tag_tag_example.png
	 */
	DocumentJS.tags.tag = {
		add: function( line ) {
			var parts = line.match(/^\s*@tag\s*(.+)/);

			if (!parts ) {
				return;
			}
			this.tags = parts[1].split(/\s*,\s*/g)
			//return this.ret;
		} //,
		//add_more : function(line){
		//    this.tags.concat(line.split(/\s*,\s*/g))
		//}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.test
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Link to test cases.
	 * 
	 * #Example
	 * 
	 * @codestart
	 * /*
	 *  * @constructor jQuery.Drag
	 *  * @parent specialevents
	 *  * @plugin jquery/event/drag
	 *  * @download jquery/dist/jquery.event.drag.js
	 *  * @test jquery/event/drag/qunit.html
	 *  * ...
	 *  *|
	 *  $.Drag = function(){}
	 * @codeend
	 * 
	 * ###End Result:
	 * @image jmvc/images/test_tag_example.png
	 * @image jmvc/images/test_tag_test_example.png
	 */
	DocumentJS.tags.test = {
		add: function( line ) {
			this.test = line.match(/@test ([^ ]+)/)[1];
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.type
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Sets the type for the current commented code.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 *  *
     *  * @attribute convert
     *  * @type Object
	 *  * An object of name-function pairs that are used to convert attributes.
	 *  * Check out [jQuery.Model.static.attributes]
	 *  * for examples.
	 *  *|
	 *  convert: {
	 *      "date": function( str ) {
	 *          return typeof str == "string" ? (Date.parse(str) == NaN ? null : Date.parse(str)) : str
	 *      },
	 *      "number": function( val ) {
	 *          return parseFloat(val)
	 *      },
	 *      "boolean": function( val ) {
	 *          return Boolean(val)
	 *      }
	 *  }
	 * @codeend 
	 */
	DocumentJS.tags.type = {
		add: function( line ) {
			var m = line.match(/^\s*@type\s*([\w\.\/]*)/)
			if ( m ) {
				this.attribute_type = m[0]
			}
		}
	};
})(steal);
(function() {
	/**
	 * @class DocumentJS.tags.image
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Adds an image.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /* 
	 *  * @image jmvc/images/page_type_example.png 640 480
	 *  *|
	 * @codeend
	 */
	DocumentJS.tags.image = {
		add: function( line ) {
			var m = line.match(/^\s*@image\s*([\w\.\/]*)\s*([\w]*)\s*([\w]*)\s*(.*)/)

			if ( m ) {
				var src = m[1] ? m[1].toLowerCase() : '';
				this.comment += "<img class='image_tag' ";
				this.comment += "src='" + src + "' ";
				m[2] ? this.comment += "width='" + m[2] + "' " : true;
				m[3] ? this.comment += "height='" + m[3] + "' " : true;
				this.comment += "/>";
			}
		}
	};
})(steal);
(function() {
	/**
	 * @attribute DocumentJS.types
	 * @parent DocumentJS
	 * Type directives represent every possible javascript construct 
	 * you might want to document.
	 * 
	 * ## How to create your own type directive
	 * 
     * All you have to do is create a file describing what your new directive tag looks like and does, 
     * and just drop it into the "tags/types" directory - it's that easy.
     *
     * A common documentation need in JavaScript projects is to document classes with non-standard syntax. 
     * Popular frameworks handle class creation using the following pattern:
     * 
     * @codestart
     * /* 
     *  * we want to document this as being a class 
     *  *|
     * var Person = makeClass(
     * {
     *   initialize: function(name) {
     *       this.name = name;
     *   },
     *   say: function(message) {
     *       return this.name + " says: " + message;
     *   }
     * });
     * @codeend
     *  
     * Documentjs is flexible enough to let you do this with minimal effort. 
     * All you have to do is to add a new type to the existing types folder (__documentjs/types__).  Let's name it __make_class.js__:
     *
     * @codestart
	 * DocumentJS.Type("MakeClass",
	 * /**
	 *  * @@Static
	 *  *|
	 * {
	 *     codeMatch: /(\w+)\s*[:=]\s*makeClass\(([^\)]*)/),
	 *     /*
	 *      * Parses the code to get the class data.
	 *      * @@param {String} code
	 *      * @@return {Object} class data
	 *      *|
	 *      code: function( code ) {
	 *          var parts = code.match(this.codeMatch);
	 *              if ( parts ) {
	 *                  return {
	 *                      name: parts[2],
	 *                      inherits: parts[1].replace("$.", "jQuery.")
     *                      type: "class"
	 *                  }
     *              }
	 *      }
     * }
     * @codeend
     * 
     * There's one final step you must follow to make your custom type work: add it to the list of 
     * loaded types in __documentjs/types/types.js__.
     * 
     * @codestart
     *  ...
     * '//documentjs/types/function', '//documentjs/types/page', '//documentjs/types/prototype',
     * '//documentjs/types/script', '//documentjs/types/static', '//documentjs/types/make_class');
     * @codeend
     * 
     * And that's it! Now you can write your code using your favorite framework 
     * and know that all your classes will be documented correctly for you.
     * 
     * 
	 */
	DocumentJS.types = {};
})(steal);
(function() {
	/**
	 * @class
	 * @tag documentation
	 * Keeps track of types of directives in DocumentJS.  
	 * Each type is added to the types array.
	 * @param {Object} type
	 * @param {Object} props
	 */
	DocumentJS.Type = function( type, props ) {
		DocumentJS.types[type] = props;
		props.type = type;
	}

	DocumentJS.extend(DocumentJS.Type,
	/**
	 * @Static
	 */
	{
		/**
		 * Must get type and name
		 * @param {String} comment
		 * @param {String} code
		 * @param {Object} scope
		 * @return {Object} type
		 */
		create: function( comment, code, scope ) {
			var check = comment.match(/^\s*@(\w+)/),
				type, props

				if (!(type = this.hasType(check ? check[1] : null))) { //try code
					type = this.guessType(code);
				}

				if (!type ) {
					return null;
				}

				var nameCheck = comment.match(/^\s*@(\w+)[ \t]+([\w\.]+)/m)

			
			props = type.code(code)
			
			if (!props && !nameCheck ) {
				return null;
			}

			if (!props ) {
				props = {};
			}
			if ( nameCheck && nameCheck[2] && nameCheck[1].toLowerCase() == type.type ) {
				props.name = nameCheck[2]
			}
			if ( type.init ) {
				return type.init(props, comment)
			}
			if ( DocumentJS.objects[props.name] ) {
				var newProps = props;
				props = DocumentJS.objects[props.name];
				DocumentJS.extend(props, newProps);
			}
			
			if ( !props.type ) {
				props.type = type.type;
			}
			if ( props.name ) {
				var parent = this.getParent(type, scope)
				//print("    p="+(parent ? parent.name+":"+parent.type : ""))
				//if we are adding to an unlinked parent, add parent's name
				if (!parent.type || DocumentJS.types[parent.type].useName ) {
					props.name = parent.name + "." + props.name
				}
				props.parent = parent.name;
				if (!parent.children ) {
					parent.children = [];
				}
				parent.children.push(props.name)

				//objects[props.name] = props;
				this.process(props, comment, type)
				return props
			}
		},
		/**
		 * Get the type's parent
		 * @param {Object} type
		 * @param {Object} scope
		 * @return {Object} parent
		 */
		getParent: function( type, scope ) {
			if (!type.parent ) {
				return scope;
			}


			while ( scope && scope.type && !type.parent.test(scope.type) ) {

				scope = DocumentJS.objects[scope.parent];

			}
			return scope;
		},
		/**
		 * Checks if type processor is loaded
		 * @param {Object} type
		 * @return {Object} type
		 */
		hasType: function( type ) {
			if (!type ) return null;

			return DocumentJS.types.hasOwnProperty(type.toLowerCase()) ? DocumentJS.types[type.toLowerCase()] : null;
		},
		/**
		 * Guess type from code
		 * @param {String} code
		 * @return {Object} type
		 */
		guessType: function( code ) {
			for ( var type in DocumentJS.types ) {
				if ( DocumentJS.types[type].codeMatch && DocumentJS.types[type].codeMatch(code) ) {
					return DocumentJS.types[type];
				}

			}
			return null;
		},
		suggestType : function(incorrect, line){
			var lowest = 1000, 
				suggest = "",
				check = function(things){
					for(var name in things){
						var dist = DocumentJS.distance(incorrect.toLowerCase(),name.toLowerCase())
						if(dist < lowest ){
							lowest = dist
							suggest = name.toLowerCase()
						} 
					}
				}
			check(DocumentJS.types);
			check(DocumentJS.tags);
			
			if(suggest){
				print("\nWarning!!\nThere is no @"+incorrect+" directive. did you mean @"+suggest+" ?\n")
			}
		},
		matchTag: /^\s*@(\w+)/,
		/**
		 * Process comments
		 * @param {Object} props
		 * @param {String} comment
		 * @param {Object} type
		 */
		process: function( props, comment, type ) {
			var i = 0,
				lines = comment.split("\n"),
				typeDataStack = [],
				curType, lastType, curData, lastData, defaultWrite = 'comment',
				messages = []; //what data we are going to be called with
			if ( !props.comment ) {
				props[defaultWrite] = '';
			}
			for ( var l = 0; l < lines.length; l++ ) {
				var line = lines[l],
					match = line.match(this.matchTag);

					if ( match ) {
						match[1] = match[1].toLowerCase();
						var curType = DocumentJS.tags[match[1]];



						if (!curType ) {
							if(!DocumentJS.types[match[1].toLowerCase()]){
								this.suggestType(match[1])
							}
							
							if (!DocumentJS.types[match[1]] ) {
								props.comment += line + "\n"
							}

							continue;
						} else {
							curType.type = match[1];
						}
						messages.push(match[1])
						curData = curType.add.call(props, line, curData);

						//horrible ... fix
						if ( curData && curData.length == 2 && curData[0] == 'push' ) { //
							typeDataStack.push({
								type: lastType,
								data: lastData
							})
							curData = curData[1];
							lastType = curType;
						}
						else if ( curData && curData.length == 2 && curData[0] == 'pop' ) {
							var last = typeDataStack.pop();

							if ( last && last.type ) {
								last.type.addMore.call(props, curData[1], last.data);
							} else {
								props[defaultWrite] += "\n" + curData[1]
							}

							lastData = curData = last.data;
							lastType = curType = last.type;
						} else if ( curData && curData.length == 2 && curData[0] == 'default' ) {
							defaultWrite = curData[1];
						}
						else if ( curData ) {
							lastType = curType;
							lastData = curData;
						}
						else {
							//this._last = null;
							lastType = null;
						}


					}
					else {

						//clean up @@abc becomes @abc
						line = line.replace(/@@/g, "@");

						if ( lastType ) {
							lastType.addMore.call(props, line, curData)
						} else {
							props[defaultWrite] += line + "\n"
						}
					}
			}
			

			try {
				props.comment = DocumentJS.converter.makeHtml(props.comment);
				//allow post processing
				for(var tag in DocumentJS.tags){
					if(DocumentJS.tags[tag].done){
						DocumentJS.tags[tag].done.call(props);
					}
				}
				
			} catch (e) {
				print("Error with converting to markdown")
			}

		}
	});
})(steal);
(function() {
	/**
	 * @class DocumentJS.types.add
	 * @tag documentation
	 * @parent DocumentJS.types
	 * Used to set scope to add to classes or methods in another file. 
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 * * @add jQuery.String.static
	 * *|
	 * $.String.
	 * /**
	 * * Splits a string with a regex correctly cross browser
	 * * @param {Object} string
	 * * @param {Object} regex
	 * *|
	 * rsplit = function( string, regex ) {
	 * @codeend
	 * 
	 * It's important to note that add must be in its own comment block.
	 * 
	 * ###End Result:
	 * 
	 * @image jmvc/images/add_tag_example.png 970
	 */
	DocumentJS.Type("add",
	/**
	 * @Static
	 */
	{
		/**
		 * Code parser.
		 */
		code: function() {

		},
		/**
		 * @constructor
		 * @param {Object} type data
		 */
		init: function( props ) {
			if (!DocumentJS.objects[props.name] ) {
				DocumentJS.objects[props.name] = props;
			}
			return DocumentJS.objects[props.name];
		},
	/*
	 * Possible scopes for @add.
	 */
		parent: /script/,
		useName: true,
		hasChildren: true
	})
})(steal);
(function() {
	/**
	 * @class DocumentJS.types.attribute
	 * @tag documentation
	 * @parent DocumentJS.types
	 * Documents an attribute.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 * * @@attribute delay
	 * * Sets the delay in milliseconds between an ajax request is made and
	 * * the success and complete handlers are called.  This only sets
	 * * functional fixtures.  By default, the delay is 200ms.
	 * *|
	 * $.fixture.delay = 200
	 * @codeend
	 * 
	 * You can see the end result [jQuery.fixture.delay | here].
	 */
	DocumentJS.Type("attribute",
	/**
	 * @Static
	 */
	{
	/*
	 * Checks if code matches the attribute type.
	 * @param {String} code
	 * @return {Boolean} true if code matches an attribute
	 */
		codeMatch: function( code ) {
			return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)
		},
	/*
	 * Must return the name if from the code.
	 * @param {String} code
	 * @return {Object} type data 
	 */
		code: function( code ) {
			var parts = code.match(/(\w+)\s*[:=]\s*/);
			if ( parts ) {
				return {
					name: parts[1]
				}
			}
		},
	/*
	 * Possible scopes for @attribute.
	 */
		parent: /script|static|proto|class/,
		useName: false
	});
})(steal);
(function() {
	/**
	 * @class DocumentJS.types.class
	 * @tag documentation
	 * @parent DocumentJS.types
	 * Documents a 'Class'.
	 *  
	 * A class is typically a collection of static and prototype functions.
	 *  
	 * DocumentJS can automatically detect classes created with jQuery.Class.
	 *  
	 * However, you can make anything a class with the __@class__ _ClassName_ directive.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 *  * @@class 
	 *  * Person represents a human with a name.  Read about the 
	 *  * animal class [Animal | here]. 
	 *  *|
	 * Person = Animal.extend(
	 * /* @@Static *|
	 * {
	 *    /* Number of People *|
	 *    count: 0
	 * },
	 * /* @@Prototype *|
	 * {
	 *    init : function(name){
	 *      this.name = name
	 *      this._super({warmblood: true})
	 *    },
	 *    /* Returns a formal name 
	 *     * @return {String} the name with "Mrs." added
	 *     *|
	 *   fancyName : function(){
	 *      return "Mrs. "+this.name;
	 *   }
	 * })
	 * @codeend
	 */
	DocumentJS.Type("class",
	/**
	 * @Static
	 */
	{
		codeMatch: /([\w\.\$]+?).extend\(\s*["']([^"']*)["']/,
		// /([\w\.]*)\s*=\s*([\w\.]+?).extend\(/,
		//must return the name if from the code
		funcMatch: /(?:([\w\.]+)|(["'][^"']+["']))\s*[:=]\s*function\s?\(([^\)]*)/,
	/*
	 * Parses the code to get the class data.
	 * @param {String} code
	 * @return {Object} class data
	 */
		code: function( code ) {
			var parts = code.match(this.codeMatch);
			if ( parts ) {
				return {
					name: parts[2],
					inherits: parts[1].replace("$.", "jQuery.")
				}
			}
			parts = code.match(this.funcMatch)
			if ( parts ) {
				return {
					name: parts[1] ? parts[1].replace(/^this\./, "") : parts[2]
				}
			}
		},
	/*
	 * Possible scopes for @class.
	 */
		parent: /script/,
		useName: true,
		hasChildren: true
	})
})(steal);
(function() {
	/**
	 * @class DocumentJS.types.function
	 * @tag documentation
	 * @parent DocumentJS.types
	 * Documents a function. Doc can guess at a functions name and params if the source following a comment matches something like:
	 * 
	 * @codestart
	 * myFuncOne : function(param1, param2){}  //or
	 * myFuncTwo = function(param1, param2){}  
	 * @codeend
	 * 
	 * ###Directives
	 *
	 * Use the following directives to document a function.
	 * 
	 * @codestart
	 * [ DocumentJS.types.function | @function ] functionName                       -&gt; Forces a function
	 * [ DocumentJS.tags.param | @param ] {optional:type} paramName Description -&gt; Describes a parameter
	 * [ DocumentJS.tags.return | @return ] {type} Description                    -&gt; Describes the return value
	 * @codeend
	 *
	 * ###Example
	 * 
	 * @codestart
	 * /* Adds, Mr. or Ms. before someone's name
	 *  * [ DocumentJS.tags.param | @param ] {String} name the persons name
	 *  * [ DocumentJS.tags.param | @param ] {optional:Boolean} gender true if a man, false if female.  Defaults to true.
	 *  * [ DocumentJS.tags.return | @return ] {String} returns the appropriate honorific before the person's name.
	 *  *|  
	 * honorific = function(name, gender){
	 * @codeend 
	 */
	DocumentJS.Type("function",
	/**
	 * @Static
	 */
	{
		codeMatch: /(?:([\w\.]+)|(["'][^"']+["']))\s*[:=]\s*function\s?\(([^\)]*)/,
	/*
	 * Parses the code to get the function data.
	 * Must return the name if from the code.
	 * @param {String} code
	 * @return {Object} function data
	 */
		code: function( code ) {
			var parts = this.codeMatch(code);

			if (!parts ) {
				parts = code.match(/\s*function\s+([\w\.\$]+)\s*(~)?\(([^\)]*)/)
			}
			var data = {};
			if (!parts ) {
				return;
			}
			data.name = parts[1] ? parts[1].replace(/^this\./, "") : parts[2];

			//clean up name if it has ""
			if (/^["']/.test(data.name) ) {
				data.name = data.name.substr(1, data.name.length - 2).replace(/\./g, "&#46;").replace(/>/g, "&gt;");
			}
			data.params = {};
			data.ret = {
				type: 'undefined',
				description: ""
			}
			var params = parts[3].match(/\w+/g);

			if (!params ) return data;

			for ( var i = 0; i < params.length; i++ ) {
				data.params[params[i]] = {
					description: "",
					type: "",
					optional: false,
					order: i,
					name: params[i]
				};
			}

			return data;
		},
	/*
	 * Possible scopes for @function.
	 */
		parent: /script|static|proto|class/,
		useName: false
	})
})(steal);
(function() {
	/**
	 * @class DocumentJS.types.page
	 * @tag documentation
	 * @parent DocumentJS.types
	 * 
	 * Defines a standalone documentation page.
	 * 
	 * Used to organize your documentation in a flexible manner.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 *  * @page follow Follow JavaScriptMVC
	 *  * #Following JavaScriptMVC
	 *  * ##Twitter
	 *  * [![twitter][2]][1]
	 *  * [1]: http://twitter.com/javascriptmvc
	 *  * [2]: http://wiki.javascriptmvc.com/wiki/images/f/f7/Twitter.png
	 *  *
	 *  * Follow [http://twitter.com/javascriptmvc @javascriptmvc] on twitter for daily useful tips.
	 *  * ##Blog
	 *  * [![blog][2]][1]
	 *  * [1]: http://jupiterit.com/
	 *  * [2]: http://wiki.javascriptmvc.com/wiki/images/e/e5/Blog.png  
	 *  *
	 *  * Read [http://jupiterit.com/ JavaScriptMVC's Blog] for articles, techniques and ideas
	 *  * on maintainable JavaScript.
	 *  * ##Email List
	 *  * [![email list][2]][1]
	 *  * [1]: http://forum.javascriptmvc.com/
	 *  * [2]: http://wiki.javascriptmvc.com/wiki/images/8/84/Discuss.png  
	 *  
	 *  * Discuss ideas to make the framework better or problems you are having on  [http://forum.javascriptmvc.com/ JavaScriptMVC's Forum] 
	 * .*
	 *  *|
	 * @codeend
	 * 
	 * ###End Result:
	 * 
	 * @image jmvc/images/page_type_example.png 970
	 */
	DocumentJS.Type("page", {
		code: function() {

		},
	/*
	 * Possible scopes for @page.
	 */
		parent: /script|page/,
		useName: false,
		hasChildren: true
	})
})(steal);
(function() {
	/**
	 * @class DocumentJS.types.prototype
	 * @tag documentation
	 * @parent DocumentJS.types
	 * Sets the following functions and attributes to be added to Class or Constructor prototype (instance) functions.
	 * 
	 * ###Example
	 * 
	 * @codestart
	 * $.Controller.extend('Cookbook.Controllers.Recipe',
	 * /* @Static *|
	 * {
	 *    onDocument: true
	 * },
	 * /* @Prototype *|
	 * {
	 *  /**
	 *   * When the page loads, gets all recipes to be displayed.
	 *   *|
	 *   load: function(){
	 *      if(!$("#recipe").length) 
	 *          $(document.body).append($('&lt;div/&gt;').attr('id','recipe'))
	 *      Cookbook.Models.Recipe.findAll({}, this.callback('list'));
	 *    },
	 *    ...
	 * @codeend
	 */
	DocumentJS.Type("prototype",
/*
 * @Static
 */
	{
/*
	 * @return {Object} prototype data.
	 */
		code: function() {
			return {
				name: "prototype"
			}
		},
/*
	 * Possible scopes for @prototype.
	 */
		parent: /script|class/,
		useName: true,
		hasChildren: true
	})
})(steal);
(function() {
	/**
	 * Represents a file.
	 * Breaks up file into comment and code parts.
	 * Creates new [DocumentJS.Pair | Doc.Pairs].
	 * @hide
	 */
	DocumentJS.Script = {
		group: new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[^\\w\\{\\(\\[/]*[^\\n]*)", "g"),

		splitter: new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w\\{\\(\\[\"'\$]*([^\\r\\n]*))"),

		/**
		 * Generates docs for a file.
		 * @param {Object} docScript an object that has src and text attributes.  It can also just be 
		 * the path of a file.
		 */
		process: function( docScript ) {
			if(typeof docScript == 'string'){
				docScript = {src: docScript}
			}

			var source = docScript.text || readFile(docScript.src);
			
			//check if the source has @documentjs-ignore
			if (/\@documentjs-ignore/.test(source) ) {
				return;
			}
			var script = {
				type: "script",
				name: docScript.src
			}
			print("  " + script.name);
			DocumentJS.objects[script.name] = script;
			var pairs = source.match(this.group);
			//clean comments
			var scope = script;
			if (!pairs ) return;
			for ( var i = 0; i < pairs.length; i++ ) {
				var splits = pairs[i].match(this.splitter),
					comment = splits[1].replace(/\r?\n(\s*\*+)?/g, '\n');

				//print(splits[1].replace(/^[^\w@]*/,''))
				var code = splits[2],
					removeSpace = Infinity,
					lines = comment.split("\n"),
					noSpace = /\S/g,
					match,
					l;
					
					for ( l = 0; l < lines.length; l++ ) {
						match = noSpace.exec(lines[l]);
						if ( match && lines[l] && noSpace.lastIndex < removeSpace ) {
							removeSpace = noSpace.lastIndex;
						}
						noSpace.lastIndex = 0;
					}
					//print(removeSpace)
					if ( isFinite(removeSpace) ) {
						for ( l = 0; l < lines.length; l++ ) {

							lines[l] = lines[l].substr(removeSpace - 1)
						}
					}
					comment = lines.join("\n")

					var type = DocumentJS.Type.create(comment, code, scope, DocumentJS.objects);

				if ( type ) {

					DocumentJS.objects[type.name] = type;
					//get the new scope if you need it
					// if we don't have a type, assume we can have children
					scope = !type.type || DocumentJS.types[type.type].hasChildren ? type : scope;
				}

			}

		}
	};

	DocumentJS.Type("script", {
		useName: false,
		hasChildren: true
	})
})(steal);
(function() {
	/**
	 * @class DocumentJS.types.static
	 * @tag documentation
	 * @parent DocumentJS.types
	 * Sets the following functions and attributes to be added to Class or Constructor static (class) functions.
	 * 
	 * ###Example
	 * 
	 * @codestart
	 * $.Model.extend('Cookbook.Models.Recipe',
	 * /* @Static *|
	 * {
	 *  /**
	 *   * Retrieves recipes data from your backend services.
	 *   * @param {Object} params params that might refine your results.
	 *   * @param {Function} success a callback function that returns wrapped recipe objects.
	 *   * @param {Function} error a callback function for an error in the ajax request.
	 *   *|
	 *   findAll : function(params, success, error){
	 *      $.ajax({
	 *          url: '/recipe',
	 *          type: 'get',
	 *          dataType: 'json',
	 *          data: params,
	 *          success: this.callback(['wrapMany',success]),
	 *          error: error,
	 *          fixture: "//cookbook/fixtures/recipes.json.get" //calculates the fixture path from the url and type.
	 *      })
	 *    },
	 * ...
	 * @codeend
	 */
	DocumentJS.Type("static",
/*
 * @Static
 */
	{
	/*
	 * @return {Object} prototype data.
	 */
		code: function() {
			return {
				name: "static"
			}
		},
	/*
	 * Possible scopes for @static.
	 */
		parent: /script|class/,
		useName: true,
		hasChildren: true
	})
})(steal)