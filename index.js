'use strict';

const got = require('got');
const publicIp = require('public-ip');
const pAny = require('p-any');
const pTimeout = require('p-timeout');

const defaults = {
	timeout: 5000,
	version: 'v4'
};

function appleCheck(options) {
	const gotPromise = got('http://captive.apple.com/hotspot-detect.html', {
		family: options.version === 'v4' ? 4 : 6,
		headers: {'User-Agent': 'CaptiveNetworkSupport/1.0 wispr'}
	});

	const promise = gotPromise.then(res => {
		return /Success/.test(res.body || '') || Promise.reject();
	}).catch(err => {
		if (!(err instanceof got.CancelError)) {
			throw err;
		}
	});

	promise.cancel = gotPromise.cancel;

	return promise;
}

module.exports = options => {
	options = Object.assign({}, defaults, options);

	const promises = [
		publicIp[options.version](),
		publicIp[options.version]({https: true}),
		appleCheck(options)
	];

	const p = pAny([
		promises[0].then(() => {
			promises[1].cancel();
			promises[2].cancel();
			return true;
		}),
		promises[1].then(() => {
			promises[0].cancel();
			promises[2].cancel();
			return true;
		}),
		promises[2].then(() => {
			promises[1].cancel();
			promises[2].cancel();
			return true;
		})
	]);

	return pTimeout(p, options.timeout).then(() => true).catch(() => false);
};
