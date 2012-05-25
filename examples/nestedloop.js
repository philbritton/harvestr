/*
 * This example worked at the time it was created.
 * Websites may change their formatting so that this doesn't work, at any time.
 * Please register an issue if you are unable to get this example to work.
 */

var Harvestr 	= require('../harvestr').start;

// returns contents of first table 
// (list of emerging technologies for Agriculture)
// iterates over each row in the table, then each cell

Harvestr.get('http://en.wikipedia.org/wiki/List_of_emerging_technologies',
	{ 
		"#mw-content-text table:eq(2) tr" : {
			"each" : {
				"td" : {
					"each" : "text()"
				}
			}
		}
	},
	{
		path: './nestedloop_example.txt'
	});
	
/*

RESULT FORMAT

{
	"#mw-content-text table:eq(2) tr": {
		"each": {
			"td": {
				"each": [
					[],
					[
						"In vitro meat",
						"Research, non-profit organization New Harvest set up to promote development[2][3][4]",
						"Animal husbandry, livestock, poultry, fishing[4]",
						"Cruelty free, inexpensive and environmentally friendlier meat to consume[4]",
						null
					],
					[
						"Vertical farming",
						"Research and experiments[5][6]",
						"Industrial agriculture",
						"Crop and meat production",
						null
					]
				]
			}
		}
	}
}

HTML FORMAT:

<table class="wikitable sortable jquery-tablesorter">
<thead><tr>
<th class="headerSort" title="Sort ascending">Emerging technology</th>
<th class="headerSort" title="Sort ascending">Status</th>
<th class="headerSort" title="Sort ascending">Potentially marginalized technologies</th>
<th class="headerSort" title="Sort ascending">Potential applications</th>
<th class="headerSort" title="Sort ascending">Related articles</th>
</tr></thead><tbody>
<tr>
<td><a href="/wiki/In_vitro_meat" title="In vitro meat">In vitro meat</a></td>
<td>Research, non-profit organization <a href="/wiki/New_Harvest" title="New Harvest">New Harvest</a> set up to promote development<sup id="cite_ref-1" class="reference"><a href="#cite_note-1"><span>[</span>2<span>]</span></a></sup><sup id="cite_ref-2" class="reference"><a href="#cite_note-2"><span>[</span>3<span>]</span></a></sup><sup id="cite_ref-econ25212_3-0" class="reference"><a href="#cite_note-econ25212-3"><span>[</span>4<span>]</span></a></sup></td>
<td><a href="/wiki/Animal_husbandry" title="Animal husbandry">Animal husbandry</a>, <a href="/wiki/Livestock" title="Livestock">livestock</a>, <a href="/wiki/Poultry" title="Poultry">poultry</a>, <a href="/wiki/Fishing" title="Fishing">fishing</a><sup id="cite_ref-econ25212_3-1" class="reference"><a href="#cite_note-econ25212-3"><span>[</span>4<span>]</span></a></sup></td>
<td>Cruelty free, inexpensive and environmentally friendlier meat to consume<sup id="cite_ref-econ25212_3-2" class="reference"><a href="#cite_note-econ25212-3"><span>[</span>4<span>]</span></a></sup></td>
<td></td>
</tr>
<tr>
<td><a href="/wiki/Vertical_farming" title="Vertical farming">Vertical farming</a></td>
<td>Research and experiments<sup id="cite_ref-4" class="reference"><a href="#cite_note-4"><span>[</span>5<span>]</span></a></sup><sup id="cite_ref-5" class="reference"><a href="#cite_note-5"><span>[</span>6<span>]</span></a></sup></td>
<td><a href="/wiki/Industrial_agriculture" title="Industrial agriculture">Industrial agriculture</a></td>
<td>Crop and meat production</td>
<td></td>
</tr>
</tbody><tfoot></tfoot></table>

*/