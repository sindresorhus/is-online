'use strict';
var dgram = require('dgram');
var onetime = require('onetime');
var roots = require('root-hints')('A');
var isReachable = require('is-reachable');
var randomItem = require('random-item');
var hostnames = require('./hostnames');

var timeout = 1000;

module.exports = function (cb) {
	cb = onetime(cb);

	// Pick a random root server to query
	var server = randomItem(roots);

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

	var udpSocket = dgram.createSocket('udp4');

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

		udpSocket.unref();
	});

	udpSocket.send(payload, 0, payload.length, 53, server, function () {
		setTimeout(function () {
			// We ran into the timeout, we're offline with high confidence
			cb(null, false);
		}, timeout);

		udpSocket.unref();
	});
};
