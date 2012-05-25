# harvestr

Scrape the web with a JSON object.

---

*	[What](#what)
*	[How](#how)
	*	[Basic Use](#basic-use)
	*	[Command Line Use](#command-line-use)
	*	[Nested Queries & Loops](#nested-queries--loops)
	*	[Commands & Methods](#commands--methods)
*	[Object Schema](#object-schema)
*	[API](#api)
*	[Dependencies & Thanks](#dependencies--thanks)
*	[Don't Be Evil](#don-t-be-evil)
*	[Who](#who)
*	[License](#license)

*Still under heavy development!*

# What

Harvestr allows you to build & run a web scraper based on "schemas" with a simple JSON object structure. These can be updated & reused easily, and matched with the corresponding Harvestr result object to render data in portable formats, like csv or tab-delimited text.

# How

See the `examples` folder for sample code & result objects compared with their target HTML.

## Basic Use

	var Harvestr = require('../harvestr').start;

	Harvestr.get('http://en.wikipedia.org/wiki/Main_Page',{"#articlecount a:first":"text()"},
		function(result) {
			console.log(result); // returns # of english articles
		});

Harvestr responds with a JSON object. Each top level key corresponds to the top level selector you specified.

	{ 
		"#articlecount a" : {
			"text()" : "3,960,486"
		}
	}

You can use basic CSS selectors for your queries or augment them with jQuery selectors (see `Commands & Methods`, below).

## Command Line Use

	node harvestr.js -i myschema.json

You can use Harvestr from the command line by providing an input file in JSON format. The input file should include the JSON object schema to be scraped alongside meta information that includes the URL(s) and more. See `Object Schema` for format info.

By default, just specifying `-i` will output the results to the console. You may also specify an output file with `-o` and an encoding with `-e` that can be: `utf8`, `base64` or `ascii` (default).

	node harvestr.js -i myschema.json -o output.csv

Specifying one of the following extensions for your output file will format the file accordingly:

*	`.csv`: Comma-delimited
*	`.txt`: Tab-delimited

## Nested Queries & Loops

You can use a nested object with Harvestr along with some special keywords to do queries and loops.

	Harvestr.get('http://en.wikipedia.org/wiki/Main_Page',
		{ 
			"#p-lang li" : {
				"each" : {
					"a" : "text()"
				}
			}
		},
		function(result) {
			console.log(JSON.stringify(result)); // returns list of languages
		});
		
You can also use custom callbacks vs. a method like `text()` or `html()`. If you ran the above example, you may notice that certain languages didn't render properly. We could use this custom callback to escape our ouput:

	Harvestr.get('http://en.wikipedia.org/wiki/Main_Page',
		{ 
			"#p-lang li" : {
				"each" : {
					"a" : function($,i,node) {
						return escape($(node).text());
					}
				}
			}
		},
		function(result) {
			console.log(JSON.stringify(result)); // returns list of languages
		});
		
Custom callback functions receive the following as arguments:

*	`$` - the Cheerio instance
*	`i` - an index value indicating the current node position in the loop
*	`node` - the current DOM element (in the above case, an `a` element)

## Commands & Methods

Harvestr is based on Cheerio, which borrows from jQuery and JSDOM. Many of the same jQuery methods are supported, including the following which are useful for scraping:

*	attr(name)
*	find(selector)
*	parent()
*	next()
*	prev()
*	siblings()
*	children(selector)
*	first()
*	last()

There's also ways to invoke some of these methods in your selectors. Ie: `#uniqueDiv p:first` selects the first child paragraph in our div. Others include `:last`, `:even`, `:odd` and `:parent`. See [cheerio-soupselect](https://github.com/MatthewMueller/cheerio-soupselect) for more info.

There are some reserved commands used by Harvestr in your JSON schema object. They are:

### Exec

The *exec* command applies a method to your selector object before running additional queries. For example:

	{	"div" : {
			"exec" : "siblings()",
			"each" : "html()"
		}

This is equivalent to writing the following:

	$('div').siblings().each(function(i,sib) {
		console.log(sib.html());
	});
		
### Each

The *each* command permits you to iterate over the result of a query, as shown above. Below, we use a nested each loop.

	{	"table#stuff tbody tr" : {
			"each" : {
				"td" : {
					"each" : "text()"
				}
			}
		}

This is equivalent to writing the following:

	$('table#stuff tbody tr').each(function(i,tr) {
		$(tr).each(function(n,td) {
			console.log($(td).text());
		});
	});
		
### Once

Similar to the *each* command, *once* applies a method, function, or nested object once. The result object would be formatted as an object as opposed to an array as is the case for *each* results.

# Object Schema

Harvestr is based on 'mapping' a web page for scraping with a JSON object. The basic structure is to start with 1 or more selectors as the top-level keys, and have any combination of methods, functions, or nested objects as values.

## Guidelines

*	The top-level keys of the JSON objects can only be selectors. these are the parent elements of your query.
*	Selectors must always appear as object keys.
*	Methods, properties, and custom functions must always appear as object values.
*	Methods and properties must be represented as a string.
*	The `exec` reserved command is performed before any other keys in that object so that the result of the method applied can be used by those selectors / iterators (like `each` and `once`). The `exec` value must be either a method or function that produces one or more node elements that can be operated on.
*	`each` or `once` keys that should not have objects for values with keys that are also `each` or `once`. That is redundant.

## Meta Information

When saving your JSON to a file for command line use or loading in your node app, meta information should be included. This is done by nesting the schema object itself, as follows:

	{ "harvestr:meta" : {
			"output" : {
				"filename" 	: "output.csv",
			},
			"target" : [
				"http://awebsite.here",
				"http://doesNotHaveToBeAn.Array",
				"http://canBeASingleUrlString.Value"
			]
		},
	  
	  "harvestr:schema" : {
			"div#content" : {
				"exec" 		: "children()",
				"once" 		: "attr('title')"
				"h1#title" 	: "text()"
				"each" 		: {
					"div" : {
						"a" : {
							"each" : "text()"
						}
					}
				}
			}
		}
	}

# API

## harvestr.get(url,schema,finish)

*String __url__, JSON object __schema__, function/object literal __finish__*

*get* is the primary workhorse for harvestr. Pass it a single URL string and JSON schema object along with a callback for completion. All arguments are mandatory. The `finish` callback can be either a function or an object literal. If it's a function, it will return a single object for the scrape result. If it's an object, you can specify file output parameters:

	{ 	path 	: 'outputfile.json',
		options	: {
			flags 		: 'w',
			encoding	: null,
			mode		: 0666
		}
	}
	
Only the `path` attribute is required if you provide an object. The `options` attribute corresponds to that for `createWriteStream` in [Node's `fs` module](http://nodejs.org/docs/latest/api/fs.html#fs_fs_createwritestream_path_options).

## harvestr.getBatch(urls,schema,finish,timeout)

*Array __urls__, JSON object __schema__, function/object literal __finish__, Number __timeout_ (optional)*

*getBatch* is a convenience method for invoking a number of requests. It is designed to be concurrent so as to avoid bombarding the target url with requests. You may also use the provided `timeout` option to provide a buffer time between requests. `Timeout` is in milliseconds.

## harvestr.config(options}

*Object literal __options__*

The following options can be set:

*	`debug` : Number indicating log level. 0 for no console logging, 1 for errors, 2 for warnings and errors, 3 for info, warnings and errors, 4 for all of the above plus debug messages.
*	`encoding` : Sets the default encoding for file read / writes. This can also be set in saved object schema meta info.

# Dependencies & Thanks 

*	[Cheerio][dep1]
*	[Request][dep2]
*	[Async][dep3]
*	[Node.JS][dep4]

[dep1]: https://github.com/MatthewMueller/cheerio
[dep2]:	https://github.com/mikeal/request
[dep3]:	https://github.com/caolan/async
[dep4]:	http://nodejs.org

# Don't Be Evil

Web scraping or otherwise harvesting data this way can be a helpful tool for research or data mining. It can also be harmful to the source sites if implemented poorly. By design, Harvestr's batch method does not support concurrent requests. The batch method also has a timeout option between requests that I encourage you to use, as a courtesy to the site you're using.

There can be, of course, legal issues with obtaining data from sites by these means as well. Many sites expressly prohibit this in their Terms of Use/Service. I am in no way responsible for the way you choose to use this code. 

# Who

Wes Johnson. Find me on [Twitter](http://twitter.com/SterlingWes "@SterlingWes"), [LinkedIn](http://ca.linkedin.com/in/sterlingwes), [StackOverflow](http://stackoverflow.com/users/986611/wes-johnson), and [here](http://wesquire.ca "My Website").

# License

(The MIT License)

Copyright (c) 2012 Wes Johnson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.