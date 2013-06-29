;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

require('./controls');

},{"./controls":2}],3:[function(require,module,exports){
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

Controls.prototype.source = function(src) {
	if (arguments.length < 1) {
		return this.forms.src.src.value;
	}

	this.forms.src.src.value = src || '';
};

Controls.prototype.code = function(code) {
	if (arguments.length < 1) {
		return this.forms.opt.code.value;
	}

	if (code) {
		this.forms.opt.code.value = code;
	}
};

Controls.prototype.stat = function(stat) {
	if (arguments.length < 1) {
		return this.forms.opt.stat.value;
	}

	if (stat) {
		this.forms.opt.stat.value = stat;
	}
};

Controls.prototype.scale = function(scale) {
	var i, l, form = this.forms.scale, brewer;

	if (scale) {
		if (scale.stops) {
			form.stops.value = scale.stops;
		}

		if (scale.type) {
			form.type.value = scale.type;
		}

		if (scale.brewer) {
			for (i = 0, l = form.brewer.length; i < l; i++) {
				if (scale.brewer === form.brewer[i].value) {
					form.brewer[i].checked = true;
					break;
				}
			}
		}

		return;
	}

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

},{}],4:[function(require,module,exports){

/**
 * Object#toString() ref for stringify().
 */

var toString = Object.prototype.toString;

/**
 * Array#indexOf shim.
 */

var indexOf = typeof Array.prototype.indexOf === 'function'
  ? function(arr, el) { return arr.indexOf(el); }
  : function(arr, el) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === el) return i;
      }
      return -1;
    };

/**
 * Array.isArray shim.
 */

var isArray = Array.isArray || function(arr) {
  return toString.call(arr) == '[object Array]';
};

/**
 * Object.keys shim.
 */

var objectKeys = Object.keys || function(obj) {
  var ret = [];
  for (var key in obj) ret.push(key);
  return ret;
};

/**
 * Array#forEach shim.
 */

var forEach = typeof Array.prototype.forEach === 'function'
  ? function(arr, fn) { return arr.forEach(fn); }
  : function(arr, fn) {
      for (var i = 0; i < arr.length; i++) fn(arr[i]);
    };

/**
 * Array#reduce shim.
 */

var reduce = function(arr, fn, initial) {
  if (typeof arr.reduce === 'function') return arr.reduce(fn, initial);
  var res = initial;
  for (var i = 0; i < arr.length; i++) res = fn(res, arr[i]);
  return res;
};

/**
 * Cache non-integer test regexp.
 */

var isint = /^[0-9]+$/;

function promote(parent, key) {
  if (parent[key].length == 0) return parent[key] = {};
  var t = {};
  for (var i in parent[key]) t[i] = parent[key][i];
  parent[key] = t;
  return t;
}

function parse(parts, parent, key, val) {
  var part = parts.shift();
  // end
  if (!part) {
    if (isArray(parent[key])) {
      parent[key].push(val);
    } else if ('object' == typeof parent[key]) {
      parent[key] = val;
    } else if ('undefined' == typeof parent[key]) {
      parent[key] = val;
    } else {
      parent[key] = [parent[key], val];
    }
    // array
  } else {
    var obj = parent[key] = parent[key] || [];
    if (']' == part) {
      if (isArray(obj)) {
        if ('' != val) obj.push(val);
      } else if ('object' == typeof obj) {
        obj[objectKeys(obj).length] = val;
      } else {
        obj = parent[key] = [parent[key], val];
      }
      // prop
    } else if (~indexOf(part, ']')) {
      part = part.substr(0, part.length - 1);
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
      // key
    } else {
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
    }
  }
}

/**
 * Merge parent key/val pair.
 */

function merge(parent, key, val){
  if (~indexOf(key, ']')) {
    var parts = key.split('[')
      , len = parts.length
      , last = len - 1;
    parse(parts, parent, 'base', val);
    // optimize
  } else {
    if (!isint.test(key) && isArray(parent.base)) {
      var t = {};
      for (var k in parent.base) t[k] = parent.base[k];
      parent.base = t;
    }
    set(parent.base, key, val);
  }

  return parent;
}

/**
 * Parse the given obj.
 */

function parseObject(obj){
  var ret = { base: {} };
  forEach(objectKeys(obj), function(name){
    merge(ret, name, obj[name]);
  });
  return ret.base;
}

/**
 * Parse the given str.
 */

function parseString(str){
  return reduce(String(str).split('&'), function(ret, pair){
    var eql = indexOf(pair, '=')
      , brace = lastBraceInKey(pair)
      , key = pair.substr(0, brace || eql)
      , val = pair.substr(brace || eql, pair.length)
      , val = val.substr(indexOf(val, '=') + 1, val.length);

    // ?foo
    if ('' == key) key = pair, val = '';
    if ('' == key) return ret;

    return merge(ret, decode(key), decode(val));
  }, { base: {} }).base;
}

/**
 * Parse the given query `str` or `obj`, returning an object.
 *
 * @param {String} str | {Object} obj
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if (null == str || '' == str) return {};
  return 'object' == typeof str
    ? parseObject(str)
    : parseString(str);
};

/**
 * Turn the given `obj` into a query string
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

var stringify = exports.stringify = function(obj, prefix) {
  if (isArray(obj)) {
    return stringifyArray(obj, prefix);
  } else if ('[object Object]' == toString.call(obj)) {
    return stringifyObject(obj, prefix);
  } else if ('string' == typeof obj) {
    return stringifyString(obj, prefix);
  } else {
    return prefix + '=' + encodeURIComponent(String(obj));
  }
};

/**
 * Stringify the given `str`.
 *
 * @param {String} str
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyString(str, prefix) {
  if (!prefix) throw new TypeError('stringify expects an object');
  return prefix + '=' + encodeURIComponent(str);
}

/**
 * Stringify the given `arr`.
 *
 * @param {Array} arr
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyArray(arr, prefix) {
  var ret = [];
  if (!prefix) throw new TypeError('stringify expects an object');
  for (var i = 0; i < arr.length; i++) {
    ret.push(stringify(arr[i], prefix + '[' + i + ']'));
  }
  return ret.join('&');
}

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyObject(obj, prefix) {
  var ret = []
    , keys = objectKeys(obj)
    , key;

  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    if (null == obj[key]) {
      ret.push(encodeURIComponent(key) + '=');
    } else {
      ret.push(stringify(obj[key], prefix
        ? prefix + '[' + encodeURIComponent(key) + ']'
        : encodeURIComponent(key)));
    }
  }

  return ret.join('&');
}

/**
 * Set `obj`'s `key` to `val` respecting
 * the weird and wonderful syntax of a qs,
 * where "foo=bar&foo=baz" becomes an array.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {String} val
 * @api private
 */

function set(obj, key, val) {
  var v = obj[key];
  if (undefined === v) {
    obj[key] = val;
  } else if (isArray(v)) {
    v.push(val);
  } else {
    obj[key] = [v, val];
  }
}

