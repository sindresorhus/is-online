'use strict';
const dgram = require('dgram');
const roots = require('root-hints')('A');
const isReachable = require('is-reachable');
const randomItem = require('random-item');
const hostnames = require('./hostnames');

const timeout = 2000;

const getDefaultPayload = () => new Buffer([
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

const listen = (state, server, options, resolve) => {
	state.socket.on('message', (msg, rinfo) => {
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

		if (state.socket) {
			state.socket.close();
			state.socket = null;
		}

		if (state.timeout) {
			clearTimeout(state.timeout);
		}
	});
};

const send = (state, server, options, resolve) => {
	// Craft a DNS query
	const payload = getDefaultPayload();

	state.socket.send(payload, 0, payload.length, 53, server, () => {
		state.timeout = setTimeout(() => {
			// We ran into the timeout, we're offline with high confidence
			resolve(false);

			if (state.socket) {
				state.socket.close();
				state.socket = null;
			}
		}, options.timeout);
	});
};

module.exports = options => {
	options = Object.assign({hostnames, timeout}, options);

	const state = {
		socket: dgram.createSocket('udp4'),
		timeout: null
	};

	// Pick a random root server to query
	const server = randomItem(roots);

	const promise = new Promise(resolve => {
		listen(state, server, options, resolve);
		send(state, server, options, resolve);
	});

	return promise;
};
