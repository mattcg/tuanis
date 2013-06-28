/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var Controls = require('./controls/Controls');
var map = require('./map');
var sheet = require('./sheet');
var state = require('./state');
var controls;

// Generic listener to cancel form submit.
document.addEventListener('submit', function(event) {
	event.preventDefault();
	return false;
}, false);

require('domready')(function() {
	var srcForm, optForm, scaleForm;

	srcForm = document.getElementById('load-controls');
	optForm = document.getElementById('select-controls');
	scaleForm = document.getElementById('scale-controls');

	controls = new Controls(srcForm, optForm, scaleForm);

	srcForm.addEventListener('submit', function(event) {
		controls.disable();

		sheet.load(srcForm.src.value, function(err, sheet) {
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
	}, false);

	scaleForm.addEventListener('submit', function(event) {
		map.scale(controls.scale());
	}, false);
});


