'use strict';
var eachAsync = require('each-async');
var onetime = require('onetime');

module.exports = function (domains, cb) {
	if (typeof domains === 'function') {
		cb = domains;
		domains = [
			'google.com',
			'opendns.com',
			'baidu.com'
		];
	}

	if (!Array.isArray(domains)) {
		throw new TypeError('Expected `domains` to be an array');
	}

	cb = onetime(cb);

	eachAsync(domains, function (domain, i, next) {
		var img = new Image();

		img.onload = function () {
			cb(null, true);
			next(new Error); // skip to end
		};

		img.onerror = function () {
			next();
		};

		img.src = '//' + domain + '/favicon.ico?' + Date.now();
	}, function () {
		cb(null, false);
	});
};
