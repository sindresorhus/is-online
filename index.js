'use strict';
const got = require('got');
const publicIp = require('public-ip');
const pAny = require('p-any');
const pTimeout = require('p-timeout');

const appleCheck = async options => {
	const {body} = await got('http://captive.apple.com/hotspot-detect.html', {
		timeout: options.timeout,
		family: options.version === 'v4' ? 4 : 6,
		headers: {
			'user-agent': 'CaptiveNetworkSupport/1.0 wispr'
		}
	});

	return /Success/.test(body || '') || Promise.reject();
};

const isOnline = options => {
	options = {
		timeout: 5000,
		version: 'v4',
		...options
	};

	const queries = [];

	const promise = pAny([
		(async () => {
			const query = publicIp[options.version](options);
			queries.push(query);
			await query;
			return true;
		})(),
		(async () => {
			const query = publicIp[options.version]({...options, onlyHttps: true});
			queries.push(query);
			await query;
			return true;
		})(),
		appleCheck(options)
	]);

	return pTimeout(promise, options.timeout).catch(() => {
		queries.forEach(query => {
			query.cancel();
		});
		return false;
	});
};

module.exports = isOnline;
// TODO: Remove this for the next major release
module.exports.default = isOnline;
