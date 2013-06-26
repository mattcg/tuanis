/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var querystring = require('querystring');
var hammer = require('hammerjs');
var translate = require('css3-translate');
var topo = require('costa-rica-topo');

var Map = require('./Map');

var map, svg, loadForm, selectForm, entries, id, title, codeField, statField;

// Generic listener to cancel form submit.
document.addEventListener('submit', function(event) {
	event.preventDefault();
	return false;
}, false);

require('domready')(function() {
	loadForm = document.getElementById('load-controls');
	loadForm.addEventListener('submit', function(event) {
		loadSpreadsheet(loadForm.src.value);
	}, false);

	selectForm = document.getElementById('select-controls');
	selectForm.addEventListener('submit', function(event) {
		codeField = selectForm.code.value;
		statField = selectForm.stat.value;
		drawMap();
	}, false);

	svg = document.getElementById('map');

	mapFromUrl();
	registerInteractions(svg);
});

function clearMap() {
	map = codeField = statField = null;
	svg.innerHTML = '';
}

function drawMap() {
	var stats = {};

	if (!codeField || !statField) {
		return;
	}

	if (!map) {
		map = new Map(svg);
		map.draw(topo);
	}

	entries.forEach(function(entry) {
		var code = entry['gsx$' + codeField].$t;

		stats[code] = entry['gsx$' + statField].$t;
	});

	map.stats(stats);
}

function loadSpreadsheet(src) {
	var match, xhr;

	disableInputs();
	clearFieldSelects();
	clearMap();

	match = (/key=([A-Za-z0-9\-_]+)/).exec(src);
	if (!match || !match[1]) {
		return displayError('Please enter a valid Google Spreadsheets URL.');
	}

	id = match[1];
	xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://spreadsheets.google.com/feeds/list/' + id + '/od6/public/values?alt=json');
	xhr.addEventListener('load', function() {
		if (xhr.status !== 200) {
			return displayError('Unable to fetch the spreadsheet. Have you published it to the Web yet?');
		}

		if (parseSpreadsheet(xhr.responseText)) {
			changeUrl(true);
		}
	}, false);
	xhr.addEventListener('error', function() {
		displayError('Unable to fetch the spreadsheet. Are you connected to the Internet?');
	}, false);
	xhr.send();
}

function parseSpreadsheet(json) {
	var feed, fields = [];

	try {
		feed = JSON.parse(json).feed;
	} catch (err) {
		return displayError('Error while parsing data from Google Spreadsheets.');
	}

	entries = feed.entry;
	title = feed.title.$t;

	if (entries.length < 2) {
		return displayError('That spreadsheet seems to be empty.');
	}

	Object.keys(entries[0]).forEach(function(key) {
		if (key.substr(0, 4) === 'gsx$') {
			fields.push(key.substr(4));
		}
	});

	displayFieldSelects(fields);
	enableInputs();

	return true;
}

function changeUrl(idOnly) {
	var query = '?';

	if (!history.pushState) {
		return;
	}

	query += 'd=' + encodeURIComponent(id);
	query += '&p=g'; // Provider = Google (default)
	if (!idOnly) {
		query += '&c=' + encodeURIComponent(selectForm.code.value || '');
		query += '&s=' + encodeURIComponent(selectForm.stat.value || '');
	}

	history.pushState(null, title || 'Untitled', query);
}

function mapFromUrl() {
	var params;

	params = querystring.parse(location.search.substr(1));
	if (params.d) {
		// TODO: load spreadsheet.
	}
}

function displayFieldSelects(fields) {
	var i, l, field, option;

	clearFieldSelects();

	for (i = 0, l = fields.length; i < l; i++) {
		field = fields[i];
		option = document.createElement('option');
		option.setAttribute('value', field);
		option.textContent = field;
		selectForm.code.appendChild(option);
		selectForm.stat.appendChild(option.cloneNode(true));
	}

	selectForm.code.selectedIndex = 0;
	selectForm.stat.selectedIndex = 1;
}

function clearFieldSelects() {
	selectForm.code.innerHTML = '';
	selectForm.stat.innerHTML = '';
}

function enableInputs() {
	loadForm.load.removeAttribute('disabled');
	selectForm.show.removeAttribute('disabled');
	selectForm.code.removeAttribute('disabled');
	selectForm.stat.removeAttribute('disabled');
}

function disableInputs() {
	loadForm.load.setAttribute('disabled', '');
	selectForm.show.setAttribute('disabled', '');
	selectForm.code.setAttribute('disabled', '');
	selectForm.stat.setAttribute('disabled', '');
}

function displayError(msg) {
	alert(msg);
	enableInputs();
	return false;
}

function registerInteractions(svg) {
	var scaled = false, translateRule = translate.rule();

	var scaleIn = function() {
		svg.style[translateRule] = 'scale(2, 2)';
		scaled = true;
	};

	var scaleOut = function() {
		svg.style[translateRule] = 'scale(1, 1)';
		scaled = false;
	};

	// Add hammer gestures.
	hammer(svg.parentNode).on('pinchin ', scaleIn).on('pinchout', scaleOut).on('doubletap', function() {
		if (scaled) {
			scaleOut();
		} else {
			scaleIn();
		}
	});
}

function registerResize(map, cb) {
	var debounceTimeout = null;

	// Remake the map on resize.
	window.addEventListener('resize', function() {
		if (debounceTimeout !== null) {
			clearTimeout(debounceTimeout);
		}

		debounceTimeout = window.setTimeout(function() {
			debounceTimeout = null;
			map.draw();
		}, 200);
	}, false);
}
