'use strict';
var eachAsync = require('each-async');
var onetime = require('onetime');

module.exports = function (cb) {
	var domains = [
		'google.com',
		'opendns.com',
		'baidu.com'
	];

	cb = onetime(cb);

	eachAsync(domains, function (domain, i, next) {
		var img = new Image();

		img.onload = function () {
			cb(true);
			next(new Error); // skip to end
		};

		img.onerror = function () {
			next();
		};

		img.src = '//' + domain + '/favicon.ico?' + Date.now();
	}, function () {
		cb(false);
	});
};
