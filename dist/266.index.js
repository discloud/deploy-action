exports.id = 266;
exports.ids = [266];
exports.modules = {

/***/ 6110:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	let m;

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	// eslint-disable-next-line no-return-assign
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG') ;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(897)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 897:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(744);
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		const split = (typeof namespaces === 'string' ? namespaces : '')
			.trim()
			.replace(/\s+/g, ',')
			.split(',')
			.filter(Boolean);

		for (const ns of split) {
			if (ns[0] === '-') {
				createDebug.skips.push(ns.slice(1));
			} else {
				createDebug.names.push(ns);
			}
		}
	}

	/**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */
	function matchesTemplate(search, template) {
		let searchIndex = 0;
		let templateIndex = 0;
		let starIndex = -1;
		let matchIndex = 0;

		while (searchIndex < search.length) {
			if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
				// Match character or proceed with wildcard
				if (template[templateIndex] === '*') {
					starIndex = templateIndex;
					matchIndex = searchIndex;
					templateIndex++; // Skip the '*'
				} else {
					searchIndex++;
					templateIndex++;
				}
			} else if (starIndex !== -1) { // eslint-disable-line no-negated-condition
				// Backtrack to the last '*' and try to match more characters
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else {
				return false; // No match
			}
		}

		// Handle trailing '*' in template
		while (templateIndex < template.length && template[templateIndex] === '*') {
			templateIndex++;
		}

		return templateIndex === template.length;
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names,
			...createDebug.skips.map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		for (const skip of createDebug.skips) {
			if (matchesTemplate(name, skip)) {
				return false;
			}
		}

		for (const ns of createDebug.names) {
			if (matchesTemplate(name, ns)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 2830:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(6110);
} else {
	module.exports = __webpack_require__(5108);
}


/***/ }),

/***/ 5108:
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(2018);
const util = __webpack_require__(9023);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(1450);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(897)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),

/***/ 3813:
/***/ ((module) => {

"use strict";


module.exports = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};


/***/ }),

/***/ 7952:
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.L = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.M = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ 744:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 1450:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const os = __webpack_require__(857);
const tty = __webpack_require__(2018);
const hasFlag = __webpack_require__(3813);

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};


/***/ }),

/***/ 6266:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  FileTypeParser: () => (/* binding */ FileTypeParser),
  fileTypeFromBlob: () => (/* reexport */ fileTypeFromBlob),
  fileTypeFromBuffer: () => (/* reexport */ fileTypeFromBuffer),
  fileTypeFromFile: () => (/* binding */ fileTypeFromFile),
  fileTypeFromStream: () => (/* binding */ file_type_fileTypeFromStream),
  fileTypeFromTokenizer: () => (/* reexport */ fileTypeFromTokenizer),
  fileTypeStream: () => (/* binding */ file_type_fileTypeStream),
  supportedExtensions: () => (/* reexport */ supportedExtensions),
  supportedMimeTypes: () => (/* reexport */ supportedMimeTypes)
});

// EXTERNAL MODULE: external "node:stream/web"
var web_ = __webpack_require__(7830);
// EXTERNAL MODULE: external "node:stream"
var external_node_stream_ = __webpack_require__(7075);
// EXTERNAL MODULE: external "node:fs/promises"
var promises_ = __webpack_require__(1455);
;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/Errors.js
const defaultMessages = 'End-Of-Stream';
/**
 * Thrown on read operation of the end of file or stream has been reached
 */
