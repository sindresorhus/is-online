'use strict';
const os = require('os');
const got = require('got');
const publicIp = require('public-ip');
const pAny = require('p-any');
const pTimeout = require('p-timeout');

// Use Array#flat when targeting Node.js 12
const flat = array => [].concat(...array);

const appleCheck = options => {
	const gotPromise = got('https://captive.apple.com/hotspot-detect.html', {
		timeout: options.timeout,
		dnsLookupIpVersion: options.ipVersion === 6 ? 'ipv6' : 'ipv4',
		headers: {
			'user-agent': 'CaptiveNetworkSupport/1.0 wispr'
		}
	});

	const promise = (async () => {
		try {
			const {body} = await gotPromise;
			if (!body || !body.includes('Success')) {
				throw new Error('Apple check failed');
			}
		} catch (error) {
			if (!(error instanceof got.CancelError)) {
				throw error;
			}
		}
	})();

	promise.cancel = gotPromise.cancel;

	return promise;
};

const isOnline = options => {
	options = {
		timeout: 5000,
		ipVersion: 4,
		...options
	};

	if (flat(Object.values(os.networkInterfaces())).every(({internal}) => internal)) {
		return Promise.resolve(false);
	}

	if (![4, 6].includes(options.ipVersion)) {
		throw new TypeError('`ipVersion` must be 4 or 6');
	}

	const publicIpFunctionName = options.ipVersion === 4 ? 'v4' : 'v6';

	const queries = [];

	const promise = pAny([
		(async () => {
			const query = publicIp[publicIpFunctionName](options);
			queries.push(query);
			await query;
			return true;
		})(),
		(async () => {
			const query = publicIp[publicIpFunctionName]({...options, onlyHttps: true});
			queries.push(query);
			await query;
			return true;
		})(),
		(async () => {
			const query = appleCheck(options);
			queries.push(query);
			await query;
			return true;
		})()
	]);

	return pTimeout(promise, options.timeout).catch(() => {
		for (const query of queries) {
			query.cancel();
		}

		return false;
	});
};

module.exports = isOnline;
