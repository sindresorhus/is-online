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
	return got('http://captive.apple.com/hotspot-detect.html', {
		family: options.version === 'v4' ? 4 : 6,
		headers: {'User-Agent': 'CaptiveNetworkSupport/1.0 wispr'}
	}).then(res => /Success/.test(res.body || '') || Promise.reject());
}

module.exports = options => {
	options = Object.assign({}, defaults, options);

	const p = pAny([
		publicIp[options.version]().then(() => true),
		publicIp[options.version]({https: true}).then(() => true),
		appleCheck(options)
	]);

	return pTimeout(p, options.timeout).catch(() => false);
};
