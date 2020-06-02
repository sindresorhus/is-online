'use strict';
const got = require('got');
const publicIp = require('public-ip');
const pAny = require('p-any');
const pTimeout = require('p-timeout');

const appleCheck = options => {
	const gotPromise = got('https://captive.apple.com/hotspot-detect.html', {
		timeout: options.timeout,
		family: options.version === 'v4' ? 4 : 6,
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
// TODO: Remove this for the next major release
module.exports.default = isOnline;
