/* eslint-env browser */
'use strict';
const publicIp = require('public-ip');

const isOnline = async options => {
	options = {
		timeout: 5000,
		ipVersion: 4,
		...options
	};

	if (navigator && !navigator.onLine) {
		return false;
	}

	const publicIpFunctionName = options.ipVersion === 4 ? 'v4' : 'v6';

	try {
		await publicIp[publicIpFunctionName](options);
		return true;
	} catch (_) {
		return false;
	}
};

module.exports = isOnline;