class EndOfStreamError extends Error {
    constructor() {
        super(defaultMessages);
        this.name = "EndOfStreamError";
    }
}
class AbortError extends Error {
    constructor(message = "The operation was aborted") {
        super(message);
        this.name = "AbortError";
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/Deferred.js
class Deferred {
    constructor() {
        this.resolve = () => null;
        this.reject = () => null;
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/AbstractStreamReader.js

class AbstractStreamReader {
    constructor() {
        this.endOfStream = false;
        this.interrupted = false;
        /**
         * Store peeked data
         * @type {Array}
         */
        this.peekQueue = [];
    }
    async peek(uint8Array, mayBeLess = false) {
        const bytesRead = await this.read(uint8Array, mayBeLess);
        this.peekQueue.push(uint8Array.subarray(0, bytesRead)); // Put read data back to peek buffer
        return bytesRead;
    }
    async read(buffer, mayBeLess = false) {
        if (buffer.length === 0) {
            return 0;
        }
        let bytesRead = this.readFromPeekBuffer(buffer);
        if (!this.endOfStream) {
            bytesRead += await this.readRemainderFromStream(buffer.subarray(bytesRead), mayBeLess);
        }
        if (bytesRead === 0 && !mayBeLess) {
            throw new EndOfStreamError();
        }
        return bytesRead;
    }
    /**
     * Read chunk from stream
     * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
     * @returns Number of bytes read
     */
    readFromPeekBuffer(buffer) {
        let remaining = buffer.length;
        let bytesRead = 0;
        // consume peeked data first
        while (this.peekQueue.length > 0 && remaining > 0) {
            const peekData = this.peekQueue.pop(); // Front of queue
            if (!peekData)
                throw new Error('peekData should be defined');
            const lenCopy = Math.min(peekData.length, remaining);
            buffer.set(peekData.subarray(0, lenCopy), bytesRead);
            bytesRead += lenCopy;
            remaining -= lenCopy;
            if (lenCopy < peekData.length) {
                // remainder back to queue
                this.peekQueue.push(peekData.subarray(lenCopy));
            }
        }
        return bytesRead;
    }
    async readRemainderFromStream(buffer, mayBeLess) {
        let bytesRead = 0;
        // Continue reading from stream if required
        while (bytesRead < buffer.length && !this.endOfStream) {
            if (this.interrupted) {
                throw new AbortError();
            }
            const chunkLen = await this.readFromStream(buffer.subarray(bytesRead), mayBeLess);
            if (chunkLen === 0)
                break;
            bytesRead += chunkLen;
        }
        if (!mayBeLess && bytesRead < buffer.length) {
            throw new EndOfStreamError();
        }
        return bytesRead;
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/StreamReader.js



/**
 * Node.js Readable Stream Reader
 * Ref: https://nodejs.org/api/stream.html#readable-streams
 */
class StreamReader extends AbstractStreamReader {
    constructor(s) {
        super();
        this.s = s;
        /**
         * Deferred used for postponed read request (as not data is yet available to read)
         */
        this.deferred = null;
        if (!s.read || !s.once) {
            throw new Error('Expected an instance of stream.Readable');
        }
        this.s.once('end', () => {
            this.endOfStream = true;
            if (this.deferred) {
                this.deferred.resolve(0);
            }
        });
        this.s.once('error', err => this.reject(err));
        this.s.once('close', () => this.abort());
    }
    /**
     * Read chunk from stream
     * @param buffer Target Uint8Array (or Buffer) to store data read from stream in
     * @param mayBeLess - If true, may fill the buffer partially
     * @returns Number of bytes read
     */
    async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0)
            return 0;
        const readBuffer = this.s.read(buffer.length);
        if (readBuffer) {
            buffer.set(readBuffer);
            return readBuffer.length;
        }
        const request = {
            buffer,
            mayBeLess,
            deferred: new Deferred()
        };
        this.deferred = request.deferred;
        this.s.once('readable', () => {
            this.readDeferred(request);
        });
        return request.deferred.promise;
    }
    /**
     * Process deferred read request
     * @param request Deferred read request
     */
    readDeferred(request) {
        const readBuffer = this.s.read(request.buffer.length);
        if (readBuffer) {
            request.buffer.set(readBuffer);
            request.deferred.resolve(readBuffer.length);
            this.deferred = null;
        }
        else {
            this.s.once('readable', () => {
                this.readDeferred(request);
            });
        }
    }
    reject(err) {
        this.interrupted = true;
        if (this.deferred) {
            this.deferred.reject(err);
            this.deferred = null;
        }
    }
    async abort() {
        this.reject(new AbortError());
    }
    async close() {
        return this.abort();
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/WebStreamReader.js

class WebStreamReader extends AbstractStreamReader {
    constructor(reader) {
        super();
        this.reader = reader;
    }
    async abort() {
        return this.close();
    }
    async close() {
        this.reader.releaseLock();
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/WebStreamByobReader.js

/**
 * Read from a WebStream using a BYOB reader
 * Reference: https://nodejs.org/api/webstreams.html#class-readablestreambyobreader
 */
class WebStreamByobReader extends WebStreamReader {
    /**
     * Read from stream
     * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
     * @param mayBeLess - If true, may fill the buffer partially
     * @protected Bytes read
     */
    async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0)
            return 0;
        // @ts-ignore
        const result = await this.reader.read(new Uint8Array(buffer.length), { min: mayBeLess ? undefined : buffer.length });
        if (result.done) {
            this.endOfStream = result.done;
        }
        if (result.value) {
            buffer.set(result.value);
            return result.value.length;
        }
        return 0;
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/WebStreamDefaultReader.js


class WebStreamDefaultReader extends AbstractStreamReader {
    constructor(reader) {
        super();
        this.reader = reader;
        this.buffer = null; // Internal buffer to store excess data
    }
    /**
     * Copy chunk to target, and store the remainder in this.buffer
     */
    writeChunk(target, chunk) {
        const written = Math.min(chunk.length, target.length);
        target.set(chunk.subarray(0, written));
        // Adjust the remainder of the buffer
        if (written < chunk.length) {
            this.buffer = chunk.subarray(written);
        }
        else {
            this.buffer = null;
        }
        return written;
    }
    /**
     * Read from stream
     * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
     * @param mayBeLess - If true, may fill the buffer partially
     * @protected Bytes read
     */
    async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0)
            return 0;
        let totalBytesRead = 0;
        // Serve from the internal buffer first
        if (this.buffer) {
            totalBytesRead += this.writeChunk(buffer, this.buffer);
        }
        // Continue reading from the stream if more data is needed
        while (totalBytesRead < buffer.length && !this.endOfStream) {
            const result = await this.reader.read();
            if (result.done) {
                this.endOfStream = true;
                break;
            }
            if (result.value) {
                totalBytesRead += this.writeChunk(buffer.subarray(totalBytesRead), result.value);
            }
        }
        if (!mayBeLess && totalBytesRead === 0 && this.endOfStream) {
            throw new EndOfStreamError();
        }
        return totalBytesRead;
    }
    abort() {
        this.interrupted = true;
        return this.reader.cancel();
    }
    async close() {
        await this.abort();
        this.reader.releaseLock();
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/WebStreamReaderFactory.js


function makeWebStreamReader(stream) {
    try {
        const reader = stream.getReader({ mode: "byob" });
        if (reader instanceof ReadableStreamDefaultReader) {
            // Fallback to default reader in case `mode: byob` is ignored
            return new WebStreamDefaultReader(reader);
        }
        return new WebStreamByobReader(reader);
    }
    catch (error) {
        if (error instanceof TypeError) {
            // Fallback to default reader in case `mode: byob` rejected by a `TypeError`
            return new WebStreamDefaultReader(stream.getReader());
        }
        throw error;
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/stream/index.js






;// CONCATENATED MODULE: ./node_modules/strtok3/lib/AbstractTokenizer.js

/**
 * Core tokenizer
 */
class AbstractTokenizer {
    /**
     * Constructor
     * @param options Tokenizer options
     * @protected
     */
    constructor(options) {
        this.numBuffer = new Uint8Array(8);
        /**
         * Tokenizer-stream position
         */
        this.position = 0;
        this.onClose = options?.onClose;
        if (options?.abortSignal) {
            options.abortSignal.addEventListener('abort', () => {
                this.abort();
            });
        }
    }
    /**
     * Read a token from the tokenizer-stream
     * @param token - The token to read
     * @param position - If provided, the desired position in the tokenizer-stream
     * @returns Promise with token data
     */
    async readToken(token, position = this.position) {
        const uint8Array = new Uint8Array(token.len);
        const len = await this.readBuffer(uint8Array, { position });
        if (len < token.len)
            throw new EndOfStreamError();
        return token.get(uint8Array, 0);
    }
    /**
     * Peek a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @returns Promise with token data
     */
    async peekToken(token, position = this.position) {
        const uint8Array = new Uint8Array(token.len);
        const len = await this.peekBuffer(uint8Array, { position });
        if (len < token.len)
            throw new EndOfStreamError();
        return token.get(uint8Array, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async readNumber(token) {
        const len = await this.readBuffer(this.numBuffer, { length: token.len });
        if (len < token.len)
            throw new EndOfStreamError();
        return token.get(this.numBuffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async peekNumber(token) {
        const len = await this.peekBuffer(this.numBuffer, { length: token.len });
        if (len < token.len)
            throw new EndOfStreamError();
        return token.get(this.numBuffer, 0);
    }
    /**
     * Ignore number of bytes, advances the pointer in under tokenizer-stream.
     * @param length - Number of bytes to ignore
     * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
     */
    async ignore(length) {
        if (this.fileInfo.size !== undefined) {
            const bytesLeft = this.fileInfo.size - this.position;
            if (length > bytesLeft) {
                this.position += bytesLeft;
                return bytesLeft;
            }
        }
        this.position += length;
        return length;
    }
    async close() {
        await this.abort();
        await this.onClose?.();
    }
    normalizeOptions(uint8Array, options) {
        if (!this.supportsRandomAccess() && options && options.position !== undefined && options.position < this.position) {
            throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
        }
        return {
            ...{
                mayBeLess: false,
                offset: 0,
                length: uint8Array.length,
                position: this.position
            }, ...options
        };
    }
    abort() {
        return Promise.resolve(); // Ignore abort signal
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/ReadStreamTokenizer.js


const maxBufferSize = 256000;
class ReadStreamTokenizer extends AbstractTokenizer {
    /**
     * Constructor
     * @param streamReader stream-reader to read from
     * @param options Tokenizer options
     */
    constructor(streamReader, options) {
        super(options);
        this.streamReader = streamReader;
        this.fileInfo = options?.fileInfo ?? {};
    }
    /**
     * Read buffer from tokenizer
     * @param uint8Array - Target Uint8Array to fill with data read from the tokenizer-stream
     * @param options - Read behaviour options
     * @returns Promise with number of bytes read
     */
    async readBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const skipBytes = normOptions.position - this.position;
        if (skipBytes > 0) {
            await this.ignore(skipBytes);
            return this.readBuffer(uint8Array, options);
        }
        if (skipBytes < 0) {
            throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
        }
        if (normOptions.length === 0) {
            return 0;
        }
        const bytesRead = await this.streamReader.read(uint8Array.subarray(0, normOptions.length), normOptions.mayBeLess);
        this.position += bytesRead;
        if ((!options || !options.mayBeLess) && bytesRead < normOptions.length) {
            throw new EndOfStreamError();
        }
        return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param uint8Array - Uint8Array (or Buffer) to write data to
     * @param options - Read behaviour options
     * @returns Promise with number of bytes peeked
     */
    async peekBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        let bytesRead = 0;
        if (normOptions.position) {
            const skipBytes = normOptions.position - this.position;
            if (skipBytes > 0) {
                const skipBuffer = new Uint8Array(normOptions.length + skipBytes);
                bytesRead = await this.peekBuffer(skipBuffer, { mayBeLess: normOptions.mayBeLess });
                uint8Array.set(skipBuffer.subarray(skipBytes));
                return bytesRead - skipBytes;
            }
            if (skipBytes < 0) {
                throw new Error('Cannot peek from a negative offset in a stream');
            }
        }
        if (normOptions.length > 0) {
            try {
                bytesRead = await this.streamReader.peek(uint8Array.subarray(0, normOptions.length), normOptions.mayBeLess);
            }
            catch (err) {
                if (options?.mayBeLess && err instanceof EndOfStreamError) {
                    return 0;
                }
                throw err;
            }
            if ((!normOptions.mayBeLess) && bytesRead < normOptions.length) {
                throw new EndOfStreamError();
            }
        }
        return bytesRead;
    }
    async ignore(length) {
        // debug(`ignore ${this.position}...${this.position + length - 1}`);
        const bufSize = Math.min(maxBufferSize, length);
        const buf = new Uint8Array(bufSize);
        let totBytesRead = 0;
        while (totBytesRead < length) {
            const remaining = length - totBytesRead;
            const bytesRead = await this.readBuffer(buf, { length: Math.min(bufSize, remaining) });
            if (bytesRead < 0) {
                return bytesRead;
            }
            totBytesRead += bytesRead;
        }
        return totBytesRead;
    }
    abort() {
        return this.streamReader.abort();
    }
    async close() {
        return this.streamReader.close();
    }
    supportsRandomAccess() {
        return false;
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/BufferTokenizer.js


class BufferTokenizer extends AbstractTokenizer {
    /**
     * Construct BufferTokenizer
     * @param uint8Array - Uint8Array to tokenize
     * @param options Tokenizer options
     */
    constructor(uint8Array, options) {
        super(options);
        this.uint8Array = uint8Array;
        this.fileInfo = { ...options?.fileInfo ?? {}, ...{ size: uint8Array.length } };
    }
    /**
     * Read buffer from tokenizer
     * @param uint8Array - Uint8Array to tokenize
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async readBuffer(uint8Array, options) {
        if (options?.position) {
            this.position = options.position;
        }
        const bytesRead = await this.peekBuffer(uint8Array, options);
        this.position += bytesRead;
        return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param uint8Array
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async peekBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const bytes2read = Math.min(this.uint8Array.length - normOptions.position, normOptions.length);
        if ((!normOptions.mayBeLess) && bytes2read < normOptions.length) {
            throw new EndOfStreamError();
        }
        uint8Array.set(this.uint8Array.subarray(normOptions.position, normOptions.position + bytes2read));
        return bytes2read;
    }
    close() {
        return super.close();
    }
    supportsRandomAccess() {
        return true;
    }
    setPosition(position) {
        this.position = position;
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/BlobTokenizer.js


class BlobTokenizer extends AbstractTokenizer {
    /**
     * Construct BufferTokenizer
     * @param blob - Uint8Array to tokenize
     * @param options Tokenizer options
     */
    constructor(blob, options) {
        super(options);
        this.blob = blob;
        this.fileInfo = { ...options?.fileInfo ?? {}, ...{ size: blob.size, mimeType: blob.type } };
    }
    /**
     * Read buffer from tokenizer
     * @param uint8Array - Uint8Array to tokenize
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async readBuffer(uint8Array, options) {
        if (options?.position) {
            this.position = options.position;
        }
        const bytesRead = await this.peekBuffer(uint8Array, options);
        this.position += bytesRead;
        return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async peekBuffer(buffer, options) {
        const normOptions = this.normalizeOptions(buffer, options);
        const bytes2read = Math.min(this.blob.size - normOptions.position, normOptions.length);
        if ((!normOptions.mayBeLess) && bytes2read < normOptions.length) {
            throw new EndOfStreamError();
        }
        const arrayBuffer = await this.blob.slice(normOptions.position, normOptions.position + bytes2read).arrayBuffer();
        buffer.set(new Uint8Array(arrayBuffer));
        return bytes2read;
    }
    close() {
        return super.close();
    }
    supportsRandomAccess() {
        return true;
    }
    setPosition(position) {
        this.position = position;
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/core.js






/**
 * Construct ReadStreamTokenizer from given Stream.
 * Will set fileSize, if provided given Stream has set the .path property/
 * @param stream - Read from Node.js Stream.Readable
 * @param options - Tokenizer options
 * @returns ReadStreamTokenizer
 */
function fromStream(stream, options) {
    const streamReader = new StreamReader(stream);
    const _options = options ?? {};
    const chainedClose = _options.onClose;
    _options.onClose = async () => {
        await streamReader.close();
        if (chainedClose) {
            return chainedClose();
        }
    };
    return new ReadStreamTokenizer(streamReader, _options);
}
/**
 * Construct ReadStreamTokenizer from given ReadableStream (WebStream API).
 * Will set fileSize, if provided given Stream has set the .path property/
 * @param webStream - Read from Node.js Stream.Readable (must be a byte stream)
 * @param options - Tokenizer options
 * @returns ReadStreamTokenizer
 */
function fromWebStream(webStream, options) {
    const webStreamReader = makeWebStreamReader(webStream);
    const _options = options ?? {};
    const chainedClose = _options.onClose;
    _options.onClose = async () => {
        await webStreamReader.close();
        if (chainedClose) {
            return chainedClose();
        }
    };
    return new ReadStreamTokenizer(webStreamReader, _options);
}
/**
 * Construct ReadStreamTokenizer from given Buffer.
 * @param uint8Array - Uint8Array to tokenize
 * @param options - Tokenizer options
 * @returns BufferTokenizer
 */
function fromBuffer(uint8Array, options) {
    return new BufferTokenizer(uint8Array, options);
}
/**
 * Construct ReadStreamTokenizer from given Blob.
 * @param blob - Uint8Array to tokenize
 * @param options - Tokenizer options
 * @returns BufferTokenizer
 */
function fromBlob(blob, options) {
    return new BlobTokenizer(blob, options);
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/FileTokenizer.js



class FileTokenizer extends AbstractTokenizer {
    /**
     * Create tokenizer from provided file path
     * @param sourceFilePath File path
     */
    static async fromFile(sourceFilePath) {
        const fileHandle = await (0,promises_.open)(sourceFilePath, 'r');
        const stat = await fileHandle.stat();
        return new FileTokenizer(fileHandle, { fileInfo: { path: sourceFilePath, size: stat.size } });
    }
    constructor(fileHandle, options) {
        super(options);
        this.fileHandle = fileHandle;
        this.fileInfo = options.fileInfo;
    }
    /**
     * Read buffer from file
     * @param uint8Array - Uint8Array to write result to
     * @param options - Read behaviour options
     * @returns Promise number of bytes read
     */
    async readBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        this.position = normOptions.position;
        if (normOptions.length === 0)
            return 0;
        const res = await this.fileHandle.read(uint8Array, 0, normOptions.length, normOptions.position);
        this.position += res.bytesRead;
        if (res.bytesRead < normOptions.length && (!options || !options.mayBeLess)) {
            throw new EndOfStreamError();
        }
        return res.bytesRead;
    }
    /**
     * Peek buffer from file
     * @param uint8Array - Uint8Array (or Buffer) to write data to
     * @param options - Read behaviour options
     * @returns Promise number of bytes read
     */
    async peekBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const res = await this.fileHandle.read(uint8Array, 0, normOptions.length, normOptions.position);
        if ((!normOptions.mayBeLess) && res.bytesRead < normOptions.length) {
            throw new EndOfStreamError();
        }
        return res.bytesRead;
    }
    async close() {
        await this.fileHandle.close();
        return super.close();
    }
    setPosition(position) {
        this.position = position;
    }
    supportsRandomAccess() {
        return true;
    }
}

;// CONCATENATED MODULE: ./node_modules/strtok3/lib/index.js





/**
 * Construct ReadStreamTokenizer from given Stream.
 * Will set fileSize, if provided given Stream has set the .path property.
 * @param stream - Node.js Stream.Readable
 * @param options - Pass additional file information to the tokenizer
 * @returns Tokenizer
 */
async function lib_fromStream(stream, options) {
    const rst = fromStream(stream, options);
    if (stream.path) {
        const stat = await (0,promises_.stat)(stream.path);
        rst.fileInfo.path = stream.path;
        rst.fileInfo.size = stat.size;
    }
    return rst;
}
const fromFile = FileTokenizer.fromFile;

// EXTERNAL MODULE: ./node_modules/ieee754/index.js
var ieee754 = __webpack_require__(7952);
;// CONCATENATED MODULE: ./node_modules/@borewit/text-codec/lib/index.js
const WINDOWS_1252_EXTRA = {
    0x80: "€", 0x82: "‚", 0x83: "ƒ", 0x84: "„", 0x85: "…", 0x86: "†",
    0x87: "‡", 0x88: "ˆ", 0x89: "‰", 0x8a: "Š", 0x8b: "‹", 0x8c: "Œ",
    0x8e: "Ž", 0x91: "‘", 0x92: "’", 0x93: "“", 0x94: "”", 0x95: "•",
    0x96: "–", 0x97: "—", 0x98: "˜", 0x99: "™", 0x9a: "š", 0x9b: "›",
    0x9c: "œ", 0x9e: "ž", 0x9f: "Ÿ",
};
const WINDOWS_1252_REVERSE = {};
for (const [code, char] of Object.entries(WINDOWS_1252_EXTRA)) {
    WINDOWS_1252_REVERSE[char] = Number.parseInt(code, 10);
}
// ---------- Cached decoders/encoders ----------
let _utf8Decoder;
let _utf8Encoder;
function utf8Decoder() {
    if (typeof globalThis.TextDecoder === "undefined")
        return undefined;
    return (_utf8Decoder !== null && _utf8Decoder !== void 0 ? _utf8Decoder : (_utf8Decoder = new globalThis.TextDecoder("utf-8")));
}
function utf8Encoder() {
    if (typeof globalThis.TextEncoder === "undefined")
        return undefined;
    return (_utf8Encoder !== null && _utf8Encoder !== void 0 ? _utf8Encoder : (_utf8Encoder = new globalThis.TextEncoder()));
}
// Safe chunk size well under your measured ~105k cliff.
// 32k keeps memory reasonable and is plenty fast.
const CHUNK = 32 * 1024;
/**
 * Decode text from binary data
 * @param bytes Binary data
 * @param encoding Encoding
 */
function textDecode(bytes, encoding = "utf-8") {
    switch (encoding.toLowerCase()) {
        case "utf-8":
        case "utf8": {
            const dec = utf8Decoder();
            return dec ? dec.decode(bytes) : decodeUTF8(bytes);
        }
        case "utf-16le":
            return decodeUTF16LE(bytes);
        case "us-ascii":
        case "ascii":
            return decodeASCII(bytes);
        case "latin1":
        case "iso-8859-1":
            return decodeLatin1(bytes);
        case "windows-1252":
            return decodeWindows1252(bytes);
        default:
            throw new RangeError(`Encoding '${encoding}' not supported`);
    }
}
function textEncode(input = "", encoding = "utf-8") {
    switch (encoding.toLowerCase()) {
        case "utf-8":
        case "utf8": {
            const enc = utf8Encoder();
            return enc ? enc.encode(input) : encodeUTF8(input);
        }
        case "utf-16le":
            return encodeUTF16LE(input);
        case "us-ascii":
        case "ascii":
            return encodeASCII(input);
        case "latin1":
        case "iso-8859-1":
            return encodeLatin1(input);
        case "windows-1252":
            return encodeWindows1252(input);
        default:
            throw new RangeError(`Encoding '${encoding}' not supported`);
    }
}
// --- Internal helpers ---
function decodeUTF8(bytes) {
    const parts = [];
    let out = "";
    let i = 0;
    while (i < bytes.length) {
        const b1 = bytes[i++];
        if (b1 < 0x80) {
            out += String.fromCharCode(b1);
        }
        else if (b1 < 0xe0) {
            const b2 = bytes[i++] & 0x3f;
            out += String.fromCharCode(((b1 & 0x1f) << 6) | b2);
        }
        else if (b1 < 0xf0) {
            const b2 = bytes[i++] & 0x3f;
            const b3 = bytes[i++] & 0x3f;
            out += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3);
        }
        else {
            const b2 = bytes[i++] & 0x3f;
            const b3 = bytes[i++] & 0x3f;
            const b4 = bytes[i++] & 0x3f;
            let cp = ((b1 & 0x07) << 18) | (b2 << 12) | (b3 << 6) | b4;
            cp -= 0x10000;
            out += String.fromCharCode(0xd800 + ((cp >> 10) & 0x3ff), 0xdc00 + (cp & 0x3ff));
        }
        if (out.length >= CHUNK) {
            parts.push(out);
            out = "";
        }
    }
    if (out)
        parts.push(out);
    return parts.join("");
}
function decodeUTF16LE(bytes) {
    // Use chunked fromCharCode on 16-bit code units.
    // If odd length, ignore trailing byte (common behavior).
    const len = bytes.length & ~1;
    if (len === 0)
        return "";
    const parts = [];
    // Build a temporary code-unit array per chunk.
    const maxUnits = CHUNK; // CHUNK code units per chunk
    for (let i = 0; i < len;) {
        const unitsThis = Math.min(maxUnits, (len - i) >> 1);
        const units = new Array(unitsThis);
        for (let j = 0; j < unitsThis; j++, i += 2) {
            units[j] = bytes[i] | (bytes[i + 1] << 8);
        }
        parts.push(String.fromCharCode.apply(null, units));
    }
    return parts.join("");
}
function decodeASCII(bytes) {
    // 7-bit ASCII: mask high bit. (Kept to match your original semantics.)
    const parts = [];
    for (let i = 0; i < bytes.length; i += CHUNK) {
        const end = Math.min(bytes.length, i + CHUNK);
        const codes = new Array(end - i);
        for (let j = i, k = 0; j < end; j++, k++) {
            codes[k] = bytes[j] & 0x7f;
        }
        parts.push(String.fromCharCode.apply(null, codes));
    }
    return parts.join("");
}
function decodeLatin1(bytes) {
    // Latin-1 is 0x00..0xFF direct mapping; avoid spread.
    const parts = [];
    for (let i = 0; i < bytes.length; i += CHUNK) {
        const end = Math.min(bytes.length, i + CHUNK);
        const codes = new Array(end - i);
        for (let j = i, k = 0; j < end; j++, k++) {
            codes[k] = bytes[j];
        }
        parts.push(String.fromCharCode.apply(null, codes));
    }
    return parts.join("");
}
function decodeWindows1252(bytes) {
    // Only 0x80..0x9F need mapping; others are direct 1-byte codes.
    const parts = [];
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        const extra = b >= 0x80 && b <= 0x9f ? WINDOWS_1252_EXTRA[b] : undefined;
        out += extra !== null && extra !== void 0 ? extra : String.fromCharCode(b);
        if (out.length >= CHUNK) {
            parts.push(out);
            out = "";
        }
    }
    if (out)
        parts.push(out);
    return parts.join("");
}
function encodeUTF8(str) {
    const out = [];
    for (let i = 0; i < str.length; i++) {
        let cp = str.charCodeAt(i);
        // surrogate pair
        if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < str.length) {
            const lo = str.charCodeAt(i + 1);
            if (lo >= 0xdc00 && lo <= 0xdfff) {
                cp = 0x10000 + ((cp - 0xd800) << 10) + (lo - 0xdc00);
                i++;
            }
        }
        if (cp < 0x80) {
            out.push(cp);
        }
        else if (cp < 0x800) {
            out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
        }
        else if (cp < 0x10000) {
            out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        }
        else {
            out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        }
    }
    return new Uint8Array(out);
}
function encodeUTF16LE(str) {
    const out = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        const o = i * 2;
        out[o] = code & 0xff;
        out[o + 1] = code >>> 8;
    }
    return out;
}
function encodeASCII(str) {
    // 7-bit ASCII: mask high bit
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++)
        out[i] = str.charCodeAt(i) & 0x7f;
    return out;
}
function encodeLatin1(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++)
        out[i] = str.charCodeAt(i) & 0xff;
    return out;
}
function encodeWindows1252(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        const code = ch.charCodeAt(0);
        if (code <= 0xff) {
            out[i] = code;
            continue;
        }
        const mapped = WINDOWS_1252_REVERSE[ch];
        out[i] = mapped !== undefined ? mapped : 0x3f; // '?'
    }
    return out;
}

;// CONCATENATED MODULE: ./node_modules/token-types/lib/index.js


// Primitive types
function dv(array) {
    return new DataView(array.buffer, array.byteOffset);
}
/*
 * 8-bit unsigned integer
 */
const UINT8 = {
    len: 1,
    get(array, offset) {
        return dv(array).getUint8(offset);
    },
    put(array, offset, value) {
        dv(array).setUint8(offset, value);
        return offset + 1;
    }
};
/**
 * 16-bit unsigned integer, Little Endian byte order
 */
const UINT16_LE = {
    len: 2,
    get(array, offset) {
        return dv(array).getUint16(offset, true);
    },
    put(array, offset, value) {
        dv(array).setUint16(offset, value, true);
        return offset + 2;
    }
};
/**
 * 16-bit unsigned integer, Big Endian byte order
 */
const UINT16_BE = {
    len: 2,
    get(array, offset) {
        return dv(array).getUint16(offset);
    },
    put(array, offset, value) {
        dv(array).setUint16(offset, value);
        return offset + 2;
    }
};
/**
 * 24-bit unsigned integer, Little Endian byte order
 */
const UINT24_LE = {
    len: 3,
    get(array, offset) {
        const dataView = dv(array);
        return dataView.getUint8(offset) + (dataView.getUint16(offset + 1, true) << 8);
    },
    put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint8(offset, value & 0xff);
        dataView.setUint16(offset + 1, value >> 8, true);
        return offset + 3;
    }
};
/**
 * 24-bit unsigned integer, Big Endian byte order
 */
const UINT24_BE = {
    len: 3,
    get(array, offset) {
        const dataView = dv(array);
        return (dataView.getUint16(offset) << 8) + dataView.getUint8(offset + 2);
    },
    put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint16(offset, value >> 8);
        dataView.setUint8(offset + 2, value & 0xff);
        return offset + 3;
    }
};
/**
 * 32-bit unsigned integer, Little Endian byte order
 */
const UINT32_LE = {
    len: 4,
    get(array, offset) {
        return dv(array).getUint32(offset, true);
    },
    put(array, offset, value) {
        dv(array).setUint32(offset, value, true);
        return offset + 4;
    }
};
/**
 * 32-bit unsigned integer, Big Endian byte order
 */
const UINT32_BE = {
    len: 4,
    get(array, offset) {
        return dv(array).getUint32(offset);
    },
    put(array, offset, value) {
        dv(array).setUint32(offset, value);
        return offset + 4;
    }
};
/**
 * 8-bit signed integer
 */
const INT8 = {
    len: 1,
    get(array, offset) {
        return dv(array).getInt8(offset);
    },
    put(array, offset, value) {
        dv(array).setInt8(offset, value);
        return offset + 1;
    }
};
/**
 * 16-bit signed integer, Big Endian byte order
 */
const INT16_BE = {
    len: 2,
    get(array, offset) {
        return dv(array).getInt16(offset);
    },
    put(array, offset, value) {
        dv(array).setInt16(offset, value);
        return offset + 2;
    }
};
/**
 * 16-bit signed integer, Little Endian byte order
 */
const INT16_LE = {
    len: 2,
    get(array, offset) {
        return dv(array).getInt16(offset, true);
    },
    put(array, offset, value) {
        dv(array).setInt16(offset, value, true);
        return offset + 2;
    }
};
/**
 * 24-bit signed integer, Little Endian byte order
 */
const INT24_LE = {
    len: 3,
    get(array, offset) {
        const unsigned = UINT24_LE.get(array, offset);
        return unsigned > 0x7fffff ? unsigned - 0x1000000 : unsigned;
    },
    put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint8(offset, value & 0xff);
        dataView.setUint16(offset + 1, value >> 8, true);
        return offset + 3;
    }
};
/**
 * 24-bit signed integer, Big Endian byte order
 */
const INT24_BE = {
    len: 3,
    get(array, offset) {
        const unsigned = UINT24_BE.get(array, offset);
        return unsigned > 0x7fffff ? unsigned - 0x1000000 : unsigned;
    },
    put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint16(offset, value >> 8);
        dataView.setUint8(offset + 2, value & 0xff);
        return offset + 3;
    }
};
/**
 * 32-bit signed integer, Big Endian byte order
 */
const INT32_BE = {
    len: 4,
    get(array, offset) {
        return dv(array).getInt32(offset);
    },
    put(array, offset, value) {
        dv(array).setInt32(offset, value);
        return offset + 4;
    }
};
/**
 * 32-bit signed integer, Big Endian byte order
 */
const INT32_LE = {
    len: 4,
    get(array, offset) {
        return dv(array).getInt32(offset, true);
    },
    put(array, offset, value) {
        dv(array).setInt32(offset, value, true);
        return offset + 4;
    }
};
/**
 * 64-bit unsigned integer, Little Endian byte order
 */
const UINT64_LE = {
    len: 8,
    get(array, offset) {
        return dv(array).getBigUint64(offset, true);
    },
    put(array, offset, value) {
        dv(array).setBigUint64(offset, value, true);
        return offset + 8;
    }
};
/**
 * 64-bit signed integer, Little Endian byte order
 */
const INT64_LE = {
    len: 8,
    get(array, offset) {
        return dv(array).getBigInt64(offset, true);
    },
    put(array, offset, value) {
        dv(array).setBigInt64(offset, value, true);
        return offset + 8;
    }
};
/**
 * 64-bit unsigned integer, Big Endian byte order
 */
const UINT64_BE = {
    len: 8,
    get(array, offset) {
        return dv(array).getBigUint64(offset);
    },
    put(array, offset, value) {
        dv(array).setBigUint64(offset, value);
        return offset + 8;
    }
};
/**
 * 64-bit signed integer, Big Endian byte order
 */
const INT64_BE = {
    len: 8,
    get(array, offset) {
        return dv(array).getBigInt64(offset);
    },
    put(array, offset, value) {
        dv(array).setBigInt64(offset, value);
        return offset + 8;
    }
};
/**
 * IEEE 754 16-bit (half precision) float, big endian
 */
const Float16_BE = {
    len: 2,
    get(dataView, offset) {
        return ieee754/* read */.L(dataView, offset, false, 10, this.len);
    },
    put(dataView, offset, value) {
        ieee754/* write */.M(dataView, value, offset, false, 10, this.len);
        return offset + this.len;
    }
};
/**
 * IEEE 754 16-bit (half precision) float, little endian
 */
const Float16_LE = {
    len: 2,
    get(array, offset) {
        return ieee754/* read */.L(array, offset, true, 10, this.len);
    },
    put(array, offset, value) {
        ieee754/* write */.M(array, value, offset, true, 10, this.len);
        return offset + this.len;
    }
};
/**
 * IEEE 754 32-bit (single precision) float, big endian
 */
const Float32_BE = {
    len: 4,
    get(array, offset) {
        return dv(array).getFloat32(offset);
    },
    put(array, offset, value) {
        dv(array).setFloat32(offset, value);
        return offset + 4;
    }
};
/**
 * IEEE 754 32-bit (single precision) float, little endian
 */
const Float32_LE = {
    len: 4,
    get(array, offset) {
        return dv(array).getFloat32(offset, true);
    },
    put(array, offset, value) {
        dv(array).setFloat32(offset, value, true);
        return offset + 4;
    }
};
/**
 * IEEE 754 64-bit (double precision) float, big endian
 */
const Float64_BE = {
    len: 8,
    get(array, offset) {
        return dv(array).getFloat64(offset);
    },
    put(array, offset, value) {
        dv(array).setFloat64(offset, value);
        return offset + 8;
    }
};
/**
 * IEEE 754 64-bit (double precision) float, little endian
 */
const Float64_LE = {
    len: 8,
    get(array, offset) {
        return dv(array).getFloat64(offset, true);
    },
    put(array, offset, value) {
        dv(array).setFloat64(offset, value, true);
        return offset + 8;
    }
};
/**
 * IEEE 754 80-bit (extended precision) float, big endian
 */
const Float80_BE = {
    len: 10,
    get(array, offset) {
        return ieee754/* read */.L(array, offset, false, 63, this.len);
    },
    put(array, offset, value) {
        ieee754/* write */.M(array, value, offset, false, 63, this.len);
        return offset + this.len;
    }
};
/**
 * IEEE 754 80-bit (extended precision) float, little endian
 */
const Float80_LE = {
    len: 10,
    get(array, offset) {
        return ieee754/* read */.L(array, offset, true, 63, this.len);
    },
    put(array, offset, value) {
        ieee754/* write */.M(array, value, offset, true, 63, this.len);
        return offset + this.len;
    }
};
/**
 * Ignore a given number of bytes
 */
class IgnoreType {
    /**
     * @param len number of bytes to ignore
     */
    constructor(len) {
        this.len = len;
    }
    // ToDo: don't read, but skip data
    get(_array, _off) {
    }
}
class Uint8ArrayType {
    constructor(len) {
        this.len = len;
    }
    get(array, offset) {
        return array.subarray(offset, offset + this.len);
    }
}
/**
 * Consume a fixed number of bytes from the stream and return a string with a specified encoding.
 * Supports all encodings supported by TextDecoder, plus 'windows-1252'.
 */
class StringType {
    constructor(len, encoding) {
        this.len = len;
        this.encoding = encoding;
    }
    get(data, offset = 0) {
        const bytes = data.subarray(offset, offset + this.len);
        return textDecode(bytes, this.encoding);
    }
}
/**
 * ANSI Latin 1 String using Windows-1252 (Code Page 1252)
 * Windows-1252 is a superset of ISO 8859-1 / Latin-1.
 */
class AnsiStringType extends StringType {
    constructor(len) {
        super(len, 'windows-1252');
    }
}

// EXTERNAL MODULE: ./node_modules/debug/src/index.js
var src = __webpack_require__(2830);
;// CONCATENATED MODULE: ./node_modules/@tokenizer/inflate/lib/ZipToken.js
/**
 * Ref https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
 */

const Signature = {
    LocalFileHeader: 0x04034b50,
    DataDescriptor: 0x08074b50,
    CentralFileHeader: 0x02014b50,
    EndOfCentralDirectory: 0x06054b50
};
const DataDescriptor = {
    get(array) {
        return {
            signature: UINT32_LE.get(array, 0),
            compressedSize: UINT32_LE.get(array, 8),
            uncompressedSize: UINT32_LE.get(array, 12),
        };
    }, len: 16
};
/**
 * First part of the ZIP Local File Header
 * Offset | Bytes| Description
 * -------|------+-------------------------------------------------------------------
 *      0 |    4 | Signature (0x04034b50)
 *      4 |    2 | Minimum version needed to extract
 *      6 |    2 | Bit flag
 *      8 |    2 | Compression method
 *     10 |    2 | File last modification time (MS-DOS format)
 *     12 |    2 | File last modification date (MS-DOS format)
 *     14 |    4 | CRC-32 of uncompressed data
 *     18 |    4 | Compressed size
 *     22 |    4 | Uncompressed size
 *     26 |    2 | File name length (n)
 *     28 |    2 | Extra field length (m)
 *     30 |    n | File name
 * 30 + n |    m | Extra field
 */
const LocalFileHeaderToken = {
    get(array) {
        const flags = UINT16_LE.get(array, 6);
        return {
            signature: UINT32_LE.get(array, 0),
            minVersion: UINT16_LE.get(array, 4),
            dataDescriptor: !!(flags & 0x0008),
            compressedMethod: UINT16_LE.get(array, 8),
            compressedSize: UINT32_LE.get(array, 18),
            uncompressedSize: UINT32_LE.get(array, 22),
            filenameLength: UINT16_LE.get(array, 26),
            extraFieldLength: UINT16_LE.get(array, 28),
            filename: null
        };
    }, len: 30
};
/**
 * 4.3.16  End of central directory record:
 *  end of central dir signature (0x06064b50)                                      4 bytes
 *  number of this disk                                                            2 bytes
 *  number of the disk with the start of the central directory                     2 bytes
 *  total number of entries in the central directory on this disk                  2 bytes
 *  total number of entries in the size of the central directory                   2 bytes
 *  sizeOfTheCentralDirectory                                                      4 bytes
 *  offset of start of central directory with respect to the starting disk number  4 bytes
 *  .ZIP file comment length                                                       2 bytes
 *  .ZIP file comment       (variable size)
 */
const EndOfCentralDirectoryRecordToken = {
    get(array) {
        return {
            signature: UINT32_LE.get(array, 0),
            nrOfThisDisk: UINT16_LE.get(array, 4),
            nrOfThisDiskWithTheStart: UINT16_LE.get(array, 6),
            nrOfEntriesOnThisDisk: UINT16_LE.get(array, 8),
            nrOfEntriesOfSize: UINT16_LE.get(array, 10),
            sizeOfCd: UINT32_LE.get(array, 12),
            offsetOfStartOfCd: UINT32_LE.get(array, 16),
            zipFileCommentLength: UINT16_LE.get(array, 20),
        };
    }, len: 22
};
/**
 * File header:
 *    central file header signature   4 bytes   0 (0x02014b50)
 *    version made by                 2 bytes   4
 *    version needed to extract       2 bytes   6
 *    general purpose bit flag        2 bytes   8
 *    compression method              2 bytes  10
 *    last mod file time              2 bytes  12
 *    last mod file date              2 bytes  14
 *    crc-32                          4 bytes  16
 *    compressed size                 4 bytes  20
 *    uncompressed size               4 bytes  24
 *    file name length                2 bytes  28
 *    extra field length              2 bytes  30
 *    file comment length             2 bytes  32
 *    disk number start               2 bytes  34
 *    internal file attributes        2 bytes  36
 *    external file attributes        4 bytes  38
 *    relative offset of local header 4 bytes  42
 */
const FileHeader = {
    get(array) {
        const flags = UINT16_LE.get(array, 8);
        return {
            signature: UINT32_LE.get(array, 0),
            minVersion: UINT16_LE.get(array, 6),
            dataDescriptor: !!(flags & 0x0008),
            compressedMethod: UINT16_LE.get(array, 10),
            compressedSize: UINT32_LE.get(array, 20),
            uncompressedSize: UINT32_LE.get(array, 24),
            filenameLength: UINT16_LE.get(array, 28),
            extraFieldLength: UINT16_LE.get(array, 30),
            fileCommentLength: UINT16_LE.get(array, 32),
            relativeOffsetOfLocalHeader: UINT32_LE.get(array, 42),
            filename: null
        };
    }, len: 46
};

;// CONCATENATED MODULE: ./node_modules/@tokenizer/inflate/lib/ZipHandler.js



function signatureToArray(signature) {
    const signatureBytes = new Uint8Array(UINT32_LE.len);
    UINT32_LE.put(signatureBytes, 0, signature);
    return signatureBytes;
}
const debug = src('tokenizer:inflate');
const syncBufferSize = 256 * 1024;
const ddSignatureArray = signatureToArray(Signature.DataDescriptor);
const eocdSignatureBytes = signatureToArray(Signature.EndOfCentralDirectory);
class ZipHandler {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
        this.syncBuffer = new Uint8Array(syncBufferSize);
    }
    async isZip() {
        return await this.peekSignature() === Signature.LocalFileHeader;
    }
    peekSignature() {
        return this.tokenizer.peekToken(UINT32_LE);
    }
    async findEndOfCentralDirectoryLocator() {
        const randomReadTokenizer = this.tokenizer;
        const chunkLength = Math.min(16 * 1024, randomReadTokenizer.fileInfo.size);
        const buffer = this.syncBuffer.subarray(0, chunkLength);
        await this.tokenizer.readBuffer(buffer, { position: randomReadTokenizer.fileInfo.size - chunkLength });
        // Search the buffer from end to beginning for EOCD signature
        // const signature = 0x06054b50;
        for (let i = buffer.length - 4; i >= 0; i--) {
            // Compare 4 bytes directly without calling readUInt32LE
            if (buffer[i] === eocdSignatureBytes[0] &&
                buffer[i + 1] === eocdSignatureBytes[1] &&
                buffer[i + 2] === eocdSignatureBytes[2] &&
                buffer[i + 3] === eocdSignatureBytes[3]) {
                return randomReadTokenizer.fileInfo.size - chunkLength + i;
            }
        }
        return -1;
    }
    async readCentralDirectory() {
        if (!this.tokenizer.supportsRandomAccess()) {
            debug('Cannot reading central-directory without random-read support');
            return;
        }
        debug('Reading central-directory...');
        const pos = this.tokenizer.position;
        const offset = await this.findEndOfCentralDirectoryLocator();
        if (offset > 0) {
            debug('Central-directory 32-bit signature found');
            const eocdHeader = await this.tokenizer.readToken(EndOfCentralDirectoryRecordToken, offset);
            const files = [];
            this.tokenizer.setPosition(eocdHeader.offsetOfStartOfCd);
            for (let n = 0; n < eocdHeader.nrOfEntriesOfSize; ++n) {
                const entry = await this.tokenizer.readToken(FileHeader);
                if (entry.signature !== Signature.CentralFileHeader) {
                    throw new Error('Expected Central-File-Header signature');
                }
                entry.filename = await this.tokenizer.readToken(new StringType(entry.filenameLength, 'utf-8'));
                await this.tokenizer.ignore(entry.extraFieldLength);
                await this.tokenizer.ignore(entry.fileCommentLength);
                files.push(entry);
                debug(`Add central-directory file-entry: n=${n + 1}/${files.length}: filename=${files[n].filename}`);
            }
            this.tokenizer.setPosition(pos);
            return files;
        }
        this.tokenizer.setPosition(pos);
    }
    async unzip(fileCb) {
        const entries = await this.readCentralDirectory();
        if (entries) {
            // Use Central Directory to iterate over files
            return this.iterateOverCentralDirectory(entries, fileCb);
        }
        // Scan Zip files for local-file-header
        let stop = false;
        do {
            const zipHeader = await this.readLocalFileHeader();
            if (!zipHeader)
                break;
            const next = fileCb(zipHeader);
            stop = !!next.stop;
            let fileData;
            await this.tokenizer.ignore(zipHeader.extraFieldLength);
            if (zipHeader.dataDescriptor && zipHeader.compressedSize === 0) {
                const chunks = [];
                let len = syncBufferSize;
                debug('Compressed-file-size unknown, scanning for next data-descriptor-signature....');
                let nextHeaderIndex = -1;
                while (nextHeaderIndex < 0 && len === syncBufferSize) {
                    len = await this.tokenizer.peekBuffer(this.syncBuffer, { mayBeLess: true });
                    nextHeaderIndex = indexOf(this.syncBuffer.subarray(0, len), ddSignatureArray);
                    const size = nextHeaderIndex >= 0 ? nextHeaderIndex : len;
                    if (next.handler) {
                        const data = new Uint8Array(size);
                        await this.tokenizer.readBuffer(data);
                        chunks.push(data);
                    }
                    else {
                        // Move position to the next header if found, skip the whole buffer otherwise
                        await this.tokenizer.ignore(size);
                    }
                }
                debug(`Found data-descriptor-signature at pos=${this.tokenizer.position}`);
                if (next.handler) {
                    await this.inflate(zipHeader, mergeArrays(chunks), next.handler);
                }
            }
            else {
                if (next.handler) {
                    debug(`Reading compressed-file-data: ${zipHeader.compressedSize} bytes`);
                    fileData = new Uint8Array(zipHeader.compressedSize);
                    await this.tokenizer.readBuffer(fileData);
                    await this.inflate(zipHeader, fileData, next.handler);
                }
                else {
                    debug(`Ignoring compressed-file-data: ${zipHeader.compressedSize} bytes`);
                    await this.tokenizer.ignore(zipHeader.compressedSize);
                }
            }
            debug(`Reading data-descriptor at pos=${this.tokenizer.position}`);
            if (zipHeader.dataDescriptor) {
                // await this.tokenizer.ignore(DataDescriptor.len);
                const dataDescriptor = await this.tokenizer.readToken(DataDescriptor);
                if (dataDescriptor.signature !== 0x08074b50) {
                    throw new Error(`Expected data-descriptor-signature at position ${this.tokenizer.position - DataDescriptor.len}`);
                }
            }
        } while (!stop);
    }
    async iterateOverCentralDirectory(entries, fileCb) {
        for (const fileHeader of entries) {
            const next = fileCb(fileHeader);
            if (next.handler) {
                this.tokenizer.setPosition(fileHeader.relativeOffsetOfLocalHeader);
                const zipHeader = await this.readLocalFileHeader();
                if (zipHeader) {
                    await this.tokenizer.ignore(zipHeader.extraFieldLength);
                    const fileData = new Uint8Array(fileHeader.compressedSize);
                    await this.tokenizer.readBuffer(fileData);
                    await this.inflate(zipHeader, fileData, next.handler);
                }
            }
            if (next.stop)
                break;
        }
    }
    async inflate(zipHeader, fileData, cb) {
        if (zipHeader.compressedMethod === 0) {
            // Stored (uncompressed)
            return cb(fileData);
        }
        if (zipHeader.compressedMethod !== 8) {
            throw new Error(`Unsupported ZIP compression method: ${zipHeader.compressedMethod}`);
        }
        debug(`Decompress filename=${zipHeader.filename}, compressed-size=${fileData.length}`);
        const uncompressedData = await ZipHandler.decompressDeflateRaw(fileData);
        return cb(uncompressedData);
    }
    static async decompressDeflateRaw(data) {
        // Wrap Uint8Array in a ReadableStream without copying
        const input = new ReadableStream({
            start(controller) {
                controller.enqueue(data);
                controller.close();
            }
        });
        const ds = new DecompressionStream("deflate-raw");
        const output = input.pipeThrough(ds);
        try {
            // Collect decompressed bytes from the output stream
            const response = new Response(output);
            const buffer = await response.arrayBuffer();
            return new Uint8Array(buffer);
        }
        catch (err) {
            // Provide ZIP-specific error context
            const message = err instanceof Error
                ? `Failed to deflate ZIP entry: ${err.message}`
                : "Unknown decompression error in ZIP entry";
            throw new TypeError(message);
        }
    }
    async readLocalFileHeader() {
        const signature = await this.tokenizer.peekToken(UINT32_LE);
        if (signature === Signature.LocalFileHeader) {
            const header = await this.tokenizer.readToken(LocalFileHeaderToken);
            header.filename = await this.tokenizer.readToken(new StringType(header.filenameLength, 'utf-8'));
            return header;
        }
        if (signature === Signature.CentralFileHeader) {
            return false;
        }
        if (signature === 0xE011CFD0) {
            throw new Error('Encrypted ZIP');
        }
        throw new Error('Unexpected signature');
    }
}
function indexOf(buffer, portion) {
    const bufferLength = buffer.length;
    const portionLength = portion.length;
    // Return -1 if the portion is longer than the buffer
    if (portionLength > bufferLength)
        return -1;
    // Search for the portion in the buffer
    for (let i = 0; i <= bufferLength - portionLength; i++) {
        let found = true;
        for (let j = 0; j < portionLength; j++) {
            if (buffer[i + j] !== portion[j]) {
                found = false;
                break;
            }
        }
        if (found) {
            return i; // Return the starting offset
        }
    }
    return -1; // Not found
}
function mergeArrays(chunks) {
    // Concatenate chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
    const mergedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        mergedArray.set(chunk, offset);
        offset += chunk.length;
    }
    return mergedArray;
}

;// CONCATENATED MODULE: ./node_modules/@tokenizer/inflate/lib/GzipHandler.js
class GzipHandler {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
    }
    inflate() {
        const tokenizer = this.tokenizer;
        return new ReadableStream({
            async pull(controller) {
                const buffer = new Uint8Array(1024);
                const size = await tokenizer.readBuffer(buffer, { mayBeLess: true });
                if (size === 0) {
                    controller.close();
                    return;
                }
                controller.enqueue(buffer.subarray(0, size));
            }
        }).pipeThrough(new DecompressionStream("gzip"));
    }
}

;// CONCATENATED MODULE: ./node_modules/@tokenizer/inflate/lib/index.js



;// CONCATENATED MODULE: ./node_modules/uint8array-extras/index.js
const objectToString = Object.prototype.toString;
const uint8ArrayStringified = '[object Uint8Array]';
const arrayBufferStringified = '[object ArrayBuffer]';

function isType(value, typeConstructor, typeStringified) {
	if (!value) {
		return false;
	}

	if (value.constructor === typeConstructor) {
		return true;
	}

	return objectToString.call(value) === typeStringified;
}

function isUint8Array(value) {
	return isType(value, Uint8Array, uint8ArrayStringified);
}

function isArrayBuffer(value) {
	return isType(value, ArrayBuffer, arrayBufferStringified);
}

function isUint8ArrayOrArrayBuffer(value) {
	return isUint8Array(value) || isArrayBuffer(value);
}

function assertUint8Array(value) {
	if (!isUint8Array(value)) {
		throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
	}
}

function assertUint8ArrayOrArrayBuffer(value) {
	if (!isUint8ArrayOrArrayBuffer(value)) {
		throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof value}\``);
	}
}

function toUint8Array(value) {
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value);
	}

	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
	}

	throw new TypeError(`Unsupported value, got \`${typeof value}\`.`);
}

