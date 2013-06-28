/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var Map = require('./map/Map');
var map;

function make() {
	var svg = document.getElementById('map').contentDocument.rootElement;

	map = new Map(svg);
	map.defs();
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
