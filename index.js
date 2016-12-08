'use strict';
var dgram = require('dgram');
var onetime = require('onetime');
var roots = require('root-hints')('A');
var isReachable = require('is-reachable');
var objectAssign = require('object-assign');
var uniqueRandomArray = require('unique-random-array');
var eachAsync = require('each-async');
var hostnames = require('./hostnames');

var timeout = 2000;

module.exports = function (options, cb) {
	if (typeof options === 'function') {
		cb = options;
		options = {};
	}

	options = objectAssign({ hostnames: hostnames, timeout: timeout }, options);

	cb = onetime(cb);
	var randomServer = uniqueRandomArray(roots);

	// Pick two random root servers to query
	var servers = [randomServer(), randomServer()];

	// Craft a DNS query
	var payload = new Buffer([
		0x00, 0x00, /* Transaction ID */
		0x01, 0x00, /* Standard Query */
		0x00, 0x01, /* Questions: 1   */
		0x00, 0x00, /* Answer RRs     */
		0x00, 0x00, /* Authority RRs  */
		0x00, 0x00, /* Additional RRs */
		0x00,       /* Name:  <root>  */
		0x00, 0x02, /* Type:  NS      */
		0x00, 0x01  /* Class: IN      */
	]);

	eachAsync(servers, function (server, i, done) {
		var udpSocket = dgram.createSocket('udp4');
	  var socketTimeout;
		udpSocket.on('message', function (msg, rinfo) {
			if (msg && msg.length >= 2 && rinfo.address === server) {
				// We got an answer where the source matches the queried server,
				// we're online with high confidence
				cb(null, true);
			} else {
				// We got an answer, but it appears to not come from the queried
				// server. Try connecting to our hostnames on port 80 and if one
				// handshake succeeds, we're definitely online
				isReachable(hostnames, cb);
			}
			clearTimeout(socketTimeout);
			done();

			udpSocket.close();
			udpSocket = null;
		});

		udpSocket.send(payload, 0, payload.length, 53, server, function () {
			socketTimeout = setTimeout(function () {
				// We ran into the timeout, we're offline with high confidence
			  cb(null, false);
				done();

				if (udpSocket) {
					udpSocket.close();
				}
			}, options.timeout);
		});
	});
};
