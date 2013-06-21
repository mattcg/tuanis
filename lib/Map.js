/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var d3 = require('d3');
var topojson = require('topojson');
var hammer = require('hammerjs');

function Map(container) {
	this.container = container;
	this.svg = container.appendChild(document.createElement('svg'));

	registerInteractions(this.container, this.svg);
}

Map.prototype.data = function(data, scale) {
	if (!scale) {
		scale = this.scale(data);
	}

	d3.select(this.svg)
		.selectAll('.canton').style('fill', function(d) {
			return map.fill(d.properties.code, scale);
		});
};

Map.prototype.scale = function(data, colors) {
	var values, colors;

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

	w = dimensions[0] || svg.parentNode.clientWidth;
	h = dimensions[1] || w;

	svg.style.width = w + 'px';
	svg.style.height = h + 'px';

	return [w, h];
}

Map.prototype.projection = function(width) {
	if (!width) {
		width = this.dimensions();
	}

	return d3.geo.mercator()
		.scale(width * 16.667)
		.translate([width * 25, width * 3.294]);
}

function build(map, topoData) {
	var projection, color, d3Group, d3Scale, d3Svg, d3Map, d3Path, data, cr;

	d3Map = d3.map();
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

	d3Path = d3.geo.path().projection(getProjection(setDimensions(svg)));

	d3Svg.append('g').selectAll('path')
		.data(topojson.feature(topoData, topoData.objects.costarica).features)
		.enter().append('path')
		.attr('d', d3Path)
		.attr('class', 'canton')
		.on('click', function(d) {
			tip(d.properties);
		});

	legend(color);
}

function registerInteractions(container, svg) {
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
	hammer(container).on('pinchin ', scaleIn).on('pinchout', scaleOut).on('doubletap', function() {
		if (scaled) {
			scaleOut();
		} else {
			scaleIn();
		}
	});
}

function registerResize(svg, cb) {
	var debounceTimeout = null;

	// Remake the map on resize.
	window.addEventListener('resize', function() {
		if (debounceTimeout !== null) {
			clearTimeout(debounceTimeout);
		}

		debounceTimeout = window.setTimeout(function() {
			debounceTimeout = null;
			if (svg.parentNode) {
				svg.parentNode.removeChild(svg);
				cb();
			}
		}, 200);
	}, false);
};

function legend(scale) {
	var legendEl, legendFrag, colors;

	legendEl = document.querySelector('#viz-map-legend > ul');
	if (legendEl.children.length > 0) {

		// Already done.
		return;
	}

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

	legendFrag = document.createDocumentFragment();
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

		legendFrag.appendChild(colorEl);
	});
	
	legendEl.appendChild(legendFrag);
}

function fill(code, color) {
	var stats = garbage[code], stat = parseInt(stats[mapKey], 10);

	// Apply the 'stripe' filter to the path if no data is available.
	if (isNaN(stat)) {
		return 'url(#stripe)';
	}

	return color(stat);
}

function tip(properties) {
	var box, old, html, stats, map, code = properties.code, id = 'viz-map-tip';

	stats = garbage[code];
	box = document.createElement('div');
	box.id = id;
	html = '<div class="close"></div><h4 class="title">' + stats.name + '</h4><dl>';
	html += '<dt>Toneladas recolectadas por mes</dt><dd>' + stats.tonsPerMonth + '</dd>';
	html += '<dt>Toneladas recicladas por mes</dt><dd>' + stats.tonsRecoverablePerMonth + '</dd>';
	html += '<dt>Porcentaje recicladas por mes</dt><dd>' + stats.percentageRecovarablePerMonth + '</dd>';
	html += '<dt>Recoge residuos por separado en casas</dt><dd>' + stats.separateAtCollection + '</dd>';
	html += '<dt>Tiene programas de reciclaje</dt><dd>' + stats.recyclingProgram + '</dd>';
	html += '<dt>Porcentaje de hogares que separan</dt><dd>' + stats.percentLocationsSeparate + '</dd></dl>';
	html += '<p>nd = no se obtuvieron datos</p>';

	box.innerHTML = html;

	box.querySelector('.close').addEventListener('click', function() {
		translate.x(box, '-120%');
		window.setTimeout(function() {
			box.parentNode.removeChild(box);
		}, 250);
	}, false);

	old = document.getElementById(id);
	if (old) {
		old.parentNode.replaceChild(box, old);
	} else {
		map = document.getElementById(mapId);
		translate.x(box, '-120%');
		map.appendChild(box);
		window.setTimeout(function() {
			translate.x(box, 0);
		}, 0);
	}
}