function concatUint8Arrays(arrays, totalLength) {
	if (arrays.length === 0) {
		return new Uint8Array(0);
	}

	totalLength ??= arrays.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0);

	const returnValue = new Uint8Array(totalLength);

	let offset = 0;
	for (const array of arrays) {
		assertUint8Array(array);
		returnValue.set(array, offset);
		offset += array.length;
	}

	return returnValue;
}

function areUint8ArraysEqual(a, b) {
	assertUint8Array(a);
	assertUint8Array(b);

	if (a === b) {
		return true;
	}

	if (a.length !== b.length) {
		return false;
	}

	// eslint-disable-next-line unicorn/no-for-loop
	for (let index = 0; index < a.length; index++) {
		if (a[index] !== b[index]) {
			return false;
		}
	}

	return true;
}

function compareUint8Arrays(a, b) {
	assertUint8Array(a);
	assertUint8Array(b);

	const length = Math.min(a.length, b.length);

	for (let index = 0; index < length; index++) {
		const diff = a[index] - b[index];
		if (diff !== 0) {
			return Math.sign(diff);
		}
	}

	// At this point, all the compared elements are equal.
	// The shorter array should come first if the arrays are of different lengths.
	return Math.sign(a.length - b.length);
}

const cachedDecoders = {
	utf8: new globalThis.TextDecoder('utf8'),
};