/**
 * Locate last brace in `str` within the key.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function lastBraceInKey(str) {
  var len = str.length
    , brace
    , c;
  for (var i = 0; i < len; ++i) {
    c = str[i];
    if (']' == c) brace = false;
    if ('[' == c) brace = true;
    if ('=' == c && !brace) return i;
  }
}

/**
 * Decode `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function decode(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (err) {
    return str;
  }
}

},{}],5:[function(require,module,exports){
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

},{"./map/Map":6}],7:[function(require,module,exports){
/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var Sheet = require('./sheet/Sheet');

exports.load = function(src, cb) {
	var match, id, xhr;

	if ((/^[A-Za-z0-9\-_]+$/).test(src)) {
		id = src;
	} else {
		match = (/key=([A-Za-z0-9\-_]+)/).exec(src);
		if (!match || !match[1]) {
			return cb(new Error('Please enter a valid Google Spreadsheets URL.'));
		}

		id = match[1];
	}

	xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://spreadsheets.google.com/feeds/list/' + id + '/od6/public/values?alt=json');

	xhr.addEventListener('load', function() {
		if (xhr.status !== 200) {
			return cb(new Error('Unable to fetch the spreadsheet. Have you published it to the Web yet?'));
		}

		parse(id, xhr.responseText, cb);
	}, false);

	xhr.addEventListener('error', function() {
		return cb(new Error('Unable to fetch the spreadsheet. Are you connected to the Internet?'));
	}, false);

	xhr.send();
};

function parse(id, json, cb) {
	var feed, rows = [];

	try {
		feed = JSON.parse(json).feed;
	} catch (err) {
		return cb(new Error('Error while parsing data from Google Spreadsheets.'));
	}

	if (!feed.entry || feed.entry.length < 1) {
		return cb(new Error('That spreadsheet seems to be empty.'));
	}

	feed.entry.forEach(function(entry) {
		var row = {};

		rows.push(row);
		Object.keys(entry).forEach(function(key) {
			if ('gsx$' === key.substr(0, 4)) {
				row[key.substr(4)] = entry[key].$t;
			}
		});
	});

	cb(null, new Sheet({
		id: id,
		rows: rows,
		title: feed.title.$t
	}));
}

},{"./sheet/Sheet":8}],8:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var chroma = require('chroma-js');

var Controls = require('./controls/Controls');
var map = require('./map');
var sheet = require('./sheet');
var state = require('./state');
var controls;

function colors(form) {
	Array.prototype.forEach.call(form.brewer, function(input) {
		var container = document.createElement('div');

		container.className = 'brewer';

		chroma.brewer[input.value].forEach(function(color) {
			var swatch = document.createElement('div');

			swatch.style.backgroundColor = color;
			swatch.className = 'swatch';
			container.appendChild(swatch);
		});

		input.parentNode.appendChild(container);
	});
}

function popstate(event) {
	var params, update;

	if (event && !event.state) {
		return;
	}

	// Load state form URL.
	params = state.params();

	// Update the form controls with values from URL.
	controls.scale(params);
	controls.source(params.id);

	// Load the ID in the URL if available.
	if (!params.id) {
		return;
	}

	update = function(sheet) {
		var stats;

		controls.sheet(sheet);
		controls.enable();
		controls.selects(sheet.fields());
		controls.code(params.code);
		controls.stat(params.stat);

		stats = sheet.stats(controls.code(), controls.stat());
		map.update(stats, params);
	};

	// Don't load the sheet again if already held in memory.
	if (controls.sheet() && controls.sheet().id() === params.id) {
		return update(controls.sheet());
	}

	controls.disable();
	sheet.load(params.id, function(err, sheet) {
		if (err) {
			return alert(err.toString());
		}

		update(sheet);
	});
}

// Generic listener to cancel form submit.
document.addEventListener('submit', function(event) {
	event.preventDefault();
	return false;
}, false);

require('domready')(function() {
	var srcForm, optForm, scaleForm;

	// Only show the controls if not embedding.
	if (state.controls()) {
		document.body.className = 'controls';
	}

	srcForm = document.getElementById('load-controls');
	optForm = document.getElementById('select-controls');

	scaleForm = document.getElementById('scale-controls');
	colors(scaleForm);

	controls = new Controls(srcForm, optForm, scaleForm);

	srcForm.addEventListener('submit', function(event) {
		controls.disable();

		sheet.load(controls.source(), function(err, sheet) {
			if (err) {
				return alert(err.toString());
			}

			controls.sheet(sheet);
			controls.enable();
			controls.selects(sheet.fields());

			// Clear the map update the URL.
			map.clear();
			state.update(sheet.id(), sheet.title(), controls);
		});
	}, false);

	optForm.addEventListener('submit', function(event) {
		var sheet = controls.sheet(), stats;

		stats = sheet.stats(controls.code(), controls.stat());
		map.update(stats, controls.scale());
		state.update(controls);
	}, false);

	scaleForm.addEventListener('change', function(event) {
		map.scale(controls.scale());
		state.update(controls);
	}, false);

	window.addEventListener('popstate', popstate, false);
	popstate();
});



},{"./controls/Controls":3,"./map":5,"./sheet":7,"./state":9,"chroma-js":10,"domready":11}],10:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
/**
    chroma.js

    Copyright (c) 2011-2013, Gregor Aisch
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this
      list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

    * The name Gregor Aisch may not be used to endorse or promote products
      derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
    INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
    BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
    OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
    EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

    @source: https://github.com/gka/chroma.js
*/


