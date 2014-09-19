'use strict';
module.exports = function (domain, cb) {
	if (typeof domain === 'function') {
		cb = domain;
		domain = 'google.com';
	}

	var img = new Image();

	img.onload = function () {
		cb(null, true);
	};

	img.onerror = function () {
		cb(null, false);
	};

	img.src = 'http://' + domain + '/favicon.ico?' + Date.now();
};
