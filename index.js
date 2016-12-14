'use strict';
var dgram = require('dgram');
var roots = require('root-hints')('A');
var isReachable = require('is-reachable');
var randomItem = require('random-item');
var objectAssign = require('object-assign');
var hostnames = require('./hostnames');
var Promise = require('pinkie-promise');

var timeout = 2000;


module.exports = (options) => {
	options = Object.assign({ hostnames: hostnames, timeout: timeout }, options);
	var udpSocket = dgram.createSocket('udp4');

	// Pick a random root server to query
	var server = randomItem(roots);

	var promise = new Promise((resolve) => {
		listen(udpSocket, server, options, resolve);
		send(udpSocket, server, options, resolve);
	});

	return promise;
};

function listen(udpSocket, server, options, resolve) {
	udpSocket.on('message', (msg, rinfo) => {
		udpSocket.close();
		udpSocket = null;
		if (msg && msg.length >= 2 && rinfo.address === server) {
			// We got an answer where the source matches the queried server,
			// we're online with high confidence
			resolve(true);
		} else {
			// We got an answer, but it appears to not come from the queried
			// server. Try connecting to our hostnames on port 80 and if one
			// handshake succeeds, we're definitely online
			resolve(isReachable(options.hostnames));
		}
	});
}

function send(udpSocket, server, options, resolve) {
	// Craft a DNS query
	var payload = getDefaultPayload();

	udpSocket.send(payload, 0, payload.length, 53, server, () => {
		setTimeout(() => {
			// We ran into the timeout, we're offline with high confidence
			if (udpSocket) {
				udpSocket.close();
			}
			resolve(false);
		}, options.timeout);
	});
}

function getDefaultPayload() {
	return new Buffer([
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
}
