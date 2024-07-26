/* eslint-env browser */
import {publicIpv4, publicIpv6} from 'public-ip';

export default async function isOnline(options) {
	options = {
		timeout: 5000,
		ipVersion: 4,
		...options,
	};

	// eslint-disable-next-line n/no-unsupported-features/node-builtins
	if (!navigator?.onLine) {
		return false;
	}

	const publicIpFunction = options.ipVersion === 4 ? publicIpv4 : publicIpv6;

	try {
		await publicIpFunction(options);
		return true;
	} catch {
		return false;
	}
}
