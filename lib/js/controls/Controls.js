/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

module.exports = Controls;

function Controls(src, opt, scale) {
	this.data = {
		sheet: null
	};

	this.forms = {
		src: src,
		opt: opt,
		scale: scale
	};
}

Controls.prototype.sheet = function(sheet) {
	if (arguments.length < 1) {
		return this.data.sheet;
	}

	this.data.sheet = sheet;
};

Controls.prototype.code = function() {
	return this.forms.opt.code.value;
};

Controls.prototype.stat = function() {
	return this.forms.opt.stat.value;
};

Controls.prototype.scale = function() {
	var i, l, form = this.forms.scale, brewer;

	for (i = 0, l = form.brewer.length; i < l; i++) {
		if (form.brewer[i].checked) {
			brewer = form.brewer[i].value;
			break;
		}
	}

	return {
		brewer: brewer,
		stops: form.stops.valueAsNumber,
		type: form.type.value
	};
};

Controls.prototype.disable = function() {
	this.forms.src.load.setAttribute('disabled', '');
	this.forms.opt.show.setAttribute('disabled', '');
	this.forms.opt.code.setAttribute('disabled', '');
	this.forms.opt.stat.setAttribute('disabled', '');
};

Controls.prototype.enable = function() {
	this.forms.src.load.removeAttribute('disabled');
	this.forms.opt.show.removeAttribute('disabled');
	this.forms.opt.code.removeAttribute('disabled');
	this.forms.opt.stat.removeAttribute('disabled');
};

Controls.prototype.selects = function(fields) {
	var i, l, field, html;

	html = '';
	for (i = 0, l = fields.length; i < l; i++) {
		field = fields[i];
		html += '<option value="' + field + '">' + field + '</option>';
	}

	this.forms.opt.code.innerHTML = html;
	this.forms.opt.stat.innerHTML = html;

	this.forms.opt.code.selectedIndex = 0;
	this.forms.opt.stat.selectedIndex = 1;
};