function uint8ArrayToString(array, encoding = 'utf8') {
	assertUint8ArrayOrArrayBuffer(array);
	cachedDecoders[encoding] ??= new globalThis.TextDecoder(encoding);
	return cachedDecoders[encoding].decode(array);
}

function assertString(value) {
	if (typeof value !== 'string') {
		throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
	}
}

const cachedEncoder = new globalThis.TextEncoder();

function stringToUint8Array(string) {
	assertString(string);
	return cachedEncoder.encode(string);
}

function base64ToBase64Url(base64) {
	return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function base64UrlToBase64(base64url) {
	const base64 = base64url.replaceAll('-', '+').replaceAll('_', '/');
	const padding = (4 - (base64.length % 4)) % 4;
	return base64 + '='.repeat(padding);
}

// Reference: https://phuoc.ng/collection/this-vs-that/concat-vs-push/
// Important: Keep this value divisible by 3 so intermediate chunks produce no Base64 padding.
const MAX_BLOCK_SIZE = 65_535;

function uint8ArrayToBase64(array, {urlSafe = false} = {}) {
	assertUint8Array(array);

	let base64 = '';

	for (let index = 0; index < array.length; index += MAX_BLOCK_SIZE) {
		const chunk = array.subarray(index, index + MAX_BLOCK_SIZE);
		// Required as `btoa` and `atob` don't properly support Unicode: https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
		base64 += globalThis.btoa(String.fromCodePoint.apply(undefined, chunk));
	}

	return urlSafe ? base64ToBase64Url(base64) : base64;
}

function base64ToUint8Array(base64String) {
	assertString(base64String);
	return Uint8Array.from(globalThis.atob(base64UrlToBase64(base64String)), x => x.codePointAt(0));
}

function stringToBase64(string, {urlSafe = false} = {}) {
	assertString(string);
	return uint8ArrayToBase64(stringToUint8Array(string), {urlSafe});
}

function base64ToString(base64String) {
	assertString(base64String);
	return uint8ArrayToString(base64ToUint8Array(base64String));
}

const byteToHexLookupTable = Array.from({length: 256}, (_, index) => index.toString(16).padStart(2, '0'));

function uint8ArrayToHex(array) {
	assertUint8Array(array);

	// Concatenating a string is faster than using an array.
	let hexString = '';

	// eslint-disable-next-line unicorn/no-for-loop -- Max performance is critical.
	for (let index = 0; index < array.length; index++) {
		hexString += byteToHexLookupTable[array[index]];
	}

	return hexString;
}

const hexToDecimalLookupTable = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
	6: 6,
	7: 7,
	8: 8,
	9: 9,
	a: 10,
	b: 11,
	c: 12,
	d: 13,
	e: 14,
	f: 15,
	A: 10,
	B: 11,
	C: 12,
	D: 13,
	E: 14,
	F: 15,
};

function hexToUint8Array(hexString) {
	assertString(hexString);

	if (hexString.length % 2 !== 0) {
		throw new Error('Invalid Hex string length.');
	}

	const resultLength = hexString.length / 2;
	const bytes = new Uint8Array(resultLength);

	for (let index = 0; index < resultLength; index++) {
		const highNibble = hexToDecimalLookupTable[hexString[index * 2]];
		const lowNibble = hexToDecimalLookupTable[hexString[(index * 2) + 1]];

		if (highNibble === undefined || lowNibble === undefined) {
			throw new Error(`Invalid Hex character encountered at position ${index * 2}`);
		}

		bytes[index] = (highNibble << 4) | lowNibble; // eslint-disable-line no-bitwise
	}

	return bytes;
}

/**
@param {DataView} view
@returns {number}
*/
function getUintBE(view) {
	const {byteLength} = view;

	if (byteLength === 6) {
		return (view.getUint16(0) * (2 ** 32)) + view.getUint32(2);
	}

	if (byteLength === 5) {
		return (view.getUint8(0) * (2 ** 32)) + view.getUint32(1);
	}

	if (byteLength === 4) {
		return view.getUint32(0);
	}

	if (byteLength === 3) {
		return (view.getUint8(0) * (2 ** 16)) + view.getUint16(1);
	}

	if (byteLength === 2) {
		return view.getUint16(0);
	}

	if (byteLength === 1) {
		return view.getUint8(0);
	}
}

/**
@param {Uint8Array} array
@param {Uint8Array} value
@returns {number}
*/
function uint8array_extras_indexOf(array, value) {
	const arrayLength = array.length;
	const valueLength = value.length;

	if (valueLength === 0) {
		return -1;
	}

	if (valueLength > arrayLength) {
		return -1;
	}

	const validOffsetLength = arrayLength - valueLength;

	for (let index = 0; index <= validOffsetLength; index++) {
		let isMatch = true;
		for (let index2 = 0; index2 < valueLength; index2++) {
			if (array[index + index2] !== value[index2]) {
				isMatch = false;
				break;
			}
		}

		if (isMatch) {
			return index;
		}
	}

	return -1;
}

/**
@param {Uint8Array} array
@param {Uint8Array} value
@returns {boolean}
*/
function includes(array, value) {
	return uint8array_extras_indexOf(array, value) !== -1;
}

;// CONCATENATED MODULE: ./node_modules/file-type/util.js


