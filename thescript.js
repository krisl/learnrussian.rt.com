const fs = require('fs');
const cheerio = require('cheerio');
const glob = require('glob');
//const htmlparser2 = require('htmlparser2');

//const data = fs.readFileSync("/home/aaron/development/aaron/learnrussian.rt.com/index.html", "utf8");
function wrapInFrontMatter(newItems) {
	return ["---", ...newItems, "---"].join('\n') + '\n'
}

const work = "/home/aaron/development/aaron/learnrussian.rt.com/"
const local = "./"
const root = local
const allhtml = root + "**/*.html";
const indexhtml = root + "index.html";
const markFm = "---\n";
glob(indexhtml, null, (er, files) => {
    //console.log({er});
    //console.log({files});
    files.forEach(file => {
        console.log({file})
        const data = fs.readFileSync(file, "utf8");
        const openFmPos = data.indexOf(markFm)
        const closFmPos = data.indexOf(markFm, openFmPos + markFm.length)
	const frontMatt = data.substring(openFmPos, closFmPos + markFm.length);
        const htmlText = data.substring(openFmPos + frontMatt.length +1)
        console.log({frontMatt});
	    //console.log({htmlText});
        const $ = cheerio.load(htmlText) //, {frontMatter: true}, false); //, { decodeEntities: true});// , null, false);
	    //$('#footer').remove();
	const desc = $('meta[name="description"]').attr('content');
	const keys = $('meta[name="keywords"]').attr('content');
	const titl = $('title').text().trim();
	    console.log({desc, keys})
	const newFm = wrapInFrontMatter([
		"description: " + desc,
		"keywords: " + keys,
		"title: " + titl
	]);
	    console.log({newFm})
	$('#head').replaceWith('{% include head.html %}');
        fs.writeFileSync(file, newFm + $.html());
    });
})


return;
//console.log({data})

//const dom = htmlparser2.parseDOM(data) //, options);

//$('#footer').remove();
//console.log($.html())
console.log(cheerio.text($('body')))
