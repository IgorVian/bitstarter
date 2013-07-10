#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.
Usa util e restler per poter esaminare url specificate a riga di comando.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2


 - https://github.com/danwrong/restler
 - http://stackoverflow.com/questions/4981891/node-js-equivalent-of-pythons-if-name-main
 - http://nodejs.org/docs/latest/api/util.html#util_util_format_format
*/

var util = require('util');
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var URL_HTMLFILE_DEFAULT="url_index.html";


//Verifica che il file indicato accanto a "-f" esista
//(ma se non indichi nulla, va in errore perché non trova il file di default index.html)
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

//se questo file js è utilizzato direttamente da Node.js
//"When a file is run directly from Node, require.main is set to its module."
if(require.main == module) {
    program
   .version('0.0.2')
	.option('-c, --checks <check_file>', 'Path to json file checks (e.g."-c checks.json")', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to html file (e.g."-f index.html")', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_link>', 'Link to examine (e.g."-u http://www.google.com")')
	.parse(process.argv);
    //var checkJson = checkHtmlFile(program.file, program.checks);

	//Se viene specificata una url, ne fa il download in un file di appoggio (URL_HTMLFILE_DEFAULT), quindi lo esamina
   if (program.url) {
		rest.get(program.url).on('complete', function(result) {
		if (result instanceof Error) {
			console.error('Error: ' + util.format(response.message));
		} else {
			fs.writeFileSync(URL_HTMLFILE_DEFAULT, result);
			var checkJson = checkHtmlFile(URL_HTMLFILE_DEFAULT, program.checks);
			var outJson = JSON.stringify(checkJson, null, 4);
			console.log(outJson);
			}
		});
	}	else {
		//Se non trova una url specificata, allora cerca un file html specificato con '-f'.
		//Se non trova nulla, allora controlla il file 'index.html' che si trova nella stessa cartella.
		var checkJson = checkHtmlFile(program.file, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	}

//altrimenti se questo file js è utilizzato come modulo
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
