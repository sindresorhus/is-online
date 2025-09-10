import os from 'node:os';
import {withHttpError, withTimeout} from 'fetch-extras';
import {publicIpv4, publicIpv6} from 'public-ip';
import pAny from 'p-any';
import pTimeout from 'p-timeout';

const fetchUrl = async (url, options, signal, fetchOptions = {}) => {
	const fetchWithTimeout = withHttpError(withTimeout(globalThis.fetch, options.timeout));
	return fetchWithTimeout(url, {signal, ...fetchOptions});
};

const appleCheck = async (options, signal) => {
	const response = await fetchUrl('https://captive.apple.com/hotspot-detect.html', options, signal, {
		method: 'GET', // Apple captive portal requires GET to return body content
		headers: {
			'user-agent': 'CaptiveNetworkSupport/1.0 wispr',
		},
	});

	const body = await response.text();

	if (!body?.includes('Success')) {
		throw new Error('Apple check failed');
	}
};

const urlCheck = async (url, options, signal) => {
	// Validate URL
	const urlObject = new URL(url);

	// Only allow HTTP and HTTPS
	if (!['http:', 'https:'].includes(urlObject.protocol)) {
		throw new Error(`Unsupported protocol: ${urlObject.protocol}`);
	}

	try {
		// Use HEAD request when possible to minimize data transfer
		await fetchUrl(url, options, signal, {method: 'HEAD'});
	} catch (error) {
		// If HEAD fails, try GET as fallback (some servers don't support HEAD)
		if (error.status === 405 || error.message?.includes('Method Not Allowed')) {
			await fetchUrl(url, options, signal, {method: 'GET'});
		} else {
			throw error;
		}
	}
};

const checkUrls = async (urls, options, signal) => {
	if (!urls?.length) {
		throw new Error('No URLs to check');
	}

	const promises = urls.map(async url => {
		await urlCheck(url, options, signal);
		return true;
	});

	return pAny(promises);
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
			// Cloudflare as additional fallback
			urlCheck('https://cloudflare.com/', options, options.signal),
		].map(async promise => {
			await promise;
			return true;
		});

		return pAny(promises);
	})();

	const createAbortPromise = signal => new Promise((resolve, reject) => {
		if (signal.aborted) {
			reject(new Error('Aborted'));
		} else {
			signal.addEventListener('abort', () => {
				reject(new Error('Aborted'));
			}, {once: true});
		}
	});

	// Try main checks first
	// eslint-disable-next-line no-warning-comments
	// TODO: Use AbortSignal.timeout() instead of pTimeout when it's widely supported
	const tryMainChecks = async () => {
		if (options.signal) {
			const abortPromise = createAbortPromise(options.signal);
			return pTimeout(Promise.race([promise, abortPromise]), {milliseconds: options.timeout});
		}

		return pTimeout(promise, {milliseconds: options.timeout});
	};

	try {
		return await tryMainChecks();
	} catch {
		// Main checks failed, try fallback URLs if provided
		if (options.fallbackUrls?.length > 0) {
			try {
				if (options.signal?.aborted) {
					return false;
				}

				const urlPromise = checkUrls(options.fallbackUrls, options, options.signal);

				if (options.signal) {
					const abortPromise = createAbortPromise(options.signal);
					await pTimeout(Promise.race([urlPromise, abortPromise]), {milliseconds: options.timeout});
				} else {
					await pTimeout(urlPromise, {milliseconds: options.timeout});
				}

				return true;
			} catch {
				return false;
			}
		}

		return false;
	}
}
