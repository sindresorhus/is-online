'use strict';
const got = require('got');
const publicIp = require('public-ip');
const pTimeout = require('p-timeout');

const appleCheck = options => {
	const gotPromise = got('http://captive.apple.com/hotspot-detect.html', {
		family: options.version === 'v4' ? 4 : 6,
		headers: {
			'user-agent': 'CaptiveNetworkSupport/1.0 wispr'
		}
	});

	const promise = gotPromise.then(res => {
		return /Success/.test(res.body || '') || Promise.reject();
	}).catch(error => {
		if (!(error instanceof got.CancelError)) {
			throw error;
		}
	});

	promise.cancel = gotPromise.cancel;

	return promise;
};

const isOnline = async options => {
	options = {
		timeout: 5000,
		version: 'v4',
		...options
	};

	const dnsPromise = publicIp[options.version]();

	const httpsPromise = publicIp[options.version]({
		https: true
	});

	const applePromise = appleCheck(options);

	const promise = Promise.race([
		dnsPromise,
		httpsPromise,
		applePromise
	]);

	try {
		await pTimeout(promise, options.timeout);
		dnsPromise.cancel();
		httpsPromise.cancel();
		applePromise.cancel();
		return true;
	} catch (error) {
		return false;
	}
};

module.exports = isOnline;
// TODO: Remove this for the next major release
module.exports.default = isOnline;
