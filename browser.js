'use strict';

const publicIp = require('public-ip');

const defaults = {
	timeout: 5000,
	version: 'v4'
};

module.exports = options => {
	options = Object.assign({}, defaults, options);
	return publicIp[options.version](options).then(() => true).catch(() => false);
};
