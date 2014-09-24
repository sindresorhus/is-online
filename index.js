'use strict';
var dns = require('native-dns');
var net = require('net');
var eachAsync = require('each-async');
var onetime = require('onetime');

var timeout = 1000;

// root hints from http://www.internic.net/domain/named.root
var roots = [
	'128.63.2.53',
	'192.112.36.4',
	'192.203.230.10',
	'192.228.79.201',
	'192.33.4.12',
	'192.36.148.17',
	'192.5.5.241',
	'192.58.128.30',
	'193.0.14.129',
	'198.41.0.4',
	'199.7.83.42',
	'199.7.91.13',
	'202.12.27.33'
];

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

	// pick a random root server to query
	var server = roots[Math.floor(Math.random() * roots.length)];

	var req = dns.Request({
		question: dns.Question({
			name: 'com',
			type: 'NS'
		}),
		server: {
			address: server
		},
		timeout: timeout
	});

	req.on('timeout', function () {
		// We ran into the timeout, we're offline with high confidence
		cb(null, false);
	});

	req.on('message', function (err, answer) {
		if (answer.authority.length && answer._socket.address === server) {
			// We got an answer and the source matches the queried server,
			// we're online with high confidence
			cb(null, true);
		} else {
			// Either DNS intercepting is in place or the response in mangled,
			// try connecting to our domains on port 80, and if one handshake
			// succeeds, we're definately online.
			eachAsync(domains, function (domain, i, next) {
				var socket = new net.Socket();
				socket.setTimeout(timeout);
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
	req.send();
};
