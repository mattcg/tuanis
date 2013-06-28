/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var Map = require('./map/Map');
var map;

exports.update = function(stats, scale) {
	var svg;

	if (!map) {
		svg = document.getElementById('map').contentDocument.rootElement;
		map = new Map(svg);
		map.defs();
	}

	map.stats(stats);
	exports.scale(scale);
};

exports.scale = function(scale) {
	map.scale(scale.brewer, scale.stops, scale.type);
};

exports.clear = function() {
	if (map) {
		map.clear();
	}
};
