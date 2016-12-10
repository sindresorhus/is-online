'use strict';
var isReachable = require('is-reachable');
var hostnames = require('./hostnames');

module.exports = function () {
	return isReachable(hostnames);
};
