/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var chroma = require('chroma-js');

var Controls = require('./controls/Controls');
var map = require('./map');
var sheet = require('./sheet');
var state = require('./state');
var controls;

function colors(form) {
	Array.prototype.forEach.call(form.brewer, function(input) {
		var container = document.createElement('div');

		container.className = 'brewer';

		chroma.brewer[input.value].forEach(function(color) {
			var swatch = document.createElement('div');

			swatch.style.backgroundColor = color;
			swatch.className = 'swatch';
			container.appendChild(swatch);
		});

		input.parentNode.appendChild(container);
	});
}

function popstate(event) {
	var params, update;

	if (event && !event.state) {
		return;
	}

	// Load state form URL.
	params = state.params();

	// Update the form controls with values from URL.
	controls.scale(params);
	if (params.id) {
		controls.source(sheet.url(params.id));
	} else {
		controls.source('');
	}

	// Load the ID in the URL if available.
	if (!params.id) {
		return;
	}

	update = function(sheet) {
		var stats;

		controls.sheet(sheet);
		controls.enable();
		controls.selects(sheet.fields());
		controls.code(params.code);
		controls.stat(params.stat);

		stats = sheet.stats(controls.code(), controls.stat());
		map.update(stats, params);
	};

	// Don't load the sheet again if already held in memory.
	if (controls.sheet() && controls.sheet().id() === params.id) {
		return update(controls.sheet());
	}

	controls.disable();
	sheet.load(params.id, function(err, sheet) {
		if (err) {
			return alert(err.toString());
		}

		update(sheet);
	});
}

// Generic listener to cancel form submit.
document.addEventListener('submit', function(event) {
	event.preventDefault();
	return false;
}, false);

require('domready')(function() {
	var srcForm, optForm, scaleForm;

	// Only show the controls if not embedding.
	if (state.controls()) {
		document.body.className = 'controls';
	}

	srcForm = document.getElementById('load-controls');
	optForm = document.getElementById('select-controls');

	scaleForm = document.getElementById('scale-controls');
	colors(scaleForm);

	controls = new Controls(srcForm, optForm, scaleForm);

	srcForm.addEventListener('submit', function(event) {
		controls.disable();

		sheet.load(controls.source(), function(err, sheet) {
			if (err) {
				return alert(err.toString());
			}

			controls.sheet(sheet);
			controls.enable();
			controls.selects(sheet.fields());

			// Clear the map update the URL.
			map.clear();
			state.update(sheet.id(), sheet.title(), controls);
		});
	}, false);

	optForm.addEventListener('submit', function(event) {
		var sheet = controls.sheet(), stats;

		stats = sheet.stats(controls.code(), controls.stat());
		map.update(stats, controls.scale());
		state.update(controls);
	}, false);

	scaleForm.addEventListener('change', function(event) {
		map.scale(controls.scale());
		state.update(controls);
	}, false);

	window.addEventListener('popstate', popstate, false);
	popstate();
});


