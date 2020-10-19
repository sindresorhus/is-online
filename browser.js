'use strict';
const publicIp = require('public-ip');

const isOnline = async options => {
	options = {
		timeout: 5000,
		ipVersion: 4,
		...options
	};

	const publicIpFunctionName = options.ipVersion === 4 ? 'v4' : 'v6';

	try {
		await publicIp[publicIpFunctionName](options);
		return true;
	} catch (_) {
		return false;
	}
};

module.exports = isOnline;
// TODO: Remove this for the next major release
module.exports.default = isOnline;
