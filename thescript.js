const fs = require('fs');
const cheerio = require('cheerio');
const glob = require('glob');
//const htmlparser2 = require('htmlparser2');

//const data = fs.readFileSync("/home/aaron/development/aaron/learnrussian.rt.com/index.html", "utf8");

const work = "/home/aaron/development/aaron/learnrussian.rt.com/"
const local = "./"
const root = local
const allhtml = root + "**/*.html";
const indexhtml = root + "index.html";

glob(indexhtml, null, (er, files) => {
    //console.log({er});
    //console.log({files});
    files.forEach(file => {
        console.log({file})
        const data = fs.readFileSync(file, "utf8");
        //const data2 = data.substring(data.indexOf("\n") + 1)
        //const data3 = data2.substring(data2.indexOf("\n") + 1)
        //console.log({data3});
        const $ = cheerio.load(data); //, { decodeEntities: true});// , null, false);
	$('#footer').remove();
        fs.writeFileSync(file, $.html());
    });
})


return;
//console.log({data})

//const dom = htmlparser2.parseDOM(data) //, options);

//$('#footer').remove();
//console.log($.html())
console.log(cheerio.text($('body')))
