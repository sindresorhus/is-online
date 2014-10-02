'use strict';
var eachAsync = require('each-async');
var onetime = require('onetime');

var domains = [
	'www.google.com',
	'www.cloudflare.com',
	'www.baidu.com',
	'www.yandex.ru'
];

module.exports = function (cb) {
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
