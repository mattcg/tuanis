/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var hammer = require('hammerjs');
var translate = require('css3-translate');
var topo = require('costa-rica-topo');

var Map = require('./lib/Map');

var map, svg, form, entries, codeField, statField;

require('domready')(function() {
	form = document.getElementById('data-input');
	form.addEventListener('submit', function(event) {
		event.preventDefault();
		loadSpreadsheet(form.src.value);
	}, false);

	form.code.addEventListener('change', function() {
		codeField = this.value;
		drawMap();
	}, false);

	form.stat.addEventListener('change', function() {
		statField = this.value;
		drawMap();
	}, false);

	svg = document.getElementById('map');
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
		var code = entry['gsx$' + codeField];

		stats[code] = entry['gsx$' + statField];
	});

	map.stats(stats);
}

function loadSpreadsheet(src) {
	var id, match, xhr;

	disableInputs();
	clearFieldSelects();
	clearMap();

	match = (/key=([A-Za-z0-9\-]+)/).exec(src);
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

		parseSpreadsheet(xhr.responseText);
	}, false);
	xhr.addEventListener('error', function() {
		displayError('Unable to fetch the spreadsheet. Are you connected to the Internet?');
	}, false);
	xhr.send();
}

function parseSpreadsheet(json) {
	var fields = [];

	try {
		entries = JSON.parse(json).feed.entry;
	} catch (err) {
		return displayError('Error while parsing data from Google Spreadsheets.');
	}

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
}

function displayFieldSelects(fields) {
	var i, l, field, option;

	clearFieldSelects();

	for (i = 0, l = fields.length; i < l; i++) {
		field = fields[i];
		option = document.createElement('option');
		option.setAttribute('value', field);
		form.code.appendChild(option);
		form.stat.appendChild(option.cloneNode());
	}
}

function clearFieldSelects() {
	form.code.innerHTML = '<option value="">';
	form.stat.innerHTML = '<option value="">';
}

function enableInputs() {
	form.src.removeAttribute('disabled');
	form.load.removeAttribute('disabled');
	form.code.removeAttribute('disabled');
	form.stat.removeAttribute('disabled');
}

function disableInputs() {
	form.src.setAttribute('disabled', '');
	form.load.setAttribute('disabled', '');
	form.code.setAttribute('disabled', '');
	form.stat.setAttribute('disabled', '');
}

function displayError(msg) {
	alert(msg);
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