(function() {
  var Color, ColorScale, K, PITHIRD, TWOPI, X, Y, Z, brewer, chroma, clip_rgb, colors, cos, css2rgb, hex2rgb, hsi2rgb, hsl2rgb, hsv2rgb, lab2lch, lab2rgb, lab_xyz, lch2lab, lch2rgb, limit, luminance, luminance_x, rgb2hex, rgb2hsi, rgb2hsl, rgb2hsv, rgb2lab, rgb2lch, rgb_xyz, root, type, unpack, xyz_lab, xyz_rgb, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  chroma = (_ref = root.chroma) != null ? _ref : root.chroma = {};

  if (typeof module !== "undefined" && module !== null) {
    module.exports = chroma;
  }

  Color = (function() {
    function Color(x, y, z, m) {
      var me, me_rgb, _ref1;

      me = this;
      if ((x == null) && (y == null) && (z == null) && (m == null)) {
        x = [255, 0, 255];
      }
      if (type(x) === "array" && x.length === 3) {
        if (m == null) {
          m = y;
        }
        _ref1 = x, x = _ref1[0], y = _ref1[1], z = _ref1[2];
      }
      if (type(x) === "string") {
        m = 'hex';
      } else {
        if (m == null) {
          m = 'rgb';
        }
      }
      if (m === 'rgb') {
        me._rgb = [x, y, z];
      } else if (m === 'hsl') {
        me._rgb = hsl2rgb(x, y, z);
      } else if (m === 'hsv') {
        me._rgb = hsv2rgb(x, y, z);
      } else if (m === 'hex') {
        me._rgb = hex2rgb(x);
      } else if (m === 'lab') {
        me._rgb = lab2rgb(x, y, z);
      } else if (m === 'lch') {
        me._rgb = lch2rgb(x, y, z);
      } else if (m === 'hsi') {
        me._rgb = hsi2rgb(x, y, z);
      }
      me_rgb = clip_rgb(me._rgb);
    }

    Color.prototype.rgb = function() {
      return this._rgb;
    };

    Color.prototype.hex = function() {
      return rgb2hex(this._rgb);
    };

    Color.prototype.toString = function() {
      return this.hex();
    };

    Color.prototype.hsl = function() {
      return rgb2hsl(this._rgb);
    };

    Color.prototype.hsv = function() {
      return rgb2hsv(this._rgb);
    };

    Color.prototype.lab = function() {
      return rgb2lab(this._rgb);
    };

    Color.prototype.lch = function() {
      return rgb2lch(this._rgb);
    };

    Color.prototype.hsi = function() {
      return rgb2hsi(this._rgb);
    };

    Color.prototype.luminance = function() {
      return luminance(this._rgb);
    };

    Color.prototype.name = function() {
      var h, k;

      h = this.hex();
      for (k in chroma.colors) {
        if (h === chroma.colors[k]) {
          return k;
        }
      }
      return h;
    };

    Color.prototype.interpolate = function(f, col, m) {
      /*
      interpolates between colors
      */

      var dh, hue, hue0, hue1, lbv, lbv0, lbv1, me, sat, sat0, sat1, xyz0, xyz1;

      me = this;
      if (m == null) {
        m = 'rgb';
      }
      if (type(col) === "string") {
        col = new Color(col);
      }
      if (m === 'hsl' || m === 'hsv' || m === 'lch' || m === 'hsi') {
        if (m === 'hsl') {
          xyz0 = me.hsl();
          xyz1 = col.hsl();
        } else if (m === 'hsv') {
          xyz0 = me.hsv();
          xyz1 = col.hsv();
        } else if (m === 'hsi') {
          xyz0 = me.hsi();
          xyz1 = col.hsi();
        } else if (m === 'lch') {
          xyz0 = me.lch();
          xyz1 = col.lch();
        }
        if (m.substr(0, 1) === 'h') {
          hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
          hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
        } else {
          lbv0 = xyz0[0], sat0 = xyz0[1], hue0 = xyz0[2];
          lbv1 = xyz1[0], sat1 = xyz1[1], hue1 = xyz1[2];
        }
        if (!isNaN(hue0) && !isNaN(hue1)) {
          if (hue1 > hue0 && hue1 - hue0 > 180) {
            dh = hue1 - (hue0 + 360);
          } else if (hue1 < hue0 && hue0 - hue1 > 180) {
            dh = hue1 + 360 - hue0;
          } else {
            dh = hue1 - hue0;
          }
          hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
          hue = hue0;
          if (lbv1 === 1 || lbv1 === 0) {
            sat = sat0;
          }
        } else if (!isNaN(hue1)) {
          hue = hue1;
          if (lbv0 === 1 || lbv0 === 0) {
            sat = sat1;
          }
        } else {
          hue = void 0;
        }
        if (sat == null) {
          sat = sat0 + f * (sat1 - sat0);
        }
        lbv = lbv0 + f * (lbv1 - lbv0);
        if (m.substr(0, 1) === 'h') {
          return new Color(hue, sat, lbv, m);
        } else {
          return new Color(lbv, sat, hue, m);
        }
      } else if (m === 'rgb') {
        xyz0 = me._rgb;
        xyz1 = col._rgb;
        return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
      } else if (m === 'lab') {
        xyz0 = me.lab();
        xyz1 = col.lab();
        return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
      } else {
        throw "color mode " + m + " is not supported";
      }
    };

    Color.prototype.darken = function(amount) {
      var lch, me;

      if (amount == null) {
        amount = 20;
      }
      me = this;
      lch = me.lch();
      lch[0] -= amount;
      return chroma.lch(lch);
    };

    Color.prototype.darker = function(amount) {
      return this.darken(amount);
    };

    Color.prototype.brighten = function(amount) {
      if (amount == null) {
        amount = 20;
      }
      return this.darken(-amount);
    };

    Color.prototype.brighter = function(amount) {
      return this.brighten(amount);
    };

    Color.prototype.saturate = function(amount) {
      var lch, me;

      if (amount == null) {
        amount = 20;
      }
      me = this;
      lch = me.lch();
      lch[1] += amount;
      return chroma.lch(lch);
    };

    Color.prototype.desaturate = function(amount) {
      if (amount == null) {
        amount = 20;
      }
      return this.saturate(-amount);
    };

    return Color;

  })();

  hex2rgb = function(hex) {
    var b, g, r, rgb, u;

    if (hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      if (hex.length === 4 || hex.length === 7) {
        hex = hex.substr(1);
      }
      if (hex.length === 3) {
        hex = hex.split("");
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      u = parseInt(hex, 16);
      r = u >> 16;
      g = u >> 8 & 0xFF;
      b = u & 0xFF;
      return [r, g, b];
    }
    if (rgb = css2rgb(hex)) {
      return rgb;
    }
    throw "unknown color: " + hex;
  };

  css2rgb = function(css) {
    var hsl, i, m, rgb;

    if ((chroma.colors != null) && chroma.colors[css]) {
      return hex2rgb(chroma.colors[css]);
    }
    if (m = css.match(/rgb\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*\)/)) {
      return m.slice(1, 4);
    }
    if (m = css.match(/rgb\(\s*(\-?\d+)%,\s*(\-?\d+)%\s*,\s*(\-?\d+)%\s*\)/)) {
      rgb = m.slice(1, 4);
      for (i in rgb) {
        rgb[i] = Math.round(rgb[i] * 2.55);
      }
      return rgb;
    }
    if (m = css.match(/hsl\(\s*(\-?\d+),\s*(\-?\d+)%\s*,\s*(\-?\d+)%\s*\)/)) {
      hsl = m.slice(1, 4);
      hsl[1] *= 0.01;
      hsl[2] *= 0.01;
      return hsl2rgb(hsl);
    }
  };

  rgb2hex = function() {
    var b, g, r, str, u, _ref1;

    _ref1 = unpack(arguments), r = _ref1[0], g = _ref1[1], b = _ref1[2];
    u = r << 16 | g << 8 | b;
    str = "000000" + u.toString(16);
    return "#" + str.substr(str.length - 6);
  };

  hsv2rgb = function() {
    var b, f, g, h, i, p, q, r, s, t, v, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;

    _ref1 = unpack(arguments), h = _ref1[0], s = _ref1[1], v = _ref1[2];
    v *= 255;
    if (s === 0) {
      r = g = b = v;
    } else {
      if (h === 360) {
        h = 0;
      }
      if (h > 360) {
        h -= 360;
      }
      if (h < 0) {
        h += 360;
      }
      h /= 60;
      i = Math.floor(h);
      f = h - i;
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));
      switch (i) {
        case 0:
          _ref2 = [v, t, p], r = _ref2[0], g = _ref2[1], b = _ref2[2];
          break;
        case 1:
          _ref3 = [q, v, p], r = _ref3[0], g = _ref3[1], b = _ref3[2];
          break;
        case 2:
          _ref4 = [p, v, t], r = _ref4[0], g = _ref4[1], b = _ref4[2];
          break;
        case 3:
          _ref5 = [p, q, v], r = _ref5[0], g = _ref5[1], b = _ref5[2];
          break;
        case 4:
          _ref6 = [t, p, v], r = _ref6[0], g = _ref6[1], b = _ref6[2];
          break;
        case 5:
          _ref7 = [v, p, q], r = _ref7[0], g = _ref7[1], b = _ref7[2];
      }
    }
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return [r, g, b];
  };

  rgb2hsv = function() {
    var b, delta, g, h, max, min, r, s, v, _ref1;

    _ref1 = unpack(arguments), r = _ref1[0], g = _ref1[1], b = _ref1[2];
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    delta = max - min;
    v = max / 255.0;
    if (max === 0) {
      h = void 0;
      s = 0;
    } else {
      s = delta / max;
      if (r === max) {
        h = (g - b) / delta;
      }
      if (g === max) {
        h = 2 + (b - r) / delta;
      }
      if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    return [h, s, v];
  };

  hsl2rgb = function() {
    var b, c, g, h, i, l, r, s, t1, t2, t3, _i, _ref1, _ref2;

    _ref1 = unpack(arguments), h = _ref1[0], s = _ref1[1], l = _ref1[2];
    if (s === 0) {
      r = g = b = l * 255;
    } else {
      t3 = [0, 0, 0];
      c = [0, 0, 0];
      t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      t1 = 2 * l - t2;
      h /= 360;
      t3[0] = h + 1 / 3;
      t3[1] = h;
      t3[2] = h - 1 / 3;
      for (i = _i = 0; _i <= 2; i = ++_i) {
        if (t3[i] < 0) {
          t3[i] += 1;
        }
        if (t3[i] > 1) {
          t3[i] -= 1;
        }
        if (6 * t3[i] < 1) {
          c[i] = t1 + (t2 - t1) * 6 * t3[i];
        } else if (2 * t3[i] < 1) {
          c[i] = t2;
        } else if (3 * t3[i] < 2) {
          c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
        } else {
          c[i] = t1;
        }
      }
      _ref2 = [Math.round(c[0] * 255), Math.round(c[1] * 255), Math.round(c[2] * 255)], r = _ref2[0], g = _ref2[1], b = _ref2[2];
    }
    return [r, g, b];
  };

  rgb2hsl = function(r, g, b) {
    var h, l, max, min, s, _ref1;

    if (r !== void 0 && r.length === 3) {
      _ref1 = r, r = _ref1[0], g = _ref1[1], b = _ref1[2];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      s = 0;
      h = void 0;
    } else {
      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    }
    if (r === max) {
      h = (g - b) / (max - min);
    } else if (g === max) {
      h = 2 + (b - r) / (max - min);
    } else if (b === max) {
      h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
    return [h, s, l];
  };

  K = 18;

  X = 0.950470;

  Y = 1;

  Z = 1.088830;

  lab2rgb = function(l, a, b) {
    /*
    adapted to match d3 implementation
    */

    var g, r, x, y, z, _ref1, _ref2;

    if (l !== void 0 && l.length === 3) {
      _ref1 = l, l = _ref1[0], a = _ref1[1], b = _ref1[2];
    }
    if (l !== void 0 && l.length === 3) {
      _ref2 = l, l = _ref2[0], a = _ref2[1], b = _ref2[2];
    }
    y = (l + 16) / 116;
    x = y + a / 500;
    z = y - b / 200;
    x = lab_xyz(x) * X;
    y = lab_xyz(y) * Y;
    z = lab_xyz(z) * Z;
    r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
    g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
    b = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
    return [limit(r, 0, 255), limit(g, 0, 255), limit(b, 0, 255)];
  };

  rgb2lab = function() {
    var b, g, r, x, y, z, _ref1;

    _ref1 = unpack(arguments), r = _ref1[0], g = _ref1[1], b = _ref1[2];
    r = rgb_xyz(r);
    g = rgb_xyz(g);
    b = rgb_xyz(b);
    x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / X);
    y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / Y);
    z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / Z);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  };

  lch2lab = function() {
    /*
    Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel. These formulas were invented by David Dalrymple to obtain maximum contrast without going out of gamut if the parameters are in the range 0-1.
    A saturation multiplier was added by Gregor Aisch
    */

    var c, h, l, _ref1;

    _ref1 = unpack(arguments), l = _ref1[0], c = _ref1[1], h = _ref1[2];
    h = h * Math.PI / 180;
    return [l, Math.cos(h) * c, Math.sin(h) * c];
  };

  lch2rgb = function(l, c, h) {
    var L, a, b, g, r, _ref1, _ref2;

    _ref1 = lch2lab(l, c, h), L = _ref1[0], a = _ref1[1], b = _ref1[2];
    _ref2 = lab2rgb(L, a, b), r = _ref2[0], g = _ref2[1], b = _ref2[2];
    return [limit(r, 0, 255), limit(g, 0, 255), limit(b, 0, 255)];
  };

  lab_xyz = function(x) {
    if (x > 0.206893034) {
      return x * x * x;
    } else {
      return (x - 4 / 29) / 7.787037;
    }
  };

  xyz_lab = function(x) {
    if (x > 0.008856) {
      return Math.pow(x, 1 / 3);
    } else {
      return 7.787037 * x + 4 / 29;
    }
  };

  xyz_rgb = function(r) {
    return Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055));
  };

  rgb_xyz = function(r) {
    if ((r /= 255) <= 0.04045) {
      return r / 12.92;
    } else {
      return Math.pow((r + 0.055) / 1.055, 2.4);
    }
  };

  lab2lch = function() {
    var a, b, c, h, l, _ref1;

    _ref1 = unpack(arguments), l = _ref1[0], a = _ref1[1], b = _ref1[2];
    c = Math.sqrt(a * a + b * b);
    h = Math.atan2(b, a) / Math.PI * 180;
    return [l, c, h];
  };

  rgb2lch = function() {
    var a, b, g, l, r, _ref1, _ref2;

    _ref1 = unpack(arguments), r = _ref1[0], g = _ref1[1], b = _ref1[2];
    _ref2 = rgb2lab(r, g, b), l = _ref2[0], a = _ref2[1], b = _ref2[2];
    return lab2lch(l, a, b);
  };

  rgb2hsi = function() {
    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
    */

    var TWOPI, b, g, h, i, min, r, s, _ref1;

    _ref1 = unpack(arguments), r = _ref1[0], g = _ref1[1], b = _ref1[2];
    TWOPI = Math.PI * 2;
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    i = (r + g + b) / 3;
    s = 1 - min / i;
    if (s === 0) {
      h = 0;
    } else {
      h = ((r - g) + (r - b)) / 2;
      h /= Math.sqrt((r - g) * (r - g) + (r - b) * (g - b));
      h = Math.acos(h);
      if (b > g) {
        h = TWOPI - h;
      }
      h /= TWOPI;
    }
    return [h * 360, s, i];
  };

  hsi2rgb = function(h, s, i) {
    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
    */

    var b, g, r, _ref1;

    _ref1 = unpack(arguments), h = _ref1[0], s = _ref1[1], i = _ref1[2];
    h /= 360;
    if (h < 1 / 3) {
      b = (1 - s) / 3;
      r = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      g = 1 - (b + r);
    } else if (h < 2 / 3) {
      h -= 1 / 3;
      r = (1 - s) / 3;
      g = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      b = 1 - (r + g);
    } else {
      h -= 2 / 3;
      g = (1 - s) / 3;
      b = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      r = 1 - (g + b);
    }
    r = limit(i * r * 3);
    g = limit(i * g * 3);
    b = limit(i * b * 3);
    return [r * 255, g * 255, b * 255];
  };

  clip_rgb = function(rgb) {
    var i;

    for (i in rgb) {
      if (rgb[i] < 0) {
        rgb[i] = 0;
      }
      if (rgb[i] > 255) {
        rgb[i] = 255;
      }
    }
    return rgb;
  };

  luminance = function(r, g, b) {
    var _ref1;

    _ref1 = unpack(arguments), r = _ref1[0], g = _ref1[1], b = _ref1[2];
    r = luminance_x(r);
    g = luminance_x(g);
    b = luminance_x(b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  luminance_x = function(x) {
    x /= 255;
    if (x <= 0.03928) {
      return x / 12.92;
    } else {
      return Math.pow((x + 0.055) / 1.055, 2.4);
    }
  };

  chroma.Color = Color;

  chroma.color = function(x, y, z, m) {
    return new Color(x, y, z, m);
  };

  chroma.hsl = function(h, s, l) {
    return new Color(h, s, l, 'hsl');
  };

  chroma.hsv = function(h, s, v) {
    return new Color(h, s, v, 'hsv');
  };

  chroma.rgb = function(r, g, b) {
    return new Color(r, g, b, 'rgb');
  };

  chroma.hex = function(x) {
    return new Color(x);
  };

  chroma.css = function(x) {
    return new Color(x);
  };

  chroma.lab = function(l, a, b) {
    return new Color(l, a, b, 'lab');
  };

  chroma.lch = function(l, c, h) {
    return new Color(l, c, h, 'lch');
  };

  chroma.hsi = function(h, s, i) {
    return new Color(h, s, i, 'hsi');
  };

  chroma.interpolate = function(a, b, f, m) {
    if ((a == null) || (b == null)) {
      return '#000';
    }
    if (type(a) === 'string') {
      a = new Color(a);
    }
    if (type(b) === 'string') {
      b = new Color(b);
    }
    return a.interpolate(f, b, m);
  };

  chroma.contrast = function(a, b) {
    var l1, l2;

    if (type(a) === 'string') {
      a = new Color(a);
    }
    if (type(b) === 'string') {
      b = new Color(b);
    }
    l1 = a.luminance();
    l2 = b.luminance();
    if (l1 > l2) {
      return (l1 + 0.05) / (l2 + 0.05);
    } else {
      return (l2 + 0.05) / (l1 + 0.05);
    }
  };

  /*
      chroma.js
  
      Copyright (c) 2011-2013, Gregor Aisch
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
  
      * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
  
      * The name Gregor Aisch may not be used to endorse or promote products
        derived from this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
      @source: https://github.com/gka/chroma.js
  */


  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  chroma = (_ref1 = root.chroma) != null ? _ref1 : root.chroma = {};

  Color = chroma.Color;

  ColorScale = (function() {
    /*
    base class for color scales
    */
    function ColorScale(opts) {
      var me, _ref2, _ref3;

      if (opts == null) {
        opts = {};
      }
      me = this;
      me.range(opts.colors, opts.positions);
      me._mode = (_ref2 = opts.mode) != null ? _ref2 : 'rgb';
      me._nacol = chroma.hex((_ref3 = opts.nacol) != null ? _ref3 : chroma.hex('#ccc'));
      me.domain([0, 1]);
      me;
    }

    ColorScale.prototype.range = function(colors, positions) {
      var c, col, me, _i, _j, _ref2, _ref3, _ref4;

      me = this;
      if (colors == null) {
        colors = ['#ddd', '#222'];
      }
      if ((colors != null) && type(colors) === 'string' && (((_ref2 = chroma.brewer) != null ? _ref2[colors] : void 0) != null)) {
        colors = chroma.brewer[colors].slice(0);
      }
      for (c = _i = 0, _ref3 = colors.length - 1; 0 <= _ref3 ? _i <= _ref3 : _i >= _ref3; c = 0 <= _ref3 ? ++_i : --_i) {
        col = colors[c];
        if (type(col) === "string") {
          colors[c] = new Color(col);
        }
      }
      me._colors = colors;
      if (positions != null) {
        me._pos = positions;
      } else {
        me._pos = [];
        for (c = _j = 0, _ref4 = colors.length - 1; 0 <= _ref4 ? _j <= _ref4 : _j >= _ref4; c = 0 <= _ref4 ? ++_j : --_j) {
          me._pos.push(c / (colors.length - 1));
        }
      }
      return me;
    };

    ColorScale.prototype.domain = function(domain) {
      var me;

      if (domain == null) {
        domain = [];
      }
      /*
      # use this if you want to display a limited number of data classes
      # possible methods are "equalinterval", "quantiles", "custom"
      */

      me = this;
      me._domain = domain;
      me._min = domain[0];
      me._max = domain[domain.length - 1];
      if (domain.length === 2) {
        me._numClasses = 0;
      } else {
        me._numClasses = domain.length - 1;
      }
      return me;
    };

    ColorScale.prototype.get = function(value) {
      var c, f, f0, me;

      me = this;
      if (isNaN(value)) {
        return me._nacol;
      }
      if (me._domain.length > 2) {
        c = me.getClass(value);
        f = c / (me._numClasses - 1);
      } else {
        f = f0 = (value - me._min) / (me._max - me._min);
        f = Math.min(1, Math.max(0, f));
      }
      return me.fColor(f);
    };

    ColorScale.prototype.fColor = function(f) {
      var col, cols, i, me, p, _i, _ref2;

      me = this;
      cols = me._colors;
      for (i = _i = 0, _ref2 = me._pos.length - 1; 0 <= _ref2 ? _i <= _ref2 : _i >= _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
        p = me._pos[i];
        if (f <= p) {
          col = cols[i];
          break;
        }
        if (f >= p && i === me._pos.length - 1) {
          col = cols[i];
          break;
        }
        if (f > p && f < me._pos[i + 1]) {
          f = (f - p) / (me._pos[i + 1] - p);
          col = chroma.interpolate(cols[i], cols[i + 1], f, me._mode);
          break;
        }
      }
      return col;
    };

    ColorScale.prototype.classifyValue = function(value) {
      var domain, i, maxc, me, minc, n, val;

      me = this;
      domain = me._domain;
      val = value;
      if (domain.length > 2) {
        n = domain.length - 1;
        i = me.getClass(value);
        val = domain[i] + (domain[i + 1] - domain[i]) * 0.5;
        minc = domain[0];
        maxc = domain[n - 1];
        val = me._min + ((val - minc) / (maxc - minc)) * (me._max - me._min);
      }
      return val;
    };

    ColorScale.prototype.getClass = function(value) {
      var domain, i, n, self;

      self = this;
      domain = self._domain;
      if (domain != null) {
        n = domain.length - 1;
        i = 0;
        while (i < n && value >= domain[i]) {
          i++;
        }
        return i - 1;
      }
      return 0;
    };

    ColorScale.prototype.validValue = function(value) {
      return !isNaN(value);
    };

    return ColorScale;

  })();

  chroma.ColorScale = ColorScale;

  chroma.scale = function(colors, positions) {
    var colscale, f, out;

    colscale = new chroma.ColorScale();
    colscale.range(colors, positions);
    out = false;
    f = function(v) {
      var c;

      c = colscale.get(v);
      if (out && c[out]) {
        return c[out]();
      } else {
        return c;
      }
    };
    f.domain = function(domain, classes, mode, key) {
      var d;

      if (mode == null) {
        mode = 'e';
      }
      if (!arguments.length) {
        return colscale._domain;
      }
      if (classes != null) {
        d = chroma.analyze(domain, key);
        if (classes === 0) {
          domain = [d.min, d.max];
        } else {
          domain = chroma.limits(d, mode, classes);
        }
      }
      colscale.domain(domain);
      return f;
    };
    f.mode = function(_m) {
      if (!arguments.length) {
        return colscale._mode;
      }
      colscale._mode = _m;
      return f;
    };
    f.range = function(_colors, _pos) {
      colscale.range(_colors, _pos);
      return f;
    };
    f.out = function(_o) {
      out = _o;
      return f;
    };
    f.getColor = function(val) {
      return f(val);
    };
    return f;
  };

  if ((_ref2 = chroma.scales) == null) {
    chroma.scales = {};
  }

  chroma.scales.cool = function() {
    return chroma.scale([chroma.hsl(180, 1, .9), chroma.hsl(250, .7, .4)]);
  };

  chroma.scales.hot = function() {
    return chroma.scale(['#000', '#f00', '#ff0', '#fff'], [0, .25, .75, 1]).mode('rgb');
  };

  /*
      chroma.js
  
      Copyright (c) 2011-2013, Gregor Aisch
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
  
      * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
  
      * The name Gregor Aisch may not be used to endorse or promote products
        derived from this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
      @source: https://github.com/gka/chroma.js
  */


  chroma.analyze = function(data, key, filter) {
    var add, k, r, val, visit, _i, _len;

    r = {
      min: Number.MAX_VALUE,
      max: Number.MAX_VALUE * -1,
      sum: 0,
      values: [],
      count: 0
    };
    if (filter == null) {
      filter = function() {
        return true;
      };
    }
    add = function(val) {
      if ((val != null) && !isNaN(val)) {
        r.values.push(val);
        r.sum += val;
        if (val < r.min) {
          r.min = val;
        }
        if (val > r.max) {
          r.max = val;
        }
        r.count += 1;
      }
    };
    visit = function(val, k) {
      if (filter(val, k)) {
        if ((key != null) && type(key) === 'function') {
          return add(key(val));
        } else if ((key != null) && type(key) === 'string' || type(key) === 'number') {
          return add(val[key]);
        } else {
          return add(val);
        }
      }
    };
    if (type(data) === 'array') {
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        val = data[_i];
        visit(val);
      }
    } else {
      for (k in data) {
        val = data[k];
        visit(val, k);
      }
    }
    r.domain = [r.min, r.max];
    r.limits = function(mode, num) {
      return chroma.limits(r, mode, num);
    };
    return r;
  };

  chroma.limits = function(data, mode, num) {
    var assignments, best, centroids, cluster, clusterSizes, dist, i, j, kClusters, limits, max, max_log, min, min_log, mindist, n, nb_iters, newCentroids, p, pb, pr, repeat, sum, tmpKMeansBreaks, value, values, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _s, _t, _u, _v, _w;

    if (mode == null) {
      mode = 'equal';
    }
    if (num == null) {
      num = 7;
    }
    if (data.values == null) {
      data = chroma.analyze(data);
    }
    min = data.min;
    max = data.max;
    sum = data.sum;
    values = data.values.sort(function(a, b) {
      return a - b;
    });
    limits = [];
    if (mode.substr(0, 1) === 'c') {
      limits.push(min);
      limits.push(max);
    }
    if (mode.substr(0, 1) === 'e') {
      limits.push(min);
      for (i = _i = 1, _ref3 = num - 1; 1 <= _ref3 ? _i <= _ref3 : _i >= _ref3; i = 1 <= _ref3 ? ++_i : --_i) {
        limits.push(min + (i / num) * (max - min));
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'l') {
      if (min <= 0) {
        throw 'Logarithmic scales are only possible for values > 0';
      }
      min_log = Math.LOG10E * Math.log(min);
      max_log = Math.LOG10E * Math.log(max);
      limits.push(min);
      for (i = _j = 1, _ref4 = num - 1; 1 <= _ref4 ? _j <= _ref4 : _j >= _ref4; i = 1 <= _ref4 ? ++_j : --_j) {
        limits.push(Math.pow(10, min_log + (i / num) * (max_log - min_log)));
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'q') {
      limits.push(min);
      for (i = _k = 1, _ref5 = num - 1; 1 <= _ref5 ? _k <= _ref5 : _k >= _ref5; i = 1 <= _ref5 ? ++_k : --_k) {
        p = values.length * i / num;
        pb = Math.floor(p);
        if (pb === p) {
          limits.push(values[pb]);
        } else {
          pr = p - pb;
          limits.push(values[pb] * pr + values[pb + 1] * (1 - pr));
        }
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'k') {
      /*
      implementation based on
      http://code.google.com/p/figue/source/browse/trunk/figue.js#336
      simplified for 1-d input values
      */

      n = values.length;
      assignments = new Array(n);
      clusterSizes = new Array(num);
      repeat = true;
      nb_iters = 0;
      centroids = null;
      centroids = [];
      centroids.push(min);
      for (i = _l = 1, _ref6 = num - 1; 1 <= _ref6 ? _l <= _ref6 : _l >= _ref6; i = 1 <= _ref6 ? ++_l : --_l) {
        centroids.push(min + (i / num) * (max - min));
      }
      centroids.push(max);
      while (repeat) {
        for (j = _m = 0, _ref7 = num - 1; 0 <= _ref7 ? _m <= _ref7 : _m >= _ref7; j = 0 <= _ref7 ? ++_m : --_m) {
          clusterSizes[j] = 0;
        }
        for (i = _n = 0, _ref8 = n - 1; 0 <= _ref8 ? _n <= _ref8 : _n >= _ref8; i = 0 <= _ref8 ? ++_n : --_n) {
          value = values[i];
          mindist = Number.MAX_VALUE;
          for (j = _o = 0, _ref9 = num - 1; 0 <= _ref9 ? _o <= _ref9 : _o >= _ref9; j = 0 <= _ref9 ? ++_o : --_o) {
            dist = Math.abs(centroids[j] - value);
            if (dist < mindist) {
              mindist = dist;
              best = j;
            }
          }
          clusterSizes[best]++;
          assignments[i] = best;
        }
        newCentroids = new Array(num);
        for (j = _p = 0, _ref10 = num - 1; 0 <= _ref10 ? _p <= _ref10 : _p >= _ref10; j = 0 <= _ref10 ? ++_p : --_p) {
          newCentroids[j] = null;
        }
        for (i = _q = 0, _ref11 = n - 1; 0 <= _ref11 ? _q <= _ref11 : _q >= _ref11; i = 0 <= _ref11 ? ++_q : --_q) {
          cluster = assignments[i];
          if (newCentroids[cluster] === null) {
            newCentroids[cluster] = values[i];
          } else {
            newCentroids[cluster] += values[i];
          }
        }
        for (j = _r = 0, _ref12 = num - 1; 0 <= _ref12 ? _r <= _ref12 : _r >= _ref12; j = 0 <= _ref12 ? ++_r : --_r) {
          newCentroids[j] *= 1 / clusterSizes[j];
        }
        repeat = false;
        for (j = _s = 0, _ref13 = num - 1; 0 <= _ref13 ? _s <= _ref13 : _s >= _ref13; j = 0 <= _ref13 ? ++_s : --_s) {
          if (newCentroids[j] !== centroids[i]) {
            repeat = true;
            break;
          }
        }
        centroids = newCentroids;
        nb_iters++;
        if (nb_iters > 200) {
          repeat = false;
        }
      }
      kClusters = {};
      for (j = _t = 0, _ref14 = num - 1; 0 <= _ref14 ? _t <= _ref14 : _t >= _ref14; j = 0 <= _ref14 ? ++_t : --_t) {
        kClusters[j] = [];
      }
      for (i = _u = 0, _ref15 = n - 1; 0 <= _ref15 ? _u <= _ref15 : _u >= _ref15; i = 0 <= _ref15 ? ++_u : --_u) {
        cluster = assignments[i];
        kClusters[cluster].push(values[i]);
      }
      tmpKMeansBreaks = [];
      for (j = _v = 0, _ref16 = num - 1; 0 <= _ref16 ? _v <= _ref16 : _v >= _ref16; j = 0 <= _ref16 ? ++_v : --_v) {
        tmpKMeansBreaks.push(kClusters[j][0]);
        tmpKMeansBreaks.push(kClusters[j][kClusters[j].length - 1]);
      }
      tmpKMeansBreaks = tmpKMeansBreaks.sort(function(a, b) {
        return a - b;
      });
      limits.push(tmpKMeansBreaks[0]);
      for (i = _w = 1, _ref17 = tmpKMeansBreaks.length - 1; _w <= _ref17; i = _w += 2) {
        if (!isNaN(tmpKMeansBreaks[i])) {
          limits.push(tmpKMeansBreaks[i]);
        }
      }
    }
    return limits;
  };

  /*
      chroma.js
  
      Copyright (c) 2011-2013, Gregor Aisch
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
  
      * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
  
      * The name Gregor Aisch may not be used to endorse or promote products
        derived from this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
      @source: https://github.com/gka/chroma.js
  */


  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  type = (function() {
    /*
    for browser-safe type checking+
    ported from jQuery's $.type
    */

    var classToType, name, _i, _len, _ref3;

    classToType = {};
    _ref3 = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      name = _ref3[_i];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    return function(obj) {
      var strType;

      strType = Object.prototype.toString.call(obj);
      return classToType[strType] || "object";
    };
  })();

  if ((_ref3 = root.type) == null) {
    root.type = type;
  }

  Array.max = function(array) {
    return Math.max.apply(Math, array);
  };

  Array.min = function(array) {
    return Math.min.apply(Math, array);
  };

  limit = function(x, min, max) {
    if (min == null) {
      min = 0;
    }
    if (max == null) {
      max = 1;
    }
    if (x < min) {
      x = min;
    }
    if (x > max) {
      x = max;
    }
    return x;
  };

  unpack = function(args) {
    if (args.length === 3) {
      return args;
    } else {
      return args[0];
    }
  };

  TWOPI = Math.PI * 2;

  PITHIRD = Math.PI / 3;

  cos = Math.cos;

  /**
  	ColorBrewer colors for chroma.js
  
  	Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The 
  	Pennsylvania State University.
  
  	Licensed under the Apache License, Version 2.0 (the "License"); 
  	you may not use this file except in compliance with the License.
  	You may obtain a copy of the License at	
  	http://www.apache.org/licenses/LICENSE-2.0
  
  	Unless required by applicable law or agreed to in writing, software distributed
  	under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
  	CONDITIONS OF ANY KIND, either express or implied. See the License for the
  	specific language governing permissions and limitations under the License.
  
      @preserve
  */


  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  chroma = (_ref4 = root.chroma) != null ? _ref4 : root.chroma = {};

  chroma.brewer = brewer = {
    OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
    PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
    BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
    Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
    BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
    YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
    YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
    Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
    RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
    Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
    Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
    GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
    Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
    YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
    Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
    Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
    RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
    RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
    PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
    PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
    RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
    BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
    RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
    PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
    Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
    Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
    Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
    Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
    Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
    Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
    Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
    Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2']
  };

  /**
  	X11 color names
  
  	http://www.w3.org/TR/css3-color/#svg-color
  */


  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  chroma = (_ref5 = root.chroma) != null ? _ref5 : root.chroma = {};

  chroma.colors = colors = {
    indigo: "#4b0082",
    gold: "#ffd700",
    hotpink: "#ff69b4",
    firebrick: "#b22222",
    indianred: "#cd5c5c",
    yellow: "#ffff00",
    mistyrose: "#ffe4e1",
    darkolivegreen: "#556b2f",
    olive: "#808000",
    darkseagreen: "#8fbc8f",
    pink: "#ffc0cb",
    tomato: "#ff6347",
    lightcoral: "#f08080",
    orangered: "#ff4500",
    navajowhite: "#ffdead",
    lime: "#00ff00",
    palegreen: "#98fb98",
    darkslategrey: "#2f4f4f",
    greenyellow: "#adff2f",
    burlywood: "#deb887",
    seashell: "#fff5ee",
    mediumspringgreen: "#00fa9a",
    fuchsia: "#ff00ff",
    papayawhip: "#ffefd5",
    blanchedalmond: "#ffebcd",
    chartreuse: "#7fff00",
    dimgray: "#696969",
    black: "#000000",
    peachpuff: "#ffdab9",
    springgreen: "#00ff7f",
    aquamarine: "#7fffd4",
    white: "#ffffff",
    orange: "#ffa500",
    lightsalmon: "#ffa07a",
    darkslategray: "#2f4f4f",
    brown: "#a52a2a",
    ivory: "#fffff0",
    dodgerblue: "#1e90ff",
    peru: "#cd853f",
    lawngreen: "#7cfc00",
    chocolate: "#d2691e",
    crimson: "#dc143c",
    forestgreen: "#228b22",
    darkgrey: "#a9a9a9",
    lightseagreen: "#20b2aa",
    cyan: "#00ffff",
    mintcream: "#f5fffa",
    silver: "#c0c0c0",
    antiquewhite: "#faebd7",
    mediumorchid: "#ba55d3",
    skyblue: "#87ceeb",
    gray: "#808080",
    darkturquoise: "#00ced1",
    goldenrod: "#daa520",
    darkgreen: "#006400",
    floralwhite: "#fffaf0",
    darkviolet: "#9400d3",
    darkgray: "#a9a9a9",
    moccasin: "#ffe4b5",
    saddlebrown: "#8b4513",
    grey: "#808080",
    darkslateblue: "#483d8b",
    lightskyblue: "#87cefa",
    lightpink: "#ffb6c1",
    mediumvioletred: "#c71585",
    slategrey: "#708090",
    red: "#ff0000",
    deeppink: "#ff1493",
    limegreen: "#32cd32",
    darkmagenta: "#8b008b",
    palegoldenrod: "#eee8aa",
    plum: "#dda0dd",
    turquoise: "#40e0d0",
    lightgrey: "#d3d3d3",
    lightgoldenrodyellow: "#fafad2",
    darkgoldenrod: "#b8860b",
    lavender: "#e6e6fa",
    maroon: "#800000",
    yellowgreen: "#9acd32",
    sandybrown: "#f4a460",
    thistle: "#d8bfd8",
    violet: "#ee82ee",
    navy: "#000080",
    magenta: "#ff00ff",
    dimgrey: "#696969",
    tan: "#d2b48c",
    rosybrown: "#bc8f8f",
    olivedrab: "#6b8e23",
    blue: "#0000ff",
    lightblue: "#add8e6",
    ghostwhite: "#f8f8ff",
    honeydew: "#f0fff0",
    cornflowerblue: "#6495ed",
    slateblue: "#6a5acd",
    linen: "#faf0e6",
    darkblue: "#00008b",
    powderblue: "#b0e0e6",
    seagreen: "#2e8b57",
    darkkhaki: "#bdb76b",
    snow: "#fffafa",
    sienna: "#a0522d",
    mediumblue: "#0000cd",
    royalblue: "#4169e1",
    lightcyan: "#e0ffff",
    green: "#008000",
    mediumpurple: "#9370db",
    midnightblue: "#191970",
    cornsilk: "#fff8dc",
    paleturquoise: "#afeeee",
    bisque: "#ffe4c4",
    slategray: "#708090",
    darkcyan: "#008b8b",
    khaki: "#f0e68c",
    wheat: "#f5deb3",
    teal: "#008080",
    darkorchid: "#9932cc",
    deepskyblue: "#00bfff",
    salmon: "#fa8072",
    darkred: "#8b0000",
    steelblue: "#4682b4",
    palevioletred: "#db7093",
    lightslategray: "#778899",
    aliceblue: "#f0f8ff",
    lightslategrey: "#778899",
    lightgreen: "#90ee90",
    orchid: "#da70d6",
    gainsboro: "#dcdcdc",
    mediumseagreen: "#3cb371",
    lightgray: "#d3d3d3",
    mediumturquoise: "#48d1cc",
    lemonchiffon: "#fffacd",
    cadetblue: "#5f9ea0",
    lightyellow: "#ffffe0",
    lavenderblush: "#fff0f5",
    coral: "#ff7f50",
    purple: "#800080",
    aqua: "#00ffff",
    whitesmoke: "#f5f5f5",
    mediumslateblue: "#7b68ee",
    darkorange: "#ff8c00",
    mediumaquamarine: "#66cdaa",
    darksalmon: "#e9967a",
    beige: "#f5f5dc",
    blueviolet: "#8a2be2",
    azure: "#f0ffff",
    lightsteelblue: "#b0c4de",
    oldlace: "#fdf5e6"
  };

}).call(this);

},{}],11:[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2012 - License MIT
  */
!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
}('domready', function (ready) {

  var fns = [], fn, f = false
    , doc = document
    , testEl = doc.documentElement
    , hack = testEl.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , addEventListener = 'addEventListener'
    , onreadystatechange = 'onreadystatechange'
    , readyState = 'readyState'
    , loaded = /^loade|c/.test(doc[readyState])

  function flush(f) {
    loaded = 1
    while (f = fns.shift()) f()
  }

  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
    doc.removeEventListener(domContentLoaded, fn, f)
    flush()
  }, f)


  hack && doc.attachEvent(onreadystatechange, fn = function () {
    if (/^c/.test(doc[readyState])) {
      doc.detachEvent(onreadystatechange, fn)
      flush()
    }
  })

  return (ready = hack ?
    function (fn) {
      self != top ?
        loaded ? fn() : fns.push(fn) :
        function () {
          try {
            testEl.doScroll('left')
          } catch (e) {
            return setTimeout(function() { ready(fn) }, 50)
          }
          fn()
        }()
    } :
    function (fn) {
      loaded ? fn() : fns.push(fn)
    })
})
},{}],12:[function(require,module,exports){
module.exports={
	"11408": 403,
	"11409": 410,
	"11410": 706,
	"11411": 701,
	"11412": 705,
	"11413": 702,
	"11414": 703,
	"11415": 704,
	"11416": 606,
	"11417": 603,
	"11418": 610,
	"11419": 608,
	"11420": 602,
	"11366": 201,
	"11367": 211,
	"11368": 205,
	"11369": 203,
	"11370": 215,
	"11371": 214,
	"11372": 206,
	"11373": 209,
	"11374": 207,
	"11375": 208,
	"11376": 210,
	"11377": 204,
	"11378": 202,
	"11379": 213,
	"11380": 212,
	"11381": 306,
	"11382": 301,
	"11383": 308,
	"11384": 304,
	"11385": 303,
	"11386": 307,
	"11387": 302,
	"11388": 305,
	"11389": 507,
	"11390": 504,
	"11391": 506,
	"11392": 505,
	"11393": 511,
	"11394": 510,
	"11395": 501,
	"11396": 509,
	"11397": 502,
	"11398": 503,
	"11399": 508,
	"11400": 402,
	"11401": 407,
	"11402": 408,
	"11403": 401,
	"11404": 406,
	"11405": 409,
	"11406": 405,
	"11407": 404,
	"11421": 611,
	"11422": 607,
	"11423": 604,
	"11424": 605,
	"11425": 609,
	"11426": 601,
	"11427": 112,
	"11428": 110,
	"11429": 106,
	"11430": 118,
	"11431": 103,
	"11432": 117,
	"11433": 102,
	"11434": 108,
	"11435": 120,
	"11436": 115,
	"11437": 107,
	"11438": 114,
	"11439": 119,
	"11440": 104,
	"11441": 101,
	"11442": 109,
	"11443": 105,
	"11444": 113,
	"11445": 116,
	"11446": 111
}

},{}],9:[function(require,module,exports){
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

},{"querystring":4,"domready":11}],6:[function(require,module,exports){
/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true */

'use strict';

var mappings = require('../../json/gadm-mappings.json');
var chroma = require('chroma-js');

module.exports = Map;

function Map(svg) {
	this.svg = svg;
	this.data = {
		surrogates: {},
		stats: null,
		meta: null
	};
}

Map.prototype.meta = function(meta) {
	this.data.meta = meta;
};

Map.prototype.stats = function(stats) {
	var code, stat, surrogate, surrogates;

	if (arguments.length < 1) {
		return this.data.stats;
	}

	this.data.stats = stats;
	this.data.surrogates = {};

	// Apply some heuristics to check whether the stats contain qualitative data as strings.
	// In that case, use surrogate IDs.
	for (code in stats) {
		if (stats.hasOwnProperty(code)) {
			stat = this.stat(code);

			if ('string' === typeof stat) {
				surrogate = 1;
				break;
			}
		}
	}

	if (!surrogate) {
		this.data.surrogates = {};
		return;
	}

	surrogates = {};
	for (code in stats) {
		if (stats.hasOwnProperty(code)) {
			stat = this.stat(code);
			if (null === stat) {
				continue;
			}

			if (surrogates.hasOwnProperty(stat)) {
				surrogate = surrogates[stat];
			} else {
				surrogate++;
				surrogates[stat] = surrogate;
			}

			this.data.surrogates[code] = surrogate;
		}
	}
};

Map.prototype.clear = function() {
	var i, l, paths;

	Map.call(this, this.svg);

	paths = this.svg.querySelectorAll('#cantons > path');
	for (i = 0, l = paths.length; i < l; i++) {
		paths[i].style.fill = this.fill();
	}
};

Map.prototype.code = function(id) {
	return mappings[id];
};

Map.prototype.stat = function(code) {
	var stat, num;

	if (this.data.surrogates[code]) {
		return this.data.surrogates[code];
	}

	stat = this.data.stats[code];

	if (null === stat || undefined === stat || '' === stat) {
		return null;
	}

	// The comparison `String(num) === stat` could be used here instead, but then we'd need lots of exceptions for percentage and currency-formatted values like '23%' or '$100'.
	num = parseFloat(stat, 10);
	if (!isNaN(num)) {
		return num;
	}

	return stat;
};

Map.prototype.fill = function(id, scale) {
	var stat, code, stripe = 'url(#stripe)';

	if (!scale || arguments.length < 1) {
		return stripe;
	}

	code = this.code(id);
	stat = this.stat(code);

	// Apply the 'stripe' filter to the path if no data is available.
	if (null === stat) {
		return stripe;
	}

	return scale(stat).hex();
};

Map.prototype.scale = function(brewer, stops, type) {
	var values, scale, paths, i, l, stats = this.data.stats, self = this;

	values = Object.keys(stats).reduce(function(p, c, i, a) {
		var stat = self.stat(c);

		if (null !== stat) {
			p.push(stat);
		}

		return p;
	}, []);

	scale = chroma.scale(brewer);
	if ('linear' !== type) {
		scale.domain(values, stops, type);
	} else {
		scale.domain(values, stops);
	}

	paths = this.svg.querySelectorAll('#cantons > path');
	for (i = 0, l = paths.length; i < l; i++) {
		paths[i].style.fill = this.fill(paths[i].id, scale);
	}
};

Map.prototype.defs = function() {
	var svg = this.svg, pattern, defs, path, svgNs, svgDoc;

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
	path.style.stroke = '#ccc';
	path.style.fill = 'none';
};

Map.prototype.legend = function(scale) {
	var legendEl, colors;

	legendEl = document.createElement('ul');

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

		legendEl.appendChild(colorEl);
	});

	return legendEl;
};

},{"../../json/gadm-mappings.json":12,"chroma-js":10}]},{},[1])
;