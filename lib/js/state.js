/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var querystring = require('querystring');

exports.update = function(id, title, controls) {
	var q, params = {};

	if (!history.pushState) {
		return;
	}

	params.id = id;
	params.code = controls.code();
	params.stat = controls.stat();

	q = '?' + querystring.stringify(params);

	history.pushState(null, title || 'Untitled', q);
};

exports.params = function() {
	return querystring.parse(location.search.substr(1));
};
