import os from 'node:os';
import {withHttpError, withTimeout} from 'fetch-extras';
import {publicIpv4, publicIpv6} from 'public-ip';
import pAny from 'p-any';
import pTimeout from 'p-timeout';

const appleCheck = async (options, signal) => {
	// eslint-disable-next-line n/no-unsupported-features/node-builtins
	const fetchWithTimeout = withHttpError(withTimeout(globalThis.fetch, options.timeout));

	const response = await fetchWithTimeout('https://captive.apple.com/hotspot-detect.html', {
		signal,
		headers: {
			'user-agent': 'CaptiveNetworkSupport/1.0 wispr',
		},
	});

	const body = await response.text();

	if (!body?.includes('Success')) {
		throw new Error('Apple check failed');
	}
};

export default async function isOnline(options = {}) {
	options = {
		timeout: 5000,
		ipVersion: 4,
		...options,
	};

	if (Object.values(os.networkInterfaces()).flat().every(({internal}) => internal)) {
		return false;
	}

	if (![4, 6].includes(options.ipVersion)) {
		throw new TypeError('`ipVersion` must be 4 or 6');
	}

	if (options.signal?.aborted) {
		return false;
	}

	const publicIpFunction = options.ipVersion === 4 ? publicIpv4 : publicIpv6;

	const promise = (async () => {
		const promises = [
			publicIpFunction({...options, signal: options.signal}),
			publicIpFunction({...options, onlyHttps: true, signal: options.signal}),
			appleCheck(options, options.signal),
		].map(async promise => {
			await promise;
			return true;
		});

		return pAny(promises);
	})();

	if (options.signal) {
		const abortPromise = new Promise((resolve, reject) => {
			if (options.signal.aborted) {
				reject(new Error('Aborted'));
			} else {
				options.signal.addEventListener('abort', () => {
					reject(new Error('Aborted'));
				}, {once: true});
			}
		});

		try {
			return await pTimeout(Promise.race([promise, abortPromise]), {milliseconds: options.timeout});
		} catch {
			return false;
		}
	}

	try {
		return await pTimeout(promise, {milliseconds: options.timeout});
	} catch {
		return false;
	}
}
