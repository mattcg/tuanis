/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var Sheet = require('./sheet/Sheet');

exports.url = function(id) {
	return 'https://docs.google.com/spreadsheet/ccc?key=' + id;
};

exports.load = function(src, cb) {
	var match, id, xhr;

	if ((/^[A-Za-z0-9\-_]+$/).test(src)) {
		id = src;
	} else {
		match = (/key=([A-Za-z0-9\-_]+)/).exec(src);
		if (!match || !match[1]) {
			return cb(new Error('Please enter a valid Google Spreadsheets URL.'));
		}

		id = match[1];
	}

	xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://spreadsheets.google.com/feeds/list/' + id + '/od6/public/values?alt=json');

	xhr.addEventListener('load', function() {
		if (xhr.status !== 200) {
			return cb(new Error('Unable to fetch the spreadsheet. Have you published it to the Web yet?'));
		}

		parse(id, xhr.responseText, cb);
	}, false);

	xhr.addEventListener('error', function() {
		return cb(new Error('Unable to fetch the spreadsheet. Are you connected to the Internet?'));
	}, false);

	xhr.send();
};

function parse(id, json, cb) {
	var feed, rows = [];

	try {
		feed = JSON.parse(json).feed;
	} catch (err) {
		return cb(new Error('Error while parsing data from Google Spreadsheets.'));
	}

	if (!feed.entry || feed.entry.length < 1) {
		return cb(new Error('That spreadsheet seems to be empty.'));
	}

	feed.entry.forEach(function(entry) {
		var row = {};

		rows.push(row);
		Object.keys(entry).forEach(function(key) {
			if ('gsx$' === key.substr(0, 4)) {
				row[key.substr(4)] = entry[key].$t;
			}
		});
	});

	cb(null, new Sheet({
		id: id,
		rows: rows,
		title: feed.title.$t
	}));
}
