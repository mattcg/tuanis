/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

module.exports = Sheet;

function Sheet(data) {
	this.data = data;
}

Sheet.prototype.title = function() {
	return this.data.title;
};

Sheet.prototype.id = function() {
	return this.data.id;
};

Sheet.prototype.fields = function() {
	return Object.keys(this.data.rows[0]);
};

Sheet.prototype.stats = function(codeField, statField) {
	var stats = {};

	this.data.rows.forEach(function(row) {
		var code;

		code = row[codeField];
		stats[code] = row[statField];
	});

	return stats;
};
