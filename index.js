'use strict';
var dns = require('dns');

module.exports = function (domain, cb) {
	if (typeof domain === 'function') {
		cb = domain;
		domain = 'google.com';
	}

	dns.lookup(domain, function (err) {
		cb(null, !err);
	});
};