function stringToBytes(string, encoding) {
	if (encoding === 'utf-16le') {
		const bytes = [];
		for (let index = 0; index < string.length; index++) {
			const code = string.charCodeAt(index); // eslint-disable-line unicorn/prefer-code-point
			bytes.push(code & 0xFF, (code >> 8) & 0xFF); // High byte
		}

		return bytes;
	}

	if (encoding === 'utf-16be') {
		const bytes = [];
		for (let index = 0; index < string.length; index++) {
			const code = string.charCodeAt(index); // eslint-disable-line unicorn/prefer-code-point
			bytes.push((code >> 8) & 0xFF, code & 0xFF); // Low byte
		}

		return bytes;
	}

	return [...string].map(character => character.charCodeAt(0)); // eslint-disable-line unicorn/prefer-code-point
}

/**
Checks whether the TAR checksum is valid.

@param {Uint8Array} arrayBuffer - The TAR header `[offset ... offset + 512]`.
@param {number} offset - TAR header offset.
@returns {boolean} `true` if the TAR checksum is valid, otherwise `false`.
*/
function tarHeaderChecksumMatches(arrayBuffer, offset = 0) {
	const readSum = Number.parseInt(new StringType(6).get(arrayBuffer, 148).replace(/\0.*$/, '').trim(), 8); // Read sum in header
	if (Number.isNaN(readSum)) {
		return false;
	}

	let sum = 8 * 0x20; // Initialize signed bit sum

	for (let index = offset; index < offset + 148; index++) {
		sum += arrayBuffer[index];
	}

	for (let index = offset + 156; index < offset + 512; index++) {
		sum += arrayBuffer[index];
	}

	return readSum === sum;
}

/**
ID3 UINT32 sync-safe tokenizer token.
28 bits (representing up to 256MB) integer, the msb is 0 to avoid "false syncsignals".
*/
const uint32SyncSafeToken = {
	get: (buffer, offset) => (buffer[offset + 3] & 0x7F) | ((buffer[offset + 2]) << 7) | ((buffer[offset + 1]) << 14) | ((buffer[offset]) << 21),
	len: 4,
};

;// CONCATENATED MODULE: ./node_modules/file-type/supported.js
const extensions = [
	'jpg',
	'png',
	'apng',
	'gif',
	'webp',
	'flif',
	'xcf',
	'cr2',
	'cr3',
	'orf',
	'arw',
	'dng',
	'nef',
	'rw2',
	'raf',
	'tif',
	'bmp',
	'icns',
	'jxr',
	'psd',
	'indd',
	'zip',
	'tar',
	'rar',
	'gz',
	'bz2',
	'7z',
	'dmg',
	'mp4',
	'mid',
	'mkv',
	'webm',
	'mov',
	'avi',
	'mpg',
	'mp2',
	'mp3',
	'm4a',
	'oga',
	'ogg',
	'ogv',
	'opus',
	'flac',
	'wav',
	'spx',
	'amr',
	'pdf',
	'epub',
	'elf',
	'macho',
	'exe',
	'swf',
	'rtf',
	'wasm',
	'woff',
	'woff2',
	'eot',
	'ttf',
	'otf',
	'ttc',
	'ico',
	'flv',
	'ps',
	'xz',
	'sqlite',
	'nes',
	'crx',
	'xpi',
	'cab',
	'deb',
	'ar',
	'rpm',
	'Z',
	'lz',
	'cfb',
	'mxf',
	'mts',
	'blend',
	'bpg',
	'docx',
	'pptx',
	'xlsx',
	'3gp',
	'3g2',
	'j2c',
	'jp2',
	'jpm',
	'jpx',
	'mj2',
	'aif',
	'qcp',
	'odt',
	'ods',
	'odp',
	'xml',
	'mobi',
	'heic',
	'cur',
	'ktx',
	'ape',
	'wv',
	'dcm',
	'ics',
	'glb',
	'pcap',
	'dsf',
	'lnk',
	'alias',
	'voc',
	'ac3',
	'm4v',
	'm4p',
	'm4b',
	'f4v',
	'f4p',
	'f4b',
	'f4a',
	'mie',
	'asf',
	'ogm',
	'ogx',
	'mpc',
	'arrow',
	'shp',
	'aac',
	'mp1',
	'it',
	's3m',
	'xm',
	'skp',
	'avif',
	'eps',
	'lzh',
	'pgp',
	'asar',
	'stl',
	'chm',
	'3mf',
	'zst',
	'jxl',
	'vcf',
	'jls',
	'pst',
	'dwg',
	'parquet',
	'class',
	'arj',
	'cpio',
	'ace',
	'avro',
	'icc',
	'fbx',
	'vsdx',
	'vtt',
	'apk',
	'drc',
	'lz4',
	'potx',
	'xltx',
	'dotx',
	'xltm',
	'ott',
	'ots',
	'otp',
	'odg',
	'otg',
	'xlsm',
	'docm',
	'dotm',
	'potm',
	'pptm',
	'jar',
	'jmp',
	'rm',
	'sav',
	'ppsm',
	'ppsx',
	'tar.gz',
	'reg',
	'dat',
];

const supported_mimeTypes = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/flif',
	'image/x-xcf',
	'image/x-canon-cr2',
	'image/x-canon-cr3',
	'image/tiff',
	'image/bmp',
	'image/vnd.ms-photo',
	'image/vnd.adobe.photoshop',
	'application/x-indesign',
	'application/epub+zip',
	'application/x-xpinstall',
	'application/vnd.ms-powerpoint.slideshow.macroenabled.12',
	'application/vnd.oasis.opendocument.text',
	'application/vnd.oasis.opendocument.spreadsheet',
	'application/vnd.oasis.opendocument.presentation',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
	'application/zip',
	'application/x-tar',
	'application/x-rar-compressed',
	'application/gzip',
	'application/x-bzip2',
	'application/x-7z-compressed',
	'application/x-apple-diskimage',
	'application/vnd.apache.arrow.file',
	'video/mp4',
	'audio/midi',
	'video/matroska',
	'video/webm',
	'video/quicktime',
	'video/vnd.avi',
	'audio/wav',
	'audio/qcelp',
	'audio/x-ms-asf',
	'video/x-ms-asf',
	'application/vnd.ms-asf',
	'video/mpeg',
	'video/3gpp',
	'audio/mpeg',
	'audio/mp4', // RFC 4337
	'video/ogg',
	'audio/ogg',
	'audio/ogg; codecs=opus',
	'application/ogg',
	'audio/flac',
	'audio/ape',
	'audio/wavpack',
	'audio/amr',
	'application/pdf',
	'application/x-elf',
	'application/x-mach-binary',
	'application/x-msdownload',
	'application/x-shockwave-flash',
	'application/rtf',
	'application/wasm',
	'font/woff',
	'font/woff2',
	'application/vnd.ms-fontobject',
	'font/ttf',
	'font/otf',
	'font/collection',
	'image/x-icon',
	'video/x-flv',
	'application/postscript',
	'application/eps',
	'application/x-xz',
	'application/x-sqlite3',
	'application/x-nintendo-nes-rom',
	'application/x-google-chrome-extension',
	'application/vnd.ms-cab-compressed',
	'application/x-deb',
	'application/x-unix-archive',
	'application/x-rpm',
	'application/x-compress',
	'application/x-lzip',
	'application/x-cfb',
	'application/x-mie',
	'application/mxf',
	'video/mp2t',
	'application/x-blender',
	'image/bpg',
	'image/j2c',
	'image/jp2',
	'image/jpx',
	'image/jpm',
	'image/mj2',
	'audio/aiff',
	'application/xml',
	'application/x-mobipocket-ebook',
	'image/heif',
	'image/heif-sequence',
	'image/heic',
	'image/heic-sequence',
	'image/icns',
	'image/ktx',
	'application/dicom',
	'audio/x-musepack',
	'text/calendar',
	'text/vcard',
	'text/vtt',
	'model/gltf-binary',
	'application/vnd.tcpdump.pcap',
	'audio/x-dsf', // Non-standard
	'application/x.ms.shortcut', // Invented by us
	'application/x.apple.alias', // Invented by us
	'audio/x-voc',
	'audio/vnd.dolby.dd-raw',
	'audio/x-m4a',
	'image/apng',
	'image/x-olympus-orf',
	'image/x-sony-arw',
	'image/x-adobe-dng',
	'image/x-nikon-nef',
	'image/x-panasonic-rw2',
	'image/x-fujifilm-raf',
	'video/x-m4v',
	'video/3gpp2',
	'application/x-esri-shape',
	'audio/aac',
	'audio/x-it',
	'audio/x-s3m',
	'audio/x-xm',
	'video/MP1S',
	'video/MP2P',
	'application/vnd.sketchup.skp',
	'image/avif',
	'application/x-lzh-compressed',
	'application/pgp-encrypted',
	'application/x-asar',
	'model/stl',
	'application/vnd.ms-htmlhelp',
	'model/3mf',
	'image/jxl',
	'application/zstd',
	'image/jls',
	'application/vnd.ms-outlook',
	'image/vnd.dwg',
	'application/vnd.apache.parquet',
	'application/java-vm',
	'application/x-arj',
	'application/x-cpio',
	'application/x-ace-compressed',
	'application/avro',
	'application/vnd.iccprofile',
	'application/x.autodesk.fbx', // Invented by us
	'application/vnd.visio',
	'application/vnd.android.package-archive',
	'application/vnd.google.draco', // Invented by us
	'application/x-lz4', // Invented by us
	'application/vnd.openxmlformats-officedocument.presentationml.template',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
	'application/vnd.ms-excel.template.macroenabled.12',
	'application/vnd.oasis.opendocument.text-template',
	'application/vnd.oasis.opendocument.spreadsheet-template',
	'application/vnd.oasis.opendocument.presentation-template',
	'application/vnd.oasis.opendocument.graphics',
	'application/vnd.oasis.opendocument.graphics-template',
	'application/vnd.ms-excel.sheet.macroenabled.12',
	'application/vnd.ms-word.document.macroenabled.12',
	'application/vnd.ms-word.template.macroenabled.12',
	'application/vnd.ms-powerpoint.template.macroenabled.12',
	'application/vnd.ms-powerpoint.presentation.macroenabled.12',
	'application/java-archive',
	'application/vnd.rn-realmedia',
	'application/x-spss-sav',
	'application/x-ms-regedit',
	'application/x-ft-windows-registry-hive',
	'application/x-jmp-data',
];

;// CONCATENATED MODULE: ./node_modules/file-type/core.js
/**
Primary entry point, Node.js specific entry point is index.js
*/








const reasonableDetectionSizeInBytes = 4100; // A fair amount of file-types are detectable within this range.

async function fileTypeFromStream(stream, options) {
	return new core_FileTypeParser(options).fromStream(stream);
}

async function fileTypeFromBuffer(input, options) {
	return new core_FileTypeParser(options).fromBuffer(input);
}

async function fileTypeFromBlob(blob, options) {
	return new core_FileTypeParser(options).fromBlob(blob);
}

function getFileTypeFromMimeType(mimeType) {
	mimeType = mimeType.toLowerCase();
	switch (mimeType) {
		case 'application/epub+zip':
			return {
				ext: 'epub',
				mime: mimeType,
			};
		case 'application/vnd.oasis.opendocument.text':
			return {
				ext: 'odt',
				mime: mimeType,
			};
		case 'application/vnd.oasis.opendocument.text-template':
			return {
				ext: 'ott',
				mime: mimeType,
			};
		case 'application/vnd.oasis.opendocument.spreadsheet':
			return {
				ext: 'ods',
				mime: mimeType,
			};
		case 'application/vnd.oasis.opendocument.spreadsheet-template':
			return {
				ext: 'ots',
				mime: mimeType,
			};
		case 'application/vnd.oasis.opendocument.presentation':
			return {
				ext: 'odp',
				mime: mimeType,
			};
		case 'application/vnd.oasis.opendocument.presentation-template':
			return {
				ext: 'otp',
				mime: mimeType,
			};
		case 'application/vnd.oasis.opendocument.graphics':
			return {
				ext: 'odg',
				mime: mimeType,
			};
		case 'application/vnd.oasis.opendocument.graphics-template':
			return {
				ext: 'otg',
				mime: mimeType,
			};
		case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
			return {
				ext: 'ppsx',
				mime: mimeType,
			};
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
			return {
				ext: 'xlsx',
				mime: mimeType,
			};
		case 'application/vnd.ms-excel.sheet.macroenabled':
			return {
				ext: 'xlsm',
				mime: 'application/vnd.ms-excel.sheet.macroenabled.12',
			};
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
			return {
				ext: 'xltx',
				mime: mimeType,
			};
		case 'application/vnd.ms-excel.template.macroenabled':
			return {
				ext: 'xltm',
				mime: 'application/vnd.ms-excel.template.macroenabled.12',
			};
		case 'application/vnd.ms-powerpoint.slideshow.macroenabled':
			return {
				ext: 'ppsm',
				mime: 'application/vnd.ms-powerpoint.slideshow.macroenabled.12',
			};
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
			return {
				ext: 'docx',
				mime: mimeType,
			};
		case 'application/vnd.ms-word.document.macroenabled':
			return {
				ext: 'docm',
				mime: 'application/vnd.ms-word.document.macroenabled.12',
			};
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
			return {
				ext: 'dotx',
				mime: mimeType,
			};
		case 'application/vnd.ms-word.template.macroenabledtemplate':
			return {
				ext: 'dotm',
				mime: 'application/vnd.ms-word.template.macroenabled.12',
			};
		case 'application/vnd.openxmlformats-officedocument.presentationml.template':
			return {
				ext: 'potx',
				mime: mimeType,
			};
		case 'application/vnd.ms-powerpoint.template.macroenabled':
			return {
				ext: 'potm',
				mime: 'application/vnd.ms-powerpoint.template.macroenabled.12',
			};
		case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
			return {
				ext: 'pptx',
				mime: mimeType,
			};
		case 'application/vnd.ms-powerpoint.presentation.macroenabled':
			return {
				ext: 'pptm',
				mime: 'application/vnd.ms-powerpoint.presentation.macroenabled.12',
			};
		case 'application/vnd.ms-visio.drawing':
			return {
				ext: 'vsdx',
				mime: 'application/vnd.visio',
			};
		case 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml':
			return {
				ext: '3mf',
				mime: 'model/3mf',
			};
		default:
	}
}

function _check(buffer, headers, options) {
	options = {
		offset: 0,
		...options,
	};

	for (const [index, header] of headers.entries()) {
		// If a bitmask is set
		if (options.mask) {
			// If header doesn't equal `buf` with bits masked off
			if (header !== (options.mask[index] & buffer[index + options.offset])) {
				return false;
			}
		} else if (header !== buffer[index + options.offset]) {
			return false;
		}
	}

	return true;
}

async function fileTypeFromTokenizer(tokenizer, options) {
	return new core_FileTypeParser(options).fromTokenizer(tokenizer);
}

async function fileTypeStream(webStream, options) {
	return new core_FileTypeParser(options).toDetectionStream(webStream, options);
}

class core_FileTypeParser {
	constructor(options) {
		this.options = {
			mpegOffsetTolerance: 0,
			...options,
		};

		this.detectors = [...(options?.customDetectors ?? []),
			{id: 'core', detect: this.detectConfident},
			{id: 'core.imprecise', detect: this.detectImprecise}];
		this.tokenizerOptions = {
			abortSignal: options?.signal,
		};
	}

	async fromTokenizer(tokenizer) {
		const initialPosition = tokenizer.position;

		// Iterate through all file-type detectors
		for (const detector of this.detectors) {
			const fileType = await detector.detect(tokenizer);
			if (fileType) {
				return fileType;
			}

			if (initialPosition !== tokenizer.position) {
				return undefined; // Cannot proceed scanning of the tokenizer is at an arbitrary position
			}
		}
	}

