/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var d3 = require('d3');
var topojson = require('topojson');

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

Map.prototype.stats = function(stats, scale) {
	var self = this;

	if (arguments.length < 1) {
		return this.data.stats;
	}

	if (!scale) {
		scale = this.scale(stats);
	}

	this.data.stats = stats;

	d3.select(this.svg)
		.selectAll('.canton').style('fill', function(d) {
			return self.fill(d.properties.code, scale);
		});
};

Map.prototype.fill = function(code, scale) {
	var stat = parseInt(this.data.stats[code], 10);

	// Apply the 'stripe' filter to the path if no data is available.
	if (isNaN(stat)) {
		return 'url(#stripe)';
	}

	return scale(stat);
};

Map.prototype.scale = function(data, colors) {
	var values;

	values = Object.keys(data).reduce(function(p, c, i, a) {
		var stat = parseInt(data[c], 10);

		if (!isNaN(stat)) {
			p.push(stat);
		}

		return p;
	}, []);

	if (!colors) {
		colors = ['#D3C2B0', '#FF9D2E', '#F15A24', '#ED1C23', '#42210A'];
	}

	return d3.scale.quantile()
		.domain(values)
		.range(colors);
};

Map.prototype.dimensions = function(dimensions) {
	var w, h, svg = this.svg;

	if (!dimensions) {
		dimensions = [];
	}

	w = dimensions[0] || svg.clientWidth;
	h = dimensions[1] || svg.clientHeight;

	return [w, h];
};

Map.prototype.projection = function(dimensions) {
	var w, h, n;

	if (!dimensions) {
		dimensions = this.dimensions();
	}

	w = dimensions[0];
	h = dimensions[1];
	if (w > h) {
		n = h;
	} else {
		n = w;
	}

	return d3.geo.mercator()
		.scale(n * 16.667)
		.translate([n * 25, n * 3.294]);
};

Map.prototype.draw = function(topo) {
	var d3Svg, d3Path, self = this, svg = this.svg;

	// Clear existing DOM.
	svg.innerHTML = '';

	d3Svg = d3.select(svg);

	// Add an SVG pattern for cantons with null data.
	// http://commons.oreilly.com/wiki/index.php/SVG_Essentials/Patterns_and_Gradients
	d3Svg.append('defs')
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

	d3Path = d3.geo.path()
		.projection(this.projection());

	d3Svg.append('g').selectAll('path')
		.data(topojson.feature(topo, topo.objects['costa-rica-geo']).features)
		.enter().append('path')
		.attr('d', d3Path)
		.attr('class', 'canton')
		.on('click', function(d) {
			self.tip(d.properties);
		});
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
