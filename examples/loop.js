/*
 * This example worked at the time it was created.
 * Websites may change their formatting so that this doesn't work, at any time.
 * Please register an issue if you are unable to get this example to work.
 */

var Harvestr = require('../harvestr').start;

// returns list of wikipedia languages
// iterates over each list item in the UL
// and grabs the hyperlink text in each list item

Harvestr.get('http://en.wikipedia.org/wiki/Main_Page',
	{ 
		"#p-lang li" : {
			"each" : {
				"a" : "text()"
			}
		}
	},
	{
		path: './loop_example.txt'
	});
	
/*

RESULT FORMAT

{
	"#p-lang li": {
		"each": {
			"a": {
				"text()": [
					"Simple English",
					"???????",
					"Bahasa Indonesia",
					"Bahasa Melayu",
					"?????????",
					"Catal�",
					"Cesky",
					"Dansk",
					"Deutsch",
					"Eesti",
					"????????",
					"Espa�ol",
					"Esperanto",
					"Euskara",
					"?????",
					"Fran�ais",
					"Galego",
					"???",
					"?????",
					"Hrvatski",
					"Italiano",
					"Lietuviu",
					"Magyar",
					"Nederlands",
					"???",
					"?Norsk (bokm�l)?",
					"?Norsk (nynorsk)?",
					"Polski",
					"Portugu�s",
					"Rom�na",
					"???????",
					"Slovencina",
					"Sloven�cina",
					"?????? / Srpski",
					"Srpskohrvatski / ??????????????",
					"Suomi",
					"Svenska",
					"???",
					"Ti?ng Vi?t",
					"T�rk�e",
					"??????????",
					"??"
				]
			}
		}
	}
}

HTML FORMAT

<div class="portal expanded" id="p-lang">
	<h5 tabindex="5">Languages</h5>
	<div class="body" style="display: block; ">
		<ul>
			<li class="interwiki-simple"><a href="//simple.wikipedia.org/wiki/" title="" lang="simple" hreflang="simple">Simple English</a></li>
			<li class="interwiki-ar"><a href="//ar.wikipedia.org/wiki/" title="" lang="ar" hreflang="ar">???????</a></li>
			<li class="interwiki-id"><a href="//id.wikipedia.org/wiki/" title="" lang="id" hreflang="id">Bahasa Indonesia</a></li>
			<li class="interwiki-ms"><a href="//ms.wikipedia.org/wiki/" title="" lang="ms" hreflang="ms">Bahasa Melayu</a></li>
			<li class="interwiki-bg"><a href="//bg.wikipedia.org/wiki/" title="" lang="bg" hreflang="bg">?????????</a></li>
			<li class="interwiki-ca"><a href="//ca.wikipedia.org/wiki/" title="" lang="ca" hreflang="ca">Catal�</a></li>
			<li class="interwiki-cs"><a href="//cs.wikipedia.org/wiki/" title="" lang="cs" hreflang="cs">Cesky</a></li>
			<li class="interwiki-da"><a href="//da.wikipedia.org/wiki/" title="" lang="da" hreflang="da">Dansk</a></li>
			<li class="interwiki-de"><a href="//de.wikipedia.org/wiki/" title="" lang="de" hreflang="de">Deutsch</a></li>
			<li class="interwiki-et"><a href="//et.wikipedia.org/wiki/" title="" lang="et" hreflang="et">Eesti</a></li>
			<li class="interwiki-el"><a href="//el.wikipedia.org/wiki/" title="" lang="el" hreflang="el">????????</a></li>
			<li class="interwiki-es"><a href="//es.wikipedia.org/wiki/" title="" lang="es" hreflang="es">Espa�ol</a></li>
			<li class="interwiki-eo"><a href="//eo.wikipedia.org/wiki/" title="" lang="eo" hreflang="eo">Esperanto</a></li>
			<li class="interwiki-eu"><a href="//eu.wikipedia.org/wiki/" title="" lang="eu" hreflang="eu">Euskara</a></li>
			<li class="interwiki-fa"><a href="//fa.wikipedia.org/wiki/" title="" lang="fa" hreflang="fa">?????</a></li>
			<li class="interwiki-fr"><a href="//fr.wikipedia.org/wiki/" title="" lang="fr" hreflang="fr">Fran�ais</a></li>
			<li class="interwiki-gl"><a href="//gl.wikipedia.org/wiki/" title="" lang="gl" hreflang="gl">Galego</a></li>
			<li class="interwiki-ko"><a href="//ko.wikipedia.org/wiki/" title="" lang="ko" hreflang="ko">???</a></li>
			<li class="interwiki-he"><a href="//he.wikipedia.org/wiki/" title="" lang="he" hreflang="he">?????</a></li>
			<li class="interwiki-hr"><a href="//hr.wikipedia.org/wiki/" title="" lang="hr" hreflang="hr">Hrvatski</a></li>
			<li class="interwiki-it"><a href="//it.wikipedia.org/wiki/" title="" lang="it" hreflang="it">Italiano</a></li>
			<li class="interwiki-lt"><a href="//lt.wikipedia.org/wiki/" title="" lang="lt" hreflang="lt">Lietuviu</a></li>
			<li class="interwiki-hu"><a href="//hu.wikipedia.org/wiki/" title="" lang="hu" hreflang="hu">Magyar</a></li>
			<li class="interwiki-nl"><a href="//nl.wikipedia.org/wiki/" title="" lang="nl" hreflang="nl">Nederlands</a></li>
			<li class="interwiki-ja"><a href="//ja.wikipedia.org/wiki/" title="" lang="ja" hreflang="ja">???</a></li>
			<li class="interwiki-no"><a href="//no.wikipedia.org/wiki/" title="" lang="no" hreflang="no">?Norsk (bokm�l)?</a></li>
			<li class="interwiki-nn"><a href="//nn.wikipedia.org/wiki/" title="" lang="nn" hreflang="nn">?Norsk (nynorsk)?</a></li>
			<li class="interwiki-pl"><a href="//pl.wikipedia.org/wiki/" title="" lang="pl" hreflang="pl">Polski</a></li>
			<li class="interwiki-pt"><a href="//pt.wikipedia.org/wiki/" title="" lang="pt" hreflang="pt">Portugu�s</a></li>
			<li class="interwiki-ro"><a href="//ro.wikipedia.org/wiki/" title="" lang="ro" hreflang="ro">Rom�na</a></li>
			<li class="interwiki-ru"><a href="//ru.wikipedia.org/wiki/" title="" lang="ru" hreflang="ru">???????</a></li>
			<li class="interwiki-sk"><a href="//sk.wikipedia.org/wiki/" title="" lang="sk" hreflang="sk">Slovencina</a></li>
			<li class="interwiki-sl"><a href="//sl.wikipedia.org/wiki/" title="" lang="sl" hreflang="sl">Sloven�cina</a></li>
			<li class="interwiki-sr"><a href="//sr.wikipedia.org/wiki/" title="" lang="sr" hreflang="sr">?????? / Srpski</a></li>
			<li class="interwiki-sh"><a href="//sh.wikipedia.org/wiki/" title="" lang="sh" hreflang="sh">Srpskohrvatski / ??????????????</a></li>
			<li class="interwiki-fi"><a href="//fi.wikipedia.org/wiki/" title="" lang="fi" hreflang="fi">Suomi</a></li>
			<li class="interwiki-sv"><a href="//sv.wikipedia.org/wiki/" title="" lang="sv" hreflang="sv">Svenska</a></li>
			<li class="interwiki-th"><a href="//th.wikipedia.org/wiki/" title="" lang="th" hreflang="th">???</a></li>
			<li class="interwiki-vi"><a href="//vi.wikipedia.org/wiki/" title="" lang="vi" hreflang="vi">Ti?ng Vi?t</a></li>
			<li class="interwiki-tr"><a href="//tr.wikipedia.org/wiki/" title="" lang="tr" hreflang="tr">T�rk�e</a></li>
			<li class="interwiki-uk"><a href="//uk.wikipedia.org/wiki/" title="" lang="uk" hreflang="uk">??????????</a></li>
			<li class="interwiki-zh"><a href="//zh.wikipedia.org/wiki/" title="" lang="zh" hreflang="zh">??</a></li>
		<li id="interwiki-completelist"><a href="//meta.wikimedia.org/wiki/List_of_Wikipedias" title="Complete list of Wikipedias">Complete list</a></li></ul>
	</div>
</div>

*/