'use strict';
const publicIp = require('public-ip');

const isOnline = async options => {
	options = {
		timeout: 5000,
		version: 'v4',
		...options
	};

	try {
		await publicIp[options.version](options);
		return true;
	} catch (_) {
		return false;
	}
};

module.exports = isOnline;
// TODO: Remove this for the next major release
module.exports.default = isOnline;
