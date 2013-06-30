/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var Map = require('./map/Map');
var map;

function stripe(svg) {
	var pattern, defs, path, svgNs, svgDoc;

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
	path.style.stroke = '#c0c0c0';
	path.style.fill = 'none';
}

function tip(map) {
	var container, hide, svg = map.svg;

	container = document.createElement('div');
	container.id = 'map-tip';
	container.style.display = 'none';
	container.innerHTML = '<h1></h1><p></p>';

	document.body.appendChild(container);

	hide = function() {
		container.style.display = 'none';
		container.removeAttribute('data-id');
	};

	svg.addEventListener('mouseout', hide, false);
	svg.addEventListener('mousemove', function(event) {
		var code, target = event.target, id = target.id;

		if ('path' !== target.tagName) {
			return hide();
		}

		container.style.top = event.clientY + 'px';
		container.style.left = event.clientX + 'px';

		if (container.getAttribute('data-id') === id) {
			return;
		}

		code = map.code(id);

		container.style.display = 'block';
		container.children[0].textContent = map.canton(code);
		container.children[1].textContent = map.stat(code, true);
		container.setAttribute('data-id', id);
	}, false);
}

function make() {
	var svg = document.getElementById('map').contentDocument.rootElement;

	map = new Map(svg);
	stripe(svg);
	tip(map);
}

exports.update = function(stats, scale) {
	if (!map) {
		make();
	}

	map.stats(stats);
	exports.scale(scale);
};

exports.scale = function(scale) {
	if (map && map.stats()) {
		map.scale(scale.brewer, scale.stops, scale.type);
	}
};

exports.clear = function() {
	if (map) {
		map.clear();
	}
};
