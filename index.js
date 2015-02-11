'use strict';
var dns = require('dns');
var net = require('net');
var eachAsync = require('each-async');
var onetime = require('onetime');
var roots = require('root-hints')('A');

var timeout = 1000;
var domains = [
	'www.google.com',
	'www.cloudflare.com',
	'www.baidu.com',
	'www.yandex.ru'
];

module.exports = function (cb) {
	cb = onetime(cb);

	// set dns to query the root servers
	dns.setServers(roots);

	// request the authoritative records for the root zone
	dns.resolveNs('', function (err, servers) {
		if (!err && servers.length) {
			cb(null, true);
		} else {
			// dns query either failed or returned no result,
			// try connecting to our domains in parallel
			eachAsync(domains, function (domain, i, next) {
				var socket = new net.Socket();
				socket.unref();
				socket.setTimeout(timeout, next);
				socket.on('error', function () {
					socket.destroy();
					next();
				});
				socket.connect(80, domain, function () {
					cb(null, true);
					socket.end();
					next(new Error()); // skip to end
				});
			}, function () {
				cb(null, false);
			});
		}
	});
};
