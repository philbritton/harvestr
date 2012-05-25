/*
 * This example worked at the time it was created.
 * Websites may change their formatting so that this doesn't work, at any time.
 * Please register an issue if you are unable to get this example to work.
 */

var Harvestr = require('../harvestr').start;

Harvestr.get('http://en.wikipedia.org/wiki/Main_Page',{"#articlecount a:first":"text()"},
	{ path: './basic_example.txt' });
	
/*

RESULT FORMAT

{
	"#articlecount a:first": {
		"text()": "3,961,191"
	}
}

HTML FORMAT

<div id="articlecount" style="font-size:85%;"><a href="/wiki/Special:Statistics" title="Special:Statistics">3,961,191</a> articles in <a href="/wiki/English_language" title="English language">English</a></div>

*/

/*

// the following is equivalent to the prior:

Harvestr.get('http://en.wikipedia.org/wiki/Main_Page',
	{ "#articlecount a" : 
		{ 
			"exec" : "first()",
			"once" : "text()"
		}
	}, 
	function(result) {
		console.log(result);
	});
	
*/