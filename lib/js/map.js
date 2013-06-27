/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var Map = require('./map/Map');
var map;

require('domready')(function() {
	var svg;

	svg = document.getElementById('map').contentDocument.getElementsByTagName('svg')[0];
	map = new Map(svg);
});

exports.update = function(stats, scale) {
	map.stats(stats, scale);
};

exports.clear = function() {
	map.clear();
};
