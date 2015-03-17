'use strict';
var dns = require('native-dns');
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

	// Pick a random root server to query
	var server = roots[Math.floor(Math.random() * roots.length)];

	// Set up a DNS request that requests the authoritative information for
	// the 'com' zone
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
			// succeeds, we're definitely online
			eachAsync(domains, function (domain, i, done) {
				var socket = new net.Socket();
				socket.setTimeout(timeout);
				socket.on('error', function () {
					socket.destroy();
				});
				socket.connect(80, domain, function () {
					cb(null, true);
					socket.end();
					done(new Error()); // skip to end
				});
			}, function () {
				cb(null, false);
			});
		}
	});

	req.send();
};
