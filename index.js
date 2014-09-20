'use strict';
var dns = require('dns');
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
		dns.lookup(domain, 4, function (err) {
			if (!err) {
				cb(null, true);
				next(new Error); // skip to end
				return;
			}

			next();
		});
	}, function () {
		cb(null, false);
	});
};
