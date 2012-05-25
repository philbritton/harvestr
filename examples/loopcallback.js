/*
 * This example worked at the time it was created.
 * Websites may change their formatting so that this doesn't work, at any time.
 * Please register an issue if you are unable to get this example to work.
 */

var Harvestr = require('../harvestr').start;

// returns list of wikipedia languages
// iterates over each list item in the UL
// and grabs the escaped hyperlink text in each list item

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
	{ path: './loopcallback_example.txt' });