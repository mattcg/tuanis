/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var mappings = require('../../json/gadm-mappings.json');
var cantons = require('../../json/cantons.json');
var chroma = require('chroma-js');

module.exports = Map;

function Map(svg) {
	this.svg = svg;
	this.data = {
		surrogates: null,
		stats: null,
		meta: null
	};
}

Map.prototype.paths = function() {
	return this.svg.querySelectorAll('#cantons > path');
};

Map.prototype.meta = function(meta) {
	this.data.meta = meta;
};

Map.prototype.stats = function(stats) {
	var code, stat, surrogate, surrogates, data = this.data;

	if (arguments.length < 1) {
		return data.stats;
	}

	data.stats = stats;

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
		data.surrogates = null;
		return;
	}

	surrogates = {};
	data.surrogates = {};
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

			data.surrogates[code] = surrogate;
		}
	}
};

Map.prototype.clear = function() {
	var i, l, paths;

	Map.call(this, this.svg);

	paths = this.paths();
	for (i = 0, l = paths.length; i < l; i++) {
		paths[i].style.fill = this.fill();
	}
};

Map.prototype.code = function(id) {
	return mappings[id];
};

Map.prototype.canton = function(code) {
	return cantons[code];
};

Map.prototype.stat = function(code, original) {
	var stat, num, data = this.data;

	if (!original && data.surrogates && data.surrogates[code]) {
		return data.surrogates[code];
	}

	stat = data.stats[code];

	if (null === stat || undefined === stat || '' === stat) {
		return null;
	}

	if ('string' === typeof stat) {

		// In Costa Rica, decimals are formatted using commas.
		stat = stat.replace(',', '.');

		// The comparison `String(num) === stat` could be used here instead, but then we'd need lots of exceptions for percentage and currency-formatted values like '23%' or '$100'.
		num = parseFloat(stat, 10);
		if (!isNaN(num)) {
			return num;
		}
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

	paths = this.paths();
	for (i = 0, l = paths.length; i < l; i++) {
		paths[i].style.fill = this.fill(paths[i].id, scale);
	}

	this.legend(scale);
};

Map.prototype.legend = function(scale) {
	var add, group, colors, doc, svg = this.svg, data = this.data, self = this, y, size = 20, ns = 'http://www.w3.org/2000/svg';

	doc = svg.ownerDocument;

	group = doc.getElementById('legend');
	if (group) {
		while (group.firstChild) {
			group.removeChild(group.firstChild);
		}
	} else {
		group = doc.createElementNS(ns, 'g');
		group.id = 'legend';
		group.style.fontFamily = 'sans-serif';
		group.style.fill = '#000';
		group.style.stroke = 'none';
		svg.appendChild(group);
	}

	y = 400;
	add = function(color, label) {
		var swatch, text;

		y = y + (size * 2);

		swatch = document.createElementNS(ns, 'rect');
		swatch.setAttribute('x', size);
		swatch.setAttribute('y', y);
		swatch.setAttribute('width', size);
		swatch.setAttribute('height', size);
		swatch.style.fill = color;

		text = doc.createElementNS(ns, 'text');
		text.setAttribute('x', size * 3);
		text.setAttribute('y', y);
		text.setAttribute('dy', 15);
		text.textContent = label;

		group.appendChild(swatch);
		group.appendChild(text);
	};

	// If using quantitative data, build the map legend from values instead of (surrogate) scale domain values.
	if (data.surrogates) {
		Object.keys(data.stats).reduce(function(stats, code) {
			var stat = self.stat(code, true);

			if (null !== stat && true !== stats[stat]) {
				add(scale(self.stat(code)).hex(), stat);
				stats[stat] = true;
			}

			return stats;
		}, {});

		return;
	}

	// If using qualitative data, build the map legend from the scale domain values.
	colors = scale.domain().reduce(function(colors, stat) {
		var color = scale(stat).hex();

		if (colors.hasOwnProperty(color)) {
			colors[color].push(stat);
		} else {
			colors[color] = [stat];
		}

		return colors;
	}, {});

	Object.keys(colors).forEach(function(color) {
		var minVal, maxVal, stats = colors[color];

		minVal = stats[0].toFixed(2).replace('.00', '');
		maxVal = stats[stats.length - 1].toFixed(2).replace('.00', '');
		if (minVal === maxVal) {
			add(color, minVal);
		} else {
			add(color, minVal + ' - ' + maxVal);
		}
	});
};
