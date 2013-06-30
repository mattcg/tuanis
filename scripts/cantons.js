/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var jsdom = require('jsdom');
var fs = require('fs');
var http = require('http');
var Iconv = require('iconv').Iconv;

get(function(err, buffer) {
	parse(buffer, function(err, cantons) {
		write(cantons);
	});
});

function get(cb) {
	http.get('http://www.statoids.com/ycr.html', function(res) {
		var buffer = new Buffer(0);

		res.on('data', function(chunk) {
			buffer = Buffer.concat([buffer, chunk]);
		});

		res.on('end', function() {
			cb(null, buffer);
		});
	});
}

function parse(buffer, cb) {
	var html, iconv;

	iconv = new Iconv('latin1', 'utf-8');
	html = iconv.convert(buffer).toString('utf8');

	jsdom.env(html, function(err, window) {
		var i, l, row, rows, cantons = {}, document = window.document;
	
		rows = document.querySelectorAll('table.st > tr.o, table.st > tr.e');
		for (i = 0, l = rows.length; i < l; i++) {
			row = rows[i];
	
			cantons[row.children[2].textContent.substr(0, 3)] = row.children[0].textContent;
		}

		cb(null, cantons);	
	});
}

function write(cantons) {
	fs.writeFileSync(__dirname + '/../lib/json/cantons.json', JSON.stringify(cantons, null, '\t') + '\n');
}
