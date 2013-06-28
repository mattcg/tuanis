/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var mappings = require('../../json/gadm-mappings.json');
var chroma = require('chroma-js');

module.exports = Map;

function Map(svg) {
	this.svg = svg;
	this.data = {
		surrogates: {},
		stats: null,
		meta: null
	};
}

Map.prototype.meta = function(meta) {
	this.data.meta = meta;
};

Map.prototype.stats = function(stats) {
	var code, stat, surrogate, surrogates;

	if (arguments.length < 1) {
		return this.data.stats;
	}

	this.data.stats = stats;

	// Apply some heuristics to check whether the stats contain qualitative data as strings.
	// In that case, use surrogate IDs.
	for (code in stats) {
		if (stats.hasOwnProperty(code)) {
			stat = this.stat(code);

			if ('string' === typeof stat) {
				surrogate = 1;
				break;
			}
		}
	}

	if (!surrogate) {
		this.data.surrogates = {};
		return;
	}

	surrogates = {};
	for (code in stats) {
		if (stats.hasOwnProperty(code)) {
			stat = this.stat(code);
			if (null === stat) {
				continue;
			}

			if (surrogates.hasOwnProperty(stat)) {
				surrogate = surrogates[stat];
			} else {
				surrogate++;
				surrogates[stat] = surrogate;
			}

			this.data.surrogates[code] = surrogate;
		}
	}
};

Map.prototype.clear = function() {
	var i, l, paths;

	Map.call(this, this.svg);

	paths = this.svg.querySelectorAll('#cantons > path');
	for (i = 0, l = paths.length; i < l; i++) {
		paths[i].style.fill = this.fill();
	}
};

Map.prototype.code = function(id) {
	return mappings[id];
};

Map.prototype.stat = function(code) {
	var stat, num;

	if (this.data.surrogates[code]) {
		return this.data.surrogates[code];
	}

	stat = this.data.stats[code];

	if (null === stat || undefined === stat || '' === stat) {
		return null;
	}

	// The comparison `String(num) === stat` could be used here instead, but then we'd need lots of exceptions for percentage and currency-formatted values like '23%' or '$100'.
	num = parseFloat(stat, 10);
	if (!isNaN(num)) {
		return num;
	}

	return stat;
};

Map.prototype.fill = function(id, scale) {
	var stat, code, stripe = 'url(#stripe)';

	if (!scale || arguments.length < 1) {
		return stripe;
	}

	code = this.code(id);
	stat = this.stat(code);

	// Apply the 'stripe' filter to the path if no data is available.
	if (null === stat) {
		return stripe;
	}

	return scale(stat).hex();
};

Map.prototype.scale = function(brewer, stops, type) {
	var values, scale, paths, i, l, stats = this.data.stats, self = this;

	values = Object.keys(stats).reduce(function(p, c, i, a) {
		var stat = self.stat(c);

		if (null !== stat) {
			p.push(stat);
		}

		return p;
	}, []);

	scale = chroma.scale(brewer);
	if ('linear' !== type) {
		scale.domain(values, stops, type);
	} else {
		scale.domain(values, stops);
	}

	paths = this.svg.querySelectorAll('#cantons > path');
	for (i = 0, l = paths.length; i < l; i++) {
		paths[i].style.fill = this.fill(paths[i].id, scale);
	}
};

Map.prototype.defs = function() {
	var svg = this.svg, pattern, defs, path, svgNs, svgDoc;

	svgNs = 'http://www.w3.org/2000/svg';
	svgDoc = svg.ownerDocument;

	// Add an SVG pattern for cantons with null data.
	// http://commons.oreilly.com/wiki/index.php/SVG_Essentials/Patterns_and_Gradients
	if (svg.getElementById('stripe')) {
		return;
	}

	defs = svgDoc.getElementsByTagName('defs')[0];
	if (!defs) {
		defs = svgDoc.createElementNS(svgNs, 'defs');
		svg.appendChild(defs);
	}

	pattern = defs.appendChild(svgDoc.createElementNS(svgNs, 'pattern'));
	pattern.id = 'stripe';
	pattern.setAttribute('patternUnits', 'userSpaceOnUse');
	pattern.setAttribute('x', '0');
	pattern.setAttribute('y', '0');
	pattern.setAttribute('width', '4');
	pattern.setAttribute('height', '6');

	path = pattern.appendChild(svgDoc.createElementNS(svgNs, 'path'));
	path.setAttribute('d', 'M 0 0 4 0');
	path.style.stroke = '#ccc';
	path.style.fill = 'none';
};

Map.prototype.legend = function(scale) {
	var legendEl, colors;

	legendEl = document.createElement('ul');

	// Dynamically build the map legend from the D3 scale domain and range values.
	colors = scale.domain().reduce(function(colors, value) {
		var color = scale(value);

		if (colors[color]) {
			colors[color].push(value);
		} else {
			colors[color] = [value];
		}

		return colors;
	}, {});

	Object.keys(colors).forEach(function(color) {
		var colorEl, minVal, maxVal, values = colors[color];

		minVal = values[0];
		maxVal = values[values.length - 1];

		colorEl = document.createElement('li');
		colorEl.style.borderLeftColor = color;
		if (minVal === maxVal) {
			colorEl.textContent = minVal;
		} else {
			colorEl.textContent = minVal + ' - ' + maxVal;
		}

		legendEl.appendChild(colorEl);
	});

	return legendEl;
};
