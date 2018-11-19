var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;
var fn = (function () {
	var val;

	var fnMap = [
		[
			'requestFullscreen',
			'exitFullscreen',
			'fullscreenElement',
			'fullscreenEnabled',
			'fullscreenchange',
			'fullscreenerror'
		],
		// New WebKit
		[
			'webkitRequestFullscreen',
			'webkitExitFullscreen',
			'webkitFullscreenElement',
			'webkitFullscreenEnabled',
			'webkitfullscreenchange',
			'webkitfullscreenerror'

		],
		// Old WebKit (Safari 5.1)
		[
			'webkitRequestFullScreen',
			'webkitCancelFullScreen',
			'webkitCurrentFullScreenElement',
			'webkitCancelFullScreen',
			'webkitfullscreenchange',
			'webkitfullscreenerror'

		],
		[
			'mozRequestFullScreen',
			'mozCancelFullScreen',
			'mozFullScreenElement',
			'mozFullScreenEnabled',
			'mozfullscreenchange',
			'mozfullscreenerror'
		],
		[
			'msRequestFullscreen',
			'msExitFullscreen',
			'msFullscreenElement',
			'msFullscreenEnabled',
			'MSFullscreenChange',
			'MSFullscreenError'
		]
	];

	let i = 0;
	const l = fnMap.length;
	const ret = {};

	for (; i < l; i += 1) {
		val = fnMap[i];
		if (val && val[1] in document) {
			for (i = 0; i < val.length; i += 1) {
				ret[fnMap[0][i]] = val[i];
			}
			return ret;
		}
	}

	return false;
})();
var eventNameMap = {
	change: fn.fullscreenchange,
	error: fn.fullscreenerror
};

var screenfull = {
	request: function (elem) {
		var request = fn.requestFullscreen;

		elem = elem || document.documentElement;

		// Work around Safari 5.1 bug: reports support for
		// keyboard in fullscreen even though it doesn't.
		// Browser sniffing, since the alternative with
		// setTimeout is even worse.
		if (/5\.1[.\d]* Safari/.test(navigator.userAgent)) {
			elem[request]();
		} else {
			elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
		}
	},
	exit: function () {
		document[fn.exitFullscreen]();
	},
	toggle: function (elem) {
		if (this.isFullscreen) {
			this.exit();
		} else {
			this.request(elem);
		}
	},
	onchange: function (callback) {
		this.on('change', callback);
	},
	onerror: function (callback) {
		this.on('error', callback);
	},
	on: function (event, callback) {
		var eventName = eventNameMap[event];
		if (eventName) {
			document.addEventListener(eventName, callback, false);
		}
	},
	off: function (event, callback) {
		var eventName = eventNameMap[event];
		if (eventName) {
			document.removeEventListener(eventName, callback, false);
		}
	},
	raw: fn
};

export default screenfull