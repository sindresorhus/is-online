'use strict';
var isReachable = require('is-reachable');
var hostnames = require('./hostnames');

module.exports = function (cb) {
	isReachable(hostnames, cb);
};