	async fromBuffer(input) {
		if (!(input instanceof Uint8Array || input instanceof ArrayBuffer)) {
			throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof input}\``);
		}

		const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);

		if (!(buffer?.length > 1)) {
			return;
		}

		return this.fromTokenizer(fromBuffer(buffer, this.tokenizerOptions));
	}

	async fromBlob(blob) {
		const tokenizer = fromBlob(blob, this.tokenizerOptions);
		try {
			return await this.fromTokenizer(tokenizer);
		} finally {
			await tokenizer.close();
		}
	}

	async fromStream(stream) {
		const tokenizer = fromWebStream(stream, this.tokenizerOptions);
		try {
			return await this.fromTokenizer(tokenizer);
		} finally {
			await tokenizer.close();
		}
	}

	async toDetectionStream(stream, options) {
		const {sampleSize = reasonableDetectionSizeInBytes} = options;
		let detectedFileType;
		let firstChunk;

		const reader = stream.getReader({mode: 'byob'});
		try {
			// Read the first chunk from the stream
			const {value: chunk, done} = await reader.read(new Uint8Array(sampleSize));
			firstChunk = chunk;
			if (!done && chunk) {
				try {
					// Attempt to detect the file type from the chunk
					detectedFileType = await this.fromBuffer(chunk.subarray(0, sampleSize));
				} catch (error) {
					if (!(error instanceof EndOfStreamError)) {
						throw error; // Re-throw non-EndOfStreamError
					}

					detectedFileType = undefined;
				}
			}

			firstChunk = chunk;
		} finally {
			reader.releaseLock(); // Ensure the reader is released
		}

		// Create a new ReadableStream to manage locking issues
		const transformStream = new TransformStream({
			async start(controller) {
				controller.enqueue(firstChunk); // Enqueue the initial chunk
			},
			transform(chunk, controller) {
				// Pass through the chunks without modification
				controller.enqueue(chunk);
			},
		});

		const newStream = stream.pipeThrough(transformStream);
		newStream.fileType = detectedFileType;

		return newStream;
	}

	check(header, options) {
		return _check(this.buffer, header, options);
	}

	checkString(header, options) {
		return this.check(stringToBytes(header, options?.encoding), options);
	}

	// Detections with a high degree of certainty in identifying the correct file type
	detectConfident = async tokenizer => {
		this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);

		// Keep reading until EOF if the file size is unknown.
		if (tokenizer.fileInfo.size === undefined) {
			tokenizer.fileInfo.size = Number.MAX_SAFE_INTEGER;
		}

		this.tokenizer = tokenizer;

		await tokenizer.peekBuffer(this.buffer, {length: 32, mayBeLess: true});

		// -- 2-byte signatures --

		if (this.check([0x42, 0x4D])) {
			return {
				ext: 'bmp',
				mime: 'image/bmp',
			};
		}

		if (this.check([0x0B, 0x77])) {
			return {
				ext: 'ac3',
				mime: 'audio/vnd.dolby.dd-raw',
			};
		}

		if (this.check([0x78, 0x01])) {
			return {
				ext: 'dmg',
				mime: 'application/x-apple-diskimage',
			};
		}

		if (this.check([0x4D, 0x5A])) {
			return {
				ext: 'exe',
				mime: 'application/x-msdownload',
			};
		}

		if (this.check([0x25, 0x21])) {
			await tokenizer.peekBuffer(this.buffer, {length: 24, mayBeLess: true});

			if (
				this.checkString('PS-Adobe-', {offset: 2})
				&& this.checkString(' EPSF-', {offset: 14})
			) {
				return {
					ext: 'eps',
					mime: 'application/eps',
				};
			}

			return {
				ext: 'ps',
				mime: 'application/postscript',
			};
		}

		if (
			this.check([0x1F, 0xA0])
			|| this.check([0x1F, 0x9D])
		) {
			return {
				ext: 'Z',
				mime: 'application/x-compress',
			};
		}

		if (this.check([0xC7, 0x71])) {
			return {
				ext: 'cpio',
				mime: 'application/x-cpio',
			};
		}

		if (this.check([0x60, 0xEA])) {
			return {
				ext: 'arj',
				mime: 'application/x-arj',
			};
		}

		// -- 3-byte signatures --

		if (this.check([0xEF, 0xBB, 0xBF])) { // UTF-8-BOM
			// Strip off UTF-8-BOM
			this.tokenizer.ignore(3);
			return this.detectConfident(tokenizer);
		}

		if (this.check([0x47, 0x49, 0x46])) {
			return {
				ext: 'gif',
				mime: 'image/gif',
			};
		}

		if (this.check([0x49, 0x49, 0xBC])) {
			return {
				ext: 'jxr',
				mime: 'image/vnd.ms-photo',
			};
		}

		if (this.check([0x1F, 0x8B, 0x8])) {
			const gzipHandler = new GzipHandler(tokenizer);

			const stream = gzipHandler.inflate();
			let shouldCancelStream = true;
			try {
				let compressedFileType;
				try {
					compressedFileType = await this.fromStream(stream);
				} catch {
					shouldCancelStream = false;
				}

				if (compressedFileType && compressedFileType.ext === 'tar') {
					return {
						ext: 'tar.gz',
						mime: 'application/gzip',
					};
				}
			} finally {
				if (shouldCancelStream) {
					await stream.cancel();
				}
			}

			return {
				ext: 'gz',
				mime: 'application/gzip',
			};
		}

		if (this.check([0x42, 0x5A, 0x68])) {
			return {
				ext: 'bz2',
				mime: 'application/x-bzip2',
			};
		}

		if (this.checkString('ID3')) {
			await tokenizer.ignore(6); // Skip ID3 header until the header size
			const id3HeaderLength = await tokenizer.readToken(uint32SyncSafeToken);
			if (tokenizer.position + id3HeaderLength > tokenizer.fileInfo.size) {
				// Guess file type based on ID3 header for backward compatibility
				return {
					ext: 'mp3',
					mime: 'audio/mpeg',
				};
			}

			await tokenizer.ignore(id3HeaderLength);
			return this.fromTokenizer(tokenizer); // Skip ID3 header, recursion
		}

		// Musepack, SV7
		if (this.checkString('MP+')) {
			return {
				ext: 'mpc',
				mime: 'audio/x-musepack',
			};
		}

		if (
			(this.buffer[0] === 0x43 || this.buffer[0] === 0x46)
			&& this.check([0x57, 0x53], {offset: 1})
		) {
			return {
				ext: 'swf',
				mime: 'application/x-shockwave-flash',
			};
		}

		// -- 4-byte signatures --

		// Requires a sample size of 4 bytes
		if (this.check([0xFF, 0xD8, 0xFF])) {
			if (this.check([0xF7], {offset: 3})) { // JPG7/SOF55, indicating a ISO/IEC 14495 / JPEG-LS file
				return {
					ext: 'jls',
					mime: 'image/jls',
				};
			}

			return {
				ext: 'jpg',
				mime: 'image/jpeg',
			};
		}

		if (this.check([0x4F, 0x62, 0x6A, 0x01])) {
			return {
				ext: 'avro',
				mime: 'application/avro',
			};
		}

		if (this.checkString('FLIF')) {
			return {
				ext: 'flif',
				mime: 'image/flif',
			};
		}

		if (this.checkString('8BPS')) {
			return {
				ext: 'psd',
				mime: 'image/vnd.adobe.photoshop',
			};
		}

		// Musepack, SV8
		if (this.checkString('MPCK')) {
			return {
				ext: 'mpc',
				mime: 'audio/x-musepack',
			};
		}

		if (this.checkString('FORM')) {
			return {
				ext: 'aif',
				mime: 'audio/aiff',
			};
		}

		if (this.checkString('icns', {offset: 0})) {
			return {
				ext: 'icns',
				mime: 'image/icns',
			};
		}

		// Zip-based file formats
		// Need to be before the `zip` check
		if (this.check([0x50, 0x4B, 0x3, 0x4])) { // Local file header signature
			let fileType;
			await new ZipHandler(tokenizer).unzip(zipHeader => {
				switch (zipHeader.filename) {
					case 'META-INF/mozilla.rsa':
						fileType = {
							ext: 'xpi',
							mime: 'application/x-xpinstall',
						};
						return {
							stop: true,
						};
					case 'META-INF/MANIFEST.MF':
						fileType = {
							ext: 'jar',
							mime: 'application/java-archive',
						};
						return {
							stop: true,
						};
					case 'mimetype':
						return {
							async handler(fileData) {
								// Use TextDecoder to decode the UTF-8 encoded data
								const mimeType = new TextDecoder('utf-8').decode(fileData).trim();
								fileType = getFileTypeFromMimeType(mimeType);
							},
							stop: true,
						};

					case '[Content_Types].xml':
						return {
							async handler(fileData) {
								// Use TextDecoder to decode the UTF-8 encoded data
								let xmlContent = new TextDecoder('utf-8').decode(fileData);
								const endPos = xmlContent.indexOf('.main+xml"');
								if (endPos === -1) {
									const mimeType = 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml';
									if (xmlContent.includes(`ContentType="${mimeType}"`)) {
										fileType = getFileTypeFromMimeType(mimeType);
									}
								} else {
									xmlContent = xmlContent.slice(0, Math.max(0, endPos));
									const firstPos = xmlContent.lastIndexOf('"');
									const mimeType = xmlContent.slice(Math.max(0, firstPos + 1));
									fileType = getFileTypeFromMimeType(mimeType);
								}
							},
							stop: true,
						};
					default:
						if (/classes\d*\.dex/.test(zipHeader.filename)) {
							fileType = {
								ext: 'apk',
								mime: 'application/vnd.android.package-archive',
							};
							return {stop: true};
						}

						return {};
				}
			}).catch(error => {
				if (!(error instanceof EndOfStreamError)) {
					throw error; // Re-throw non-EndOfStreamError
				}
			});

			return fileType ?? {
				ext: 'zip',
				mime: 'application/zip',
			};
		}

		if (this.checkString('OggS')) {
			// This is an OGG container
			await tokenizer.ignore(28);
			const type = new Uint8Array(8);
			await tokenizer.readBuffer(type);

			// Needs to be before `ogg` check
			if (_check(type, [0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64])) {
				return {
					ext: 'opus',
					mime: 'audio/ogg; codecs=opus',
				};
			}

			// If ' theora' in header.
			if (_check(type, [0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61])) {
				return {
					ext: 'ogv',
					mime: 'video/ogg',
				};
			}

			// If '\x01video' in header.
			if (_check(type, [0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00])) {
				return {
					ext: 'ogm',
					mime: 'video/ogg',
				};
			}

			// If ' FLAC' in header  https://xiph.org/flac/faq.html
			if (_check(type, [0x7F, 0x46, 0x4C, 0x41, 0x43])) {
				return {
					ext: 'oga',
					mime: 'audio/ogg',
				};
			}

			// 'Speex  ' in header https://en.wikipedia.org/wiki/Speex
			if (_check(type, [0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20])) {
				return {
					ext: 'spx',
					mime: 'audio/ogg',
				};
			}

			// If '\x01vorbis' in header
			if (_check(type, [0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73])) {
				return {
					ext: 'ogg',
					mime: 'audio/ogg',
				};
			}

			// Default OGG container https://www.iana.org/assignments/media-types/application/ogg
			return {
				ext: 'ogx',
				mime: 'application/ogg',
			};
		}

		if (
			this.check([0x50, 0x4B])
			&& (this.buffer[2] === 0x3 || this.buffer[2] === 0x5 || this.buffer[2] === 0x7)
			&& (this.buffer[3] === 0x4 || this.buffer[3] === 0x6 || this.buffer[3] === 0x8)
		) {
			return {
				ext: 'zip',
				mime: 'application/zip',
			};
		}

		if (this.checkString('MThd')) {
			return {
				ext: 'mid',
				mime: 'audio/midi',
			};
		}

		if (
			this.checkString('wOFF')
			&& (
				this.check([0x00, 0x01, 0x00, 0x00], {offset: 4})
				|| this.checkString('OTTO', {offset: 4})
			)
		) {
			return {
				ext: 'woff',
				mime: 'font/woff',
			};
		}

		if (
			this.checkString('wOF2')
			&& (
				this.check([0x00, 0x01, 0x00, 0x00], {offset: 4})
				|| this.checkString('OTTO', {offset: 4})
			)
		) {
			return {
				ext: 'woff2',
				mime: 'font/woff2',
			};
		}

		if (this.check([0xD4, 0xC3, 0xB2, 0xA1]) || this.check([0xA1, 0xB2, 0xC3, 0xD4])) {
			return {
				ext: 'pcap',
				mime: 'application/vnd.tcpdump.pcap',
			};
		}

		// Sony DSD Stream File (DSF)
		if (this.checkString('DSD ')) {
			return {
				ext: 'dsf',
				mime: 'audio/x-dsf', // Non-standard
			};
		}

		if (this.checkString('LZIP')) {
			return {
				ext: 'lz',
				mime: 'application/x-lzip',
			};
		}

		if (this.checkString('fLaC')) {
			return {
				ext: 'flac',
				mime: 'audio/flac',
			};
		}

		if (this.check([0x42, 0x50, 0x47, 0xFB])) {
			return {
				ext: 'bpg',
				mime: 'image/bpg',
			};
		}

		if (this.checkString('wvpk')) {
			return {
				ext: 'wv',
				mime: 'audio/wavpack',
			};
		}

		if (this.checkString('%PDF')) {
			// Assume this is just a normal PDF
			return {
				ext: 'pdf',
				mime: 'application/pdf',
			};
		}

		if (this.check([0x00, 0x61, 0x73, 0x6D])) {
			return {
				ext: 'wasm',
				mime: 'application/wasm',
			};
		}

		// TIFF, little-endian type
		if (this.check([0x49, 0x49])) {
			const fileType = await this.readTiffHeader(false);
			if (fileType) {
				return fileType;
			}
		}

		// TIFF, big-endian type
		if (this.check([0x4D, 0x4D])) {
			const fileType = await this.readTiffHeader(true);
			if (fileType) {
				return fileType;
			}
		}

		if (this.checkString('MAC ')) {
			return {
				ext: 'ape',
				mime: 'audio/ape',
			};
		}

		// https://github.com/file/file/blob/master/magic/Magdir/matroska
		if (this.check([0x1A, 0x45, 0xDF, 0xA3])) { // Root element: EBML
			async function readField() {
				const msb = await tokenizer.peekNumber(UINT8);
				let mask = 0x80;
				let ic = 0; // 0 = A, 1 = B, 2 = C, 3 = D

				while ((msb & mask) === 0 && mask !== 0) {
					++ic;
					mask >>= 1;
				}

				const id = new Uint8Array(ic + 1);
				await tokenizer.readBuffer(id);
				return id;
			}

			async function readElement() {
				const idField = await readField();
				const lengthField = await readField();

				lengthField[0] ^= 0x80 >> (lengthField.length - 1);
				const nrLength = Math.min(6, lengthField.length); // JavaScript can max read 6 bytes integer

				const idView = new DataView(idField.buffer);
				const lengthView = new DataView(lengthField.buffer, lengthField.length - nrLength, nrLength);

				return {
					id: getUintBE(idView),
					len: getUintBE(lengthView),
				};
			}

			async function readChildren(children) {
				while (children > 0) {
					const element = await readElement();
					if (element.id === 0x42_82) {
						const rawValue = await tokenizer.readToken(new StringType(element.len));
						return rawValue.replaceAll(/\00.*$/g, ''); // Return DocType
					}

					await tokenizer.ignore(element.len); // ignore payload
					--children;
				}
			}

			const re = await readElement();
			const documentType = await readChildren(re.len);

			switch (documentType) {
				case 'webm':
					return {
						ext: 'webm',
						mime: 'video/webm',
					};

				case 'matroska':
					return {
						ext: 'mkv',
						mime: 'video/matroska',
					};

				default:
					return;
			}
		}

		if (this.checkString('SQLi')) {
			return {
				ext: 'sqlite',
				mime: 'application/x-sqlite3',
			};
		}

		if (this.check([0x4E, 0x45, 0x53, 0x1A])) {
			return {
				ext: 'nes',
				mime: 'application/x-nintendo-nes-rom',
			};
		}

		if (this.checkString('Cr24')) {
			return {
				ext: 'crx',
				mime: 'application/x-google-chrome-extension',
			};
		}

		if (
			this.checkString('MSCF')
			|| this.checkString('ISc(')
		) {
			return {
				ext: 'cab',
				mime: 'application/vnd.ms-cab-compressed',
			};
		}

		if (this.check([0xED, 0xAB, 0xEE, 0xDB])) {
			return {
				ext: 'rpm',
				mime: 'application/x-rpm',
			};
		}

		if (this.check([0xC5, 0xD0, 0xD3, 0xC6])) {
			return {
				ext: 'eps',
				mime: 'application/eps',
			};
		}

		if (this.check([0x28, 0xB5, 0x2F, 0xFD])) {
			return {
				ext: 'zst',
				mime: 'application/zstd',
			};
		}

		if (this.check([0x7F, 0x45, 0x4C, 0x46])) {
			return {
				ext: 'elf',
				mime: 'application/x-elf',
			};
		}

		if (this.check([0x21, 0x42, 0x44, 0x4E])) {
			return {
				ext: 'pst',
				mime: 'application/vnd.ms-outlook',
			};
		}

		if (this.checkString('PAR1') || this.checkString('PARE')) {
			return {
				ext: 'parquet',
				mime: 'application/vnd.apache.parquet',
			};
		}

		if (this.checkString('ttcf')) {
			return {
				ext: 'ttc',
				mime: 'font/collection',
			};
		}

		if (
			this.check([0xFE, 0xED, 0xFA, 0xCE]) // 32-bit, big-endian
			|| this.check([0xFE, 0xED, 0xFA, 0xCF]) // 64-bit, big-endian
			|| this.check([0xCE, 0xFA, 0xED, 0xFE]) // 32-bit, little-endian
			|| this.check([0xCF, 0xFA, 0xED, 0xFE]) // 64-bit, little-endian
		) {
			return {
				ext: 'macho',
				mime: 'application/x-mach-binary',
			};
		}

		if (this.check([0x04, 0x22, 0x4D, 0x18])) {
			return {
				ext: 'lz4',
				mime: 'application/x-lz4', // Invented by us
			};
		}

		if (this.checkString('regf')) {
			return {
				ext: 'dat',
				mime: 'application/x-ft-windows-registry-hive',
			};
		}

		// SPSS Statistical Data File
		if (this.checkString('$FL2') || this.checkString('$FL3')) {
			return {
				ext: 'sav',
				mime: 'application/x-spss-sav',
			};
		}

		// -- 5-byte signatures --

		if (this.check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
			return {
				ext: 'otf',
				mime: 'font/otf',
			};
		}

		if (this.checkString('#!AMR')) {
			return {
				ext: 'amr',
				mime: 'audio/amr',
			};
		}

		if (this.checkString('{\\rtf')) {
			return {
				ext: 'rtf',
				mime: 'application/rtf',
			};
		}

		if (this.check([0x46, 0x4C, 0x56, 0x01])) {
			return {
				ext: 'flv',
				mime: 'video/x-flv',
			};
		}

		if (this.checkString('IMPM')) {
			return {
				ext: 'it',
				mime: 'audio/x-it',
			};
		}

		if (
			this.checkString('-lh0-', {offset: 2})
			|| this.checkString('-lh1-', {offset: 2})
			|| this.checkString('-lh2-', {offset: 2})
			|| this.checkString('-lh3-', {offset: 2})
			|| this.checkString('-lh4-', {offset: 2})
			|| this.checkString('-lh5-', {offset: 2})
			|| this.checkString('-lh6-', {offset: 2})
			|| this.checkString('-lh7-', {offset: 2})
			|| this.checkString('-lzs-', {offset: 2})
			|| this.checkString('-lz4-', {offset: 2})
			|| this.checkString('-lz5-', {offset: 2})
			|| this.checkString('-lhd-', {offset: 2})
		) {
			return {
				ext: 'lzh',
				mime: 'application/x-lzh-compressed',
			};
		}

		// MPEG program stream (PS or MPEG-PS)
		if (this.check([0x00, 0x00, 0x01, 0xBA])) {
			//  MPEG-PS, MPEG-1 Part 1
			if (this.check([0x21], {offset: 4, mask: [0xF1]})) {
				return {
					ext: 'mpg', // May also be .ps, .mpeg
					mime: 'video/MP1S',
				};
			}

			// MPEG-PS, MPEG-2 Part 1
			if (this.check([0x44], {offset: 4, mask: [0xC4]})) {
				return {
					ext: 'mpg', // May also be .mpg, .m2p, .vob or .sub
					mime: 'video/MP2P',
				};
			}
		}

		if (this.checkString('ITSF')) {
			return {
				ext: 'chm',
				mime: 'application/vnd.ms-htmlhelp',
			};
		}

		if (this.check([0xCA, 0xFE, 0xBA, 0xBE])) {
			// Java bytecode and Mach-O universal binaries have the same magic number.
			// We disambiguate based on the next 4 bytes, as done by `file`.
			// See https://github.com/file/file/blob/master/magic/Magdir/cafebabe
			const machOArchitectureCount = UINT32_BE.get(this.buffer, 4);
			const javaClassFileMajorVersion = UINT16_BE.get(this.buffer, 6);

			if (machOArchitectureCount > 0 && machOArchitectureCount <= 30) {
				return {
					ext: 'macho',
					mime: 'application/x-mach-binary',
				};
			}

			if (javaClassFileMajorVersion > 30) {
				return {
					ext: 'class',
					mime: 'application/java-vm',
				};
			}
		}

		if (this.checkString('.RMF')) {
			return {
				ext: 'rm',
				mime: 'application/vnd.rn-realmedia',
			};
		}

		// -- 5-byte signatures --

		if (this.checkString('DRACO')) {
			return {
				ext: 'drc',
				mime: 'application/vnd.google.draco', // Invented by us
			};
		}

		// -- 6-byte signatures --

		if (this.check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
			return {
				ext: 'xz',
				mime: 'application/x-xz',
			};
		}

		if (this.checkString('<?xml ')) {
			return {
				ext: 'xml',
				mime: 'application/xml',
			};
		}

		if (this.check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
			return {
				ext: '7z',
				mime: 'application/x-7z-compressed',
			};
		}

		if (
			this.check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7])
			&& (this.buffer[6] === 0x0 || this.buffer[6] === 0x1)
		) {
			return {
				ext: 'rar',
				mime: 'application/x-rar-compressed',
			};
		}

		if (this.checkString('solid ')) {
			return {
				ext: 'stl',
				mime: 'model/stl',
			};
		}

		if (this.checkString('AC')) {
			const version = new StringType(4, 'latin1').get(this.buffer, 2);
			if (version.match('^d*') && version >= 1000 && version <= 1050) {
				return {
					ext: 'dwg',
					mime: 'image/vnd.dwg',
				};
			}
		}

		if (this.checkString('070707')) {
			return {
				ext: 'cpio',
				mime: 'application/x-cpio',
			};
		}

		// -- 7-byte signatures --

		if (this.checkString('BLENDER')) {
			return {
				ext: 'blend',
				mime: 'application/x-blender',
			};
		}

		if (this.checkString('!<arch>')) {
			await tokenizer.ignore(8);
			const string = await tokenizer.readToken(new StringType(13, 'ascii'));
			if (string === 'debian-binary') {
				return {
					ext: 'deb',
					mime: 'application/x-deb',
				};
			}

			return {
				ext: 'ar',
				mime: 'application/x-unix-archive',
			};
		}

		if (
			this.checkString('WEBVTT')
			&&	(
				// One of LF, CR, tab, space, or end of file must follow "WEBVTT" per the spec (see `fixture/fixture-vtt-*.vtt` for examples). Note that `\0` is technically the null character (there is no such thing as an EOF character). However, checking for `\0` gives us the same result as checking for the end of the stream.
				(['\n', '\r', '\t', ' ', '\0'].some(char7 => this.checkString(char7, {offset: 6}))))
		) {
			return {
				ext: 'vtt',
				mime: 'text/vtt',
			};
		}

		// -- 8-byte signatures --

		if (this.check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
			// APNG format (https://wiki.mozilla.org/APNG_Specification)
			// 1. Find the first IDAT (image data) chunk (49 44 41 54)
			// 2. Check if there is an "acTL" chunk before the IDAT one (61 63 54 4C)

			// Offset calculated as follows:
			// - 8 bytes: PNG signature
			// - 4 (length) + 4 (chunk type) + 13 (chunk data) + 4 (CRC): IHDR chunk

			await tokenizer.ignore(8); // ignore PNG signature

			async function readChunkHeader() {
				return {
					length: await tokenizer.readToken(INT32_BE),
					type: await tokenizer.readToken(new StringType(4, 'latin1')),
				};
			}

			do {
				const chunk = await readChunkHeader();
				if (chunk.length < 0) {
					return; // Invalid chunk length
				}

				switch (chunk.type) {
					case 'IDAT':
						return {
							ext: 'png',
							mime: 'image/png',
						};
					case 'acTL':
						return {
							ext: 'apng',
							mime: 'image/apng',
						};
					default:
						await tokenizer.ignore(chunk.length + 4); // Ignore chunk-data + CRC
				}
			} while (tokenizer.position + 8 < tokenizer.fileInfo.size);

			return {
				ext: 'png',
				mime: 'image/png',
			};
		}

		if (this.check([0x41, 0x52, 0x52, 0x4F, 0x57, 0x31, 0x00, 0x00])) {
			return {
				ext: 'arrow',
				mime: 'application/vnd.apache.arrow.file',
			};
		}

		if (this.check([0x67, 0x6C, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00])) {
			return {
				ext: 'glb',
				mime: 'model/gltf-binary',
			};
		}

		// `mov` format variants
		if (
			this.check([0x66, 0x72, 0x65, 0x65], {offset: 4}) // `free`
			|| this.check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) // `mdat` MJPEG
			|| this.check([0x6D, 0x6F, 0x6F, 0x76], {offset: 4}) // `moov`
			|| this.check([0x77, 0x69, 0x64, 0x65], {offset: 4}) // `wide`
		) {
			return {
				ext: 'mov',
				mime: 'video/quicktime',
			};
		}

		// -- 9-byte signatures --

		if (this.check([0x49, 0x49, 0x52, 0x4F, 0x08, 0x00, 0x00, 0x00, 0x18])) {
			return {
				ext: 'orf',
				mime: 'image/x-olympus-orf',
			};
		}

		if (this.checkString('gimp xcf ')) {
			return {
				ext: 'xcf',
				mime: 'image/x-xcf',
			};
		}

		// File Type Box (https://en.wikipedia.org/wiki/ISO_base_media_file_format)
		// It's not required to be first, but it's recommended to be. Almost all ISO base media files start with `ftyp` box.
		// `ftyp` box must contain a brand major identifier, which must consist of ISO 8859-1 printable characters.
		// Here we check for 8859-1 printable characters (for simplicity, it's a mask which also catches one non-printable character).
		if (
			this.checkString('ftyp', {offset: 4})
			&& (this.buffer[8] & 0x60) !== 0x00 // Brand major, first character ASCII?
		) {
			// They all can have MIME `video/mp4` except `application/mp4` special-case which is hard to detect.
			// For some cases, we're specific, everything else falls to `video/mp4` with `mp4` extension.
			const brandMajor = new StringType(4, 'latin1').get(this.buffer, 8).replace('\0', ' ').trim();
			switch (brandMajor) {
				case 'avif':
				case 'avis':
					return {ext: 'avif', mime: 'image/avif'};
				case 'mif1':
					return {ext: 'heic', mime: 'image/heif'};
				case 'msf1':
					return {ext: 'heic', mime: 'image/heif-sequence'};
				case 'heic':
				case 'heix':
					return {ext: 'heic', mime: 'image/heic'};
				case 'hevc':
				case 'hevx':
					return {ext: 'heic', mime: 'image/heic-sequence'};
				case 'qt':
					return {ext: 'mov', mime: 'video/quicktime'};
				case 'M4V':
				case 'M4VH':
				case 'M4VP':
					return {ext: 'm4v', mime: 'video/x-m4v'};
				case 'M4P':
					return {ext: 'm4p', mime: 'video/mp4'};
				case 'M4B':
					return {ext: 'm4b', mime: 'audio/mp4'};
				case 'M4A':
					return {ext: 'm4a', mime: 'audio/x-m4a'};
				case 'F4V':
					return {ext: 'f4v', mime: 'video/mp4'};
				case 'F4P':
					return {ext: 'f4p', mime: 'video/mp4'};
				case 'F4A':
					return {ext: 'f4a', mime: 'audio/mp4'};
				case 'F4B':
					return {ext: 'f4b', mime: 'audio/mp4'};
				case 'crx':
					return {ext: 'cr3', mime: 'image/x-canon-cr3'};
				default:
					if (brandMajor.startsWith('3g')) {
						if (brandMajor.startsWith('3g2')) {
							return {ext: '3g2', mime: 'video/3gpp2'};
						}

						return {ext: '3gp', mime: 'video/3gpp'};
					}

					return {ext: 'mp4', mime: 'video/mp4'};
			}
		}

		// -- 10-byte signatures --

		if (this.checkString('REGEDIT4\r\n')) {
			return {
				ext: 'reg',
				mime: 'application/x-ms-regedit',
			};
		}

		// -- 12-byte signatures --

		// RIFF file format which might be AVI, WAV, QCP, etc
		if (this.check([0x52, 0x49, 0x46, 0x46])) {
			if (this.checkString('WEBP', {offset: 8})) {
				return {
					ext: 'webp',
					mime: 'image/webp',
				};
			}

			if (this.check([0x41, 0x56, 0x49], {offset: 8})) {
				return {
					ext: 'avi',
					mime: 'video/vnd.avi',
				};
			}

			if (this.check([0x57, 0x41, 0x56, 0x45], {offset: 8})) {
				return {
					ext: 'wav',
					mime: 'audio/wav',
				};
			}

			// QLCM, QCP file
			if (this.check([0x51, 0x4C, 0x43, 0x4D], {offset: 8})) {
				return {
					ext: 'qcp',
					mime: 'audio/qcelp',
				};
			}
		}

		if (this.check([0x49, 0x49, 0x55, 0x00, 0x18, 0x00, 0x00, 0x00, 0x88, 0xE7, 0x74, 0xD8])) {
			return {
				ext: 'rw2',
				mime: 'image/x-panasonic-rw2',
			};
		}

		// ASF_Header_Object first 80 bytes
		if (this.check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
			async function readHeader() {
				const guid = new Uint8Array(16);
				await tokenizer.readBuffer(guid);
				return {
					id: guid,
					size: Number(await tokenizer.readToken(UINT64_LE)),
				};
			}

			await tokenizer.ignore(30);
			// Search for header should be in first 1KB of file.
			while (tokenizer.position + 24 < tokenizer.fileInfo.size) {
				const header = await readHeader();
				let payload = header.size - 24;
				if (_check(header.id, [0x91, 0x07, 0xDC, 0xB7, 0xB7, 0xA9, 0xCF, 0x11, 0x8E, 0xE6, 0x00, 0xC0, 0x0C, 0x20, 0x53, 0x65])) {
					// Sync on Stream-Properties-Object (B7DC0791-A9B7-11CF-8EE6-00C00C205365)
					const typeId = new Uint8Array(16);
					payload -= await tokenizer.readBuffer(typeId);

					if (_check(typeId, [0x40, 0x9E, 0x69, 0xF8, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B])) {
						// Found audio:
						return {
							ext: 'asf',
							mime: 'audio/x-ms-asf',
						};
					}

					if (_check(typeId, [0xC0, 0xEF, 0x19, 0xBC, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B])) {
						// Found video:
						return {
							ext: 'asf',
							mime: 'video/x-ms-asf',
						};
					}

					break;
				}

				await tokenizer.ignore(payload);
			}

			// Default to ASF generic extension
			return {
				ext: 'asf',
				mime: 'application/vnd.ms-asf',
			};
		}

		if (this.check([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A])) {
			return {
				ext: 'ktx',
				mime: 'image/ktx',
			};
		}

		if ((this.check([0x7E, 0x10, 0x04]) || this.check([0x7E, 0x18, 0x04])) && this.check([0x30, 0x4D, 0x49, 0x45], {offset: 4})) {
			return {
				ext: 'mie',
				mime: 'application/x-mie',
			};
		}

		if (this.check([0x27, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], {offset: 2})) {
			return {
				ext: 'shp',
				mime: 'application/x-esri-shape',
			};
		}

		if (this.check([0xFF, 0x4F, 0xFF, 0x51])) {
			return {
				ext: 'j2c',
				mime: 'image/j2c',
			};
		}

		if (this.check([0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A])) {
			// JPEG-2000 family

			await tokenizer.ignore(20);
			const type = await tokenizer.readToken(new StringType(4, 'ascii'));
			switch (type) {
				case 'jp2 ':
					return {
						ext: 'jp2',
						mime: 'image/jp2',
					};
				case 'jpx ':
					return {
						ext: 'jpx',
						mime: 'image/jpx',
					};
				case 'jpm ':
					return {
						ext: 'jpm',
						mime: 'image/jpm',
					};
				case 'mjp2':
					return {
						ext: 'mj2',
						mime: 'image/mj2',
					};
				default:
					return;
			}
		}

		if (
			this.check([0xFF, 0x0A])
			|| this.check([0x00, 0x00, 0x00, 0x0C, 0x4A, 0x58, 0x4C, 0x20, 0x0D, 0x0A, 0x87, 0x0A])
		) {
			return {
				ext: 'jxl',
				mime: 'image/jxl',
			};
		}

		if (this.check([0xFE, 0xFF])) { // UTF-16-BOM-BE
			if (this.checkString('<?xml ', {offset: 2, encoding: 'utf-16be'})) {
				return {
					ext: 'xml',
					mime: 'application/xml',
				};
			}

			return undefined; // Some unknown text based format
		}

		if (this.check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
			// Detected Microsoft Compound File Binary File (MS-CFB) Format.
			return {
				ext: 'cfb',
				mime: 'application/x-cfb',
			};
		}

		// Increase sample size from 32 to 256.
		await tokenizer.peekBuffer(this.buffer, {length: Math.min(256, tokenizer.fileInfo.size), mayBeLess: true});

		if (this.check([0x61, 0x63, 0x73, 0x70], {offset: 36})) {
			return {
				ext: 'icc',
				mime: 'application/vnd.iccprofile',
			};
		}

		// ACE: requires 14 bytes in the buffer
		if (this.checkString('**ACE', {offset: 7}) && this.checkString('**', {offset: 12})) {
			return {
				ext: 'ace',
				mime: 'application/x-ace-compressed',
			};
		}

		// -- 15-byte signatures --

		if (this.checkString('BEGIN:')) {
			if (this.checkString('VCARD', {offset: 6})) {
				return {
					ext: 'vcf',
					mime: 'text/vcard',
				};
			}

			if (this.checkString('VCALENDAR', {offset: 6})) {
				return {
					ext: 'ics',
					mime: 'text/calendar',
				};
			}
		}

		// `raf` is here just to keep all the raw image detectors together.
		if (this.checkString('FUJIFILMCCD-RAW')) {
			return {
				ext: 'raf',
				mime: 'image/x-fujifilm-raf',
			};
		}

		if (this.checkString('Extended Module:')) {
			return {
				ext: 'xm',
				mime: 'audio/x-xm',
			};
		}

		if (this.checkString('Creative Voice File')) {
			return {
				ext: 'voc',
				mime: 'audio/x-voc',
			};
		}

		if (this.check([0x04, 0x00, 0x00, 0x00]) && this.buffer.length >= 16) { // Rough & quick check Pickle/ASAR
			const jsonSize = new DataView(this.buffer.buffer).getUint32(12, true);

			if (jsonSize > 12 && this.buffer.length >= jsonSize + 16) {
				try {
					const header = new TextDecoder().decode(this.buffer.subarray(16, jsonSize + 16));
					const json = JSON.parse(header);
					// Check if Pickle is ASAR
					if (json.files) { // Final check, assuring Pickle/ASAR format
						return {
							ext: 'asar',
							mime: 'application/x-asar',
						};
					}
				} catch {}
			}
		}

		if (this.check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
			return {
				ext: 'mxf',
				mime: 'application/mxf',
			};
		}

		if (this.checkString('SCRM', {offset: 44})) {
			return {
				ext: 's3m',
				mime: 'audio/x-s3m',
			};
		}

		// Raw MPEG-2 transport stream (188-byte packets)
		if (this.check([0x47]) && this.check([0x47], {offset: 188})) {
			return {
				ext: 'mts',
				mime: 'video/mp2t',
			};
		}

		// Blu-ray Disc Audio-Video (BDAV) MPEG-2 transport stream has 4-byte TP_extra_header before each 188-byte packet
		if (this.check([0x47], {offset: 4}) && this.check([0x47], {offset: 196})) {
			return {
				ext: 'mts',
				mime: 'video/mp2t',
			};
		}

		if (this.check([0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49], {offset: 60})) {
			return {
				ext: 'mobi',
				mime: 'application/x-mobipocket-ebook',
			};
		}

		if (this.check([0x44, 0x49, 0x43, 0x4D], {offset: 128})) {
			return {
				ext: 'dcm',
				mime: 'application/dicom',
			};
		}

		if (this.check([0x4C, 0x00, 0x00, 0x00, 0x01, 0x14, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x46])) {
			return {
				ext: 'lnk',
				mime: 'application/x.ms.shortcut', // Invented by us
			};
		}

		if (this.check([0x62, 0x6F, 0x6F, 0x6B, 0x00, 0x00, 0x00, 0x00, 0x6D, 0x61, 0x72, 0x6B, 0x00, 0x00, 0x00, 0x00])) {
			return {
				ext: 'alias',
				mime: 'application/x.apple.alias', // Invented by us
			};
		}

		if (this.checkString('Kaydara FBX Binary  \u0000')) {
			return {
				ext: 'fbx',
				mime: 'application/x.autodesk.fbx', // Invented by us
			};
		}

		if (
			this.check([0x4C, 0x50], {offset: 34})
			&& (
				this.check([0x00, 0x00, 0x01], {offset: 8})
				|| this.check([0x01, 0x00, 0x02], {offset: 8})
				|| this.check([0x02, 0x00, 0x02], {offset: 8})
			)
		) {
			return {
				ext: 'eot',
				mime: 'application/vnd.ms-fontobject',
			};
		}

		if (this.check([0x06, 0x06, 0xED, 0xF5, 0xD8, 0x1D, 0x46, 0xE5, 0xBD, 0x31, 0xEF, 0xE7, 0xFE, 0x74, 0xB7, 0x1D])) {
			return {
				ext: 'indd',
				mime: 'application/x-indesign',
			};
		}

		// -- 16-byte signatures --

		// JMP files - check for both Little Endian and Big Endian signatures
		if (this.check([0xFF, 0xFF, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00])
			|| this.check([0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x01])) {
			return {
				ext: 'jmp',
				mime: 'application/x-jmp-data',
			};
		}

		// Increase sample size from 256 to 512
		await tokenizer.peekBuffer(this.buffer, {length: Math.min(512, tokenizer.fileInfo.size), mayBeLess: true});

		// Requires a buffer size of 512 bytes
		if ((this.checkString('ustar', {offset: 257}) && (this.checkString('\0', {offset: 262}) || this.checkString(' ', {offset: 262})))
			|| (this.check([0, 0, 0, 0, 0, 0], {offset: 257}) && tarHeaderChecksumMatches(this.buffer))) {
			return {
				ext: 'tar',
				mime: 'application/x-tar',
			};
		}

		if (this.check([0xFF, 0xFE])) { // UTF-16-BOM-LE
			const encoding = 'utf-16le';
			if (this.checkString('<?xml ', {offset: 2, encoding})) {
				return {
					ext: 'xml',
					mime: 'application/xml',
				};
			}

			if (this.check([0xFF, 0x0E], {offset: 2}) && this.checkString('SketchUp Model', {offset: 4, encoding})) {
				return {
					ext: 'skp',
					mime: 'application/vnd.sketchup.skp',
				};
			}

			if (this.checkString('Windows Registry Editor Version 5.00\r\n', {offset: 2, encoding})) {
				return {
					ext: 'reg',
					mime: 'application/x-ms-regedit',
				};
			}

			return undefined; // Some text based format
		}

		if (this.checkString('-----BEGIN PGP MESSAGE-----')) {
			return {
				ext: 'pgp',
				mime: 'application/pgp-encrypted',
			};
		}
	};
	// Detections with limited supporting data, resulting in a higher likelihood of false positives
	detectImprecise = async tokenizer => {
		this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);

		// Read initial sample size of 8 bytes
		await tokenizer.peekBuffer(this.buffer, {length: Math.min(8, tokenizer.fileInfo.size), mayBeLess: true});

		if (
			this.check([0x0, 0x0, 0x1, 0xBA])
			|| this.check([0x0, 0x0, 0x1, 0xB3])
		) {
			return {
				ext: 'mpg',
				mime: 'video/mpeg',
			};
		}

		if (this.check([0x00, 0x01, 0x00, 0x00, 0x00])) {
			return {
				ext: 'ttf',
				mime: 'font/ttf',
			};
		}

		if (this.check([0x00, 0x00, 0x01, 0x00])) {
			return {
				ext: 'ico',
				mime: 'image/x-icon',
			};
		}

		if (this.check([0x00, 0x00, 0x02, 0x00])) {
			return {
				ext: 'cur',
				mime: 'image/x-icon',
			};
		}

		// Adjust buffer to `mpegOffsetTolerance`
		await tokenizer.peekBuffer(this.buffer, {length: Math.min(2 + this.options.mpegOffsetTolerance, tokenizer.fileInfo.size), mayBeLess: true});

		// Check MPEG 1 or 2 Layer 3 header, or 'layer 0' for ADTS (MPEG sync-word 0xFFE)
		if (this.buffer.length >= (2 + this.options.mpegOffsetTolerance)) {
			for (let depth = 0; depth <= this.options.mpegOffsetTolerance; ++depth) {
				const type = this.scanMpeg(depth);
				if (type) {
					return type;
				}
			}
		}
	};

	async readTiffTag(bigEndian) {
		const tagId = await this.tokenizer.readToken(bigEndian ? UINT16_BE : UINT16_LE);
		this.tokenizer.ignore(10);
		switch (tagId) {
			case 50_341:
				return {
					ext: 'arw',
					mime: 'image/x-sony-arw',
				};
			case 50_706:
				return {
					ext: 'dng',
					mime: 'image/x-adobe-dng',
				};
			default:
		}
	}

	async readTiffIFD(bigEndian) {
		const numberOfTags = await this.tokenizer.readToken(bigEndian ? UINT16_BE : UINT16_LE);
		for (let n = 0; n < numberOfTags; ++n) {
			const fileType = await this.readTiffTag(bigEndian);
			if (fileType) {
				return fileType;
			}
		}
	}

	async readTiffHeader(bigEndian) {
		const version = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 2);
		const ifdOffset = (bigEndian ? UINT32_BE : UINT32_LE).get(this.buffer, 4);

		if (version === 42) {
			// TIFF file header
			if (ifdOffset >= 6) {
				if (this.checkString('CR', {offset: 8})) {
					return {
						ext: 'cr2',
						mime: 'image/x-canon-cr2',
					};
				}

				if (ifdOffset >= 8) {
					const someId1 = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 8);
					const someId2 = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 10);

					if (
						(someId1 === 0x1C && someId2 === 0xFE)
						|| (someId1 === 0x1F && someId2 === 0x0B)) {
						return {
							ext: 'nef',
							mime: 'image/x-nikon-nef',
						};
					}
				}
			}

			await this.tokenizer.ignore(ifdOffset);
			const fileType = await this.readTiffIFD(bigEndian);
			return fileType ?? {
				ext: 'tif',
				mime: 'image/tiff',
			};
		}

		if (version === 43) {	// Big TIFF file header
			return {
				ext: 'tif',
				mime: 'image/tiff',
			};
		}
	}

	/**
	Scan check MPEG 1 or 2 Layer 3 header, or 'layer 0' for ADTS (MPEG sync-word 0xFFE).

	@param offset - Offset to scan for sync-preamble.
	@returns {{ext: string, mime: string}}
	*/
	scanMpeg(offset) {
		if (this.check([0xFF, 0xE0], {offset, mask: [0xFF, 0xE0]})) {
			if (this.check([0x10], {offset: offset + 1, mask: [0x16]})) {
				// Check for (ADTS) MPEG-2
				if (this.check([0x08], {offset: offset + 1, mask: [0x08]})) {
					return {
						ext: 'aac',
						mime: 'audio/aac',
					};
				}

				// Must be (ADTS) MPEG-4
				return {
					ext: 'aac',
					mime: 'audio/aac',
				};
			}

			// MPEG 1 or 2 Layer 3 header
			// Check for MPEG layer 3
			if (this.check([0x02], {offset: offset + 1, mask: [0x06]})) {
				return {
					ext: 'mp3',
					mime: 'audio/mpeg',
				};
			}

			// Check for MPEG layer 2
			if (this.check([0x04], {offset: offset + 1, mask: [0x06]})) {
				return {
					ext: 'mp2',
					mime: 'audio/mpeg',
				};
			}

			// Check for MPEG layer 1
			if (this.check([0x06], {offset: offset + 1, mask: [0x06]})) {
				return {
					ext: 'mp1',
					mime: 'audio/mpeg',
				};
			}
		}
	}
}

