/* eslint-env browser */
import {publicIpv4, publicIpv6} from 'public-ip';

const urlCheck = async (url, options, signal) => {
	// Validate URL
	const urlObject = new URL(url);

	// Only allow HTTP and HTTPS
	if (!['http:', 'https:'].includes(urlObject.protocol)) {
		throw new Error(`Unsupported protocol: ${urlObject.protocol}`);
	}

	// Use fetch with timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), options.timeout);

	if (signal) {
		signal.addEventListener('abort', () => controller.abort(), {once: true});
	}

	try {
		// Use HEAD request when possible to minimize data transfer
		const response = await fetch(url, {method: 'HEAD', signal: controller.signal});
		if (!response.ok && response.status === 405) {
			// If HEAD fails with 405, try GET as fallback (some servers don't support HEAD)
			const getResponse = await fetch(url, {method: 'GET', signal: controller.signal});
			if (!getResponse.ok) {
				throw new Error(`HTTP ${getResponse.status}`);
			}
		} else if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
	} catch (error) {
		// If HEAD fails, try GET as fallback (some servers don't support HEAD)
		if (error.message?.includes('Method Not Allowed')) {
			const getResponse = await fetch(url, {method: 'GET', signal: controller.signal});
			if (!getResponse.ok) {
				throw new Error(`HTTP ${getResponse.status}`);
			}
		} else {
			throw error;
		}
	} finally {
		clearTimeout(timeoutId);
	}
};

const checkUrls = async (urls, options, signal) => {
	if (!urls?.length) {
		throw new Error('No URLs to check');
	}

	// Try all URLs in parallel and return true if any succeeds
	const promises = urls.map(url => urlCheck(url, options, signal));

	// Wait for the first successful result
	return Promise.any(promises);
};

export default async function isOnline(options = {}) {
	options = {
		timeout: 5000,
		ipVersion: 4,
		...options,
	};

	if (!navigator?.onLine) {
		return false;
	}

	const publicIpFunction = options.ipVersion === 4 ? publicIpv4 : publicIpv6;

	try {
		// Main check using public-ip (which includes icanhazip and ipify fallback)
		await publicIpFunction({...options, signal: options.signal});
		return true;
	} catch {
		// Main check failed, try fallback URLs if provided
		if (options.fallbackUrls?.length > 0) {
			try {
				await checkUrls(options.fallbackUrls, options, options.signal);
				return true;
			} catch {
				// All fallback URLs also failed
				return false;
			}
		}

		// No fallback URLs provided, main check failed
		return false;
	}
}
