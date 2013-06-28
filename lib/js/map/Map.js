/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var d3 = require('d3');
var mappings = require('../../json/gadm-mappings.json');
var chroma = require('chroma-js');

module.exports = Map;

function Map(svg) {
	this.svg = svg;
	this.data = {
		stats: null,
		meta: null
	};
}

Map.prototype.meta = function(meta) {
	this.data.meta = meta;
};

Map.prototype.stats = function(stats) {
	if (arguments.length < 1) {
		return this.data.stats;
	}

	this.data.stats = stats;
};

Map.prototype.clear = function() {
	this.data.stats = this.data.meta = null;

	d3.select(this.svg)
		.selectAll('#cantons > path').style('fill', this.fill());
};

Map.prototype.code = function(id) {
	return mappings[id];
};

Map.prototype.fill = function(id, scale) {
	var stat, code, stripe = 'url(#stripe)';

	if (!scale || arguments.length < 1) {
		return stripe;
	}

	code = this.code(id);
	stat = parseInt(this.data.stats[code], 10);

	// Apply the 'stripe' filter to the path if no data is available.
	if (isNaN(stat)) {
		return stripe;
	}

	return scale(stat).hex();
};

Map.prototype.scale = function(brewer, stops, type) {
	var values, scale, stats = this.data.stats, self = this;

	values = Object.keys(stats).reduce(function(p, c, i, a) {
		var stat = parseInt(stats[c], 10);

		if (!isNaN(stat)) {
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

	d3.select(this.svg)
		.selectAll('#cantons > path').style('fill', function() {
			return self.fill(this.id, scale);
		});
};

Map.prototype.defs = function() {
	var svg = this.svg;

	// Add an SVG pattern for cantons with null data.
	// http://commons.oreilly.com/wiki/index.php/SVG_Essentials/Patterns_and_Gradients
	if (!svg.getElementById('stripe')) {
		d3.select(svg).append('defs')
			.append('pattern')
			.attr('id', 'stripe')
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', 6)
			.attr('height', 2)
			.append('path')
			.attr('d', 'M 0 0 6 0')
			.style('stroke', '#D3C2B0')
			.style('fill', 'none');
	}
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