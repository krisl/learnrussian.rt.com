const fs = require('fs');
const cheerio = require('cheerio');
const glob = require('glob');
//const htmlparser2 = require('htmlparser2');

//const data = fs.readFileSync("/home/aaron/development/aaron/learnrussian.rt.com/index.html", "utf8");
function wrapInFrontMatter(newItems) {
	return ["---", ...newItems, "---"].join('\n') + '\n'
}

function fixlink(link) {
	if (link.includes("{{") || link.includes("{%")) return link;
	if (link.startsWith("#")) return link;
	if (link.startsWith("http://")) return link;
	if (link.startsWith("https://")) return link;
	if (['.jpg', '.png', '.gif', '.pdf', '.mp3', '.ogg'].some(ext => link.endsWith(ext))) {
		return "{{site.mediaurl}}" + link
	}
	return `{{ '${link}' | relative_url }}`
}

const work = "/home/aaron/development/aaron/learnrussian.rt.com/"
const local = "./"
const root = local
const allhtml = root + "**/*.html";
const indexhtml = root + "index.html";
const sample = root + "lessons/possessive-pronouns-questions/index.html"
const markFm = "---\n";
glob(allhtml, null, (er, files) => {
    //console.log({er});
    //console.log({files});
    files.forEach(file => {
	    if (file.split("/").some(dir => ["_site", "_includes", "_layouts"].includes(dir))) return;
        console.log({file})

        const data = fs.readFileSync(file, "utf8");
        const openFmPos = data.indexOf(markFm)
        const closFmPos = data.indexOf(markFm, openFmPos + markFm.length)
	const frontMatt = data.substring(openFmPos, closFmPos + markFm.length);
        const htmlText = data.substring(openFmPos + frontMatt.length)
        console.log({frontMatt});
	    //console.log({htmlText});
        const $ = cheerio.load(htmlText, null, false) //, {frontMatter: true}, false); //, { decodeEntities: true});// , null, false);
	    //$('#footer').remove();
	    //const desc = $('meta[name="description"]').attr('content');
	    //const keys = $('meta[name="keywords"]').attr('content');
	    //const titl = $('title').text().trim();
	    //    console.log({desc, keys})
	    //const newFm = wrapInFrontMatter([
	    //	desc && ('description: "' + desc.replace(/"/g, '&quot;') + '"'),
	    //	keys && ('keywords: "' + keys.replace(/"/g, '&quot;') + '"'),
	    //	titl && ('title: "' + titl.replace(/"/g, '&quot;') + '"')
	    //].filter(Boolean));

	    //    console.log({newFm})
	    //$('.soc_links').remove();
	    //$('.maintenance .clesson').replaceWith('{% include llesson.html %}\n');
	    //console.log($('head').text());
	    //return
	    //console.log($.html())
	    $('[href]').each((x, i) => $(i).attr('href', fixlink($(i).attr('href'))));
	    $('[src]').each((x, i) => $(i).attr('src', fixlink($(i).attr('src'))));
	    $('[audio]').each((x, i) => $(i).attr('audio', fixlink($(i).attr('audio'))));
        fs.writeFileSync(file, frontMatt + $.html());
    });
})


return;
//console.log({data})

//const dom = htmlparser2.parseDOM(data) //, options);

//$('#footer').remove();
//console.log($.html())
console.log(cheerio.text($('body')))
