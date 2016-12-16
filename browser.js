'use strict';
const isReachable = require('is-reachable');
const hostnames = require('./hostnames');

module.exports = () => isReachable(hostnames);
