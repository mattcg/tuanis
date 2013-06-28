/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var querystring = require('querystring');

exports.update = function(id, title, controls) {
	var q, scale, params;

	if (!history.pushState) {
		return;
	}

	params = exports.params();

	if (arguments.length === 1) {
		controls = id;
		id = null;
	}

	if (id) {
		params.id = id;
	}

	params.code = controls.code();
	params.stat = controls.stat();

	scale = controls.scale();
	params.brewer = scale.brewer;
	params.stops = scale.stops;
	params.type = scale.type;

	q = '?' + querystring.stringify(params);

	history.pushState(null, title || 'Untitled', q);
};

exports.params = function() {
	return querystring.parse(location.search.substr(1));
};
