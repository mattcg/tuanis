/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var querystring = require('querystring');

function embed() {
	var q, params, pre = document.getElementById('embed');

	if (!pre) {
		return;
	}

	params = exports.params();
	params.controls = 'no';
	q = querystring.stringify(params);

	pre.textContent = '<iframe src="' + location.protocol + '//' + location.host + location.pathname + '?' + q + '"></iframe>';
}

require('domready')(function() {
	embed();
});

exports.controls = function() {
	return exports.params().controls !== 'no';
};

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

	history.pushState(params, title || 'Untitled', q);
	embed();
};

exports.params = function() {
	return querystring.parse(location.search.substr(1));
};
