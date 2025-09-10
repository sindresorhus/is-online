import os from 'node:os';
import {channel} from 'node:diagnostics_channel';
import {withHttpError, withTimeout} from 'fetch-extras';
import {publicIpv4, publicIpv6} from 'public-ip';
import pAny from 'p-any';
import pTimeout from 'p-timeout';

const diagnosticsChannel = channel('is-online:connectivity-check');

const publishFailure = (url, error) => {
	if (!diagnosticsChannel.hasSubscribers) {
		return;
	}

	try {
		diagnosticsChannel.publish({
			timestamp: Date.now(),
			url,
			error: {
				name: error.constructor.name,
				message: error.message,
				code: error.code,
			},
		});
	} catch {
		// Ignore diagnostics errors - never affect main functionality
	}
};

const fetchUrl = async (url, options, signal, fetchOptions = {}) => {
	const fetchWithTimeout = withHttpError(withTimeout(globalThis.fetch, options.timeout));
	return fetchWithTimeout(url, {signal, ...fetchOptions});
};

const appleCheck = async (options, signal) => {
	const url = 'https://captive.apple.com/hotspot-detect.html';
	try {
		const response = await fetchUrl(url, options, signal, {
			method: 'GET', // Apple captive portal requires GET to return body content
			headers: {
				'user-agent': 'CaptiveNetworkSupport/1.0 wispr',
			},
		});

		const body = await response.text();

		if (!body?.includes('Success')) {
			throw new Error('Apple check failed');
		}
	} catch (error) {
		publishFailure(url, error);
		throw error;
	}
};

const urlCheck = async (url, options, signal) => {
	// Validate URL
	let urlObject;
	try {
		urlObject = new URL(url);
	} catch (error) {
		// Invalid URL format
		publishFailure(url, error);
		throw error;
	}

	// Only allow HTTP and HTTPS
	if (!['http:', 'https:'].includes(urlObject.protocol)) {
		const error = new Error(`Unsupported protocol: ${urlObject.protocol}`);
		publishFailure(url, error);
		throw error;
	}

	try {
		// Use HEAD request when possible to minimize data transfer
		await fetchUrl(url, options, signal, {method: 'HEAD'});
	} catch (error) {
		// If HEAD fails, try GET as fallback (some servers don't support HEAD)
		if (error.status === 405 || error.message?.includes('Method Not Allowed')) {
			await fetchUrl(url, options, signal, {method: 'GET'});
		} else {
			// Publish failure for this specific URL
			publishFailure(url, error);
			throw error;
		}
	}
};

const createAbortPromise = signal => new Promise((resolve, reject) => {
	if (signal.aborted) {
		reject(new Error('Aborted'));
	} else {
		signal.addEventListener('abort', () => {
			reject(new Error('Aborted'));
		}, {once: true});
	}
});

const tryFallbackUrls = async options => {
	if (!options.fallbackUrls?.length) {
		return false;
	}

	if (options.signal?.aborted) {
		return false;
	}

	try {
		const urlPromise = checkUrls(options.fallbackUrls, options, options.signal);

		if (options.signal) {
			const abortPromise = createAbortPromise(options.signal);
			await pTimeout(Promise.race([urlPromise, abortPromise]), {milliseconds: options.timeout});
		} else {
			await pTimeout(urlPromise, {milliseconds: options.timeout});
		}

		return true;
	} catch {
		// Individual URL failures are already published by urlCheck
		return false;
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

	const publicIpCheck = async (onlyHttps = false) => {
		const serviceName = onlyHttps ? 'https://api.ipify.org' : 'https://icanhazip.com';
		try {
			await publicIpFunction({...options, onlyHttps, signal: options.signal});
		} catch (error) {
			publishFailure(serviceName, error);
			throw error;
		}
	};

	const promise = (async () => {
		const promises = [
			publicIpCheck(false),
			publicIpCheck(true),
			appleCheck(options, options.signal),
			// Cloudflare as additional fallback
			urlCheck('https://cloudflare.com/', options, options.signal),
		].map(async promise => {
			await promise;
			return true;
		});

		return pAny(promises);
	})();

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
		// Individual check failures are already published by each check
		return tryFallbackUrls(options);
	}
}