const supportedExtensions = new Set(extensions);
const supportedMimeTypes = new Set(supported_mimeTypes);

;// CONCATENATED MODULE: ./node_modules/file-type/index.js
/**
Node.js specific entry point.
*/






class FileTypeParser extends core_FileTypeParser {
	async fromStream(stream) {
		const tokenizer = await (stream instanceof web_.ReadableStream ? fromWebStream(stream, this.tokenizerOptions) : lib_fromStream(stream, this.tokenizerOptions));
		try {
			return await super.fromTokenizer(tokenizer);
		} finally {
			await tokenizer.close();
		}
	}

	async fromFile(path) {
		const tokenizer = await fromFile(path);
		try {
			return await super.fromTokenizer(tokenizer);
		} finally {
			await tokenizer.close();
		}
	}

	async toDetectionStream(readableStream, options = {}) {
		if (!(readableStream instanceof external_node_stream_.Readable)) {
			return super.toDetectionStream(readableStream, options);
		}

		const {sampleSize = reasonableDetectionSizeInBytes} = options;

		return new Promise((resolve, reject) => {
			readableStream.on('error', reject);

			readableStream.once('readable', () => {
				(async () => {
					try {
						// Set up output stream
						const pass = new external_node_stream_.PassThrough();
						const outputStream = external_node_stream_.pipeline ? (0,external_node_stream_.pipeline)(readableStream, pass, () => {}) : readableStream.pipe(pass);

						// Read the input stream and detect the filetype
						const chunk = readableStream.read(sampleSize) ?? readableStream.read() ?? new Uint8Array(0);
						try {
							pass.fileType = await this.fromBuffer(chunk);
						} catch (error) {
							if (error instanceof EndOfStreamError) {
								pass.fileType = undefined;
							} else {
								reject(error);
							}
						}

						resolve(outputStream);
					} catch (error) {
						reject(error);
					}
				})();
			});
		});
	}
}

async function fileTypeFromFile(path, options) {
	return (new FileTypeParser(options)).fromFile(path, options);
}

async function file_type_fileTypeFromStream(stream, options) {
	return (new FileTypeParser(options)).fromStream(stream);
}

async function file_type_fileTypeStream(readableStream, options = {}) {
	return new FileTypeParser(options).toDetectionStream(readableStream, options);
}




/***/ })

};
;
//# sourceMappingURL=266.index.js.map