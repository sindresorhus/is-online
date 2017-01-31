'use strict';
const isReachable = require('is-reachable');
const hostnames = require('./hostnames');

module.exports = options => {
	options = options || {};
	return isReachable(options.hostnames || hostnames);
};
