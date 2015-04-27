'use strict';
var dgram = require('dgram');
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

	// Craft a query for the root server
	var packet = [
		'0x21', '0x22', /* Transaction ID */
		'0x01', '0x00', /* Standard Query */
		'0x00', '0x01', /* Questions: 1   */
		'0x00', '0x00', /* Answer RRs     */
		'0x00', '0x00', /* Authority RRs  */
		'0x00', '0x00', /* Additional RRs */
		'0x00',         /* Name:  <root>  */
		'0x00', '0x02', /* Type:  NS      */
		'0x00', '0x01'  /* Class: IN      */
	];

	var udpSocket = dgram.createSocket('udp4');

	setTimeout(function () {
		// We ran into the timeout, we're offline with high confidence
		cb(null, false);
	}, timeout);

	udpSocket.on('message', function (msg, rinfo) {
		if (rinfo.address === server) {
			// We got an answer and the source matches the queried server,
			// we're online with high confidence
			cb(null, true);
		} else {
			// Either DNS intercepting is in place or the response in mangled,
			// try connecting to our domains on port 80, and if one handshake
			// succeeds, we're definitely online
			eachAsync(domains, function (domain, i, done) {
				var socket = new net.Socket();
				done = onetime(done);

				socket.setTimeout(timeout);

				socket.on('timeout', function () {
					socket.destroy();
					done();
				});

				socket.on('error', function () {
					socket.destroy();
					done();
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

	udpSocket.send(new Buffer(packet), 0, packet.length, 53, server);
};
