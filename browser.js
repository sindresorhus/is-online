'use strict';
var isReachable = require('is-reachable');
var hostnames = [
	'www.google.com',
	'www.cloudflare.com',
	'www.baidu.com',
	'www.yandex.ru'
];

module.exports = function (cb) {
	isReachable(hostnames, cb);
};
