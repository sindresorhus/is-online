#!/usr/bin/env node
'use strict';
var logSymbols = require('log-symbols');
var meow = require('meow');
var isOnline = require('./');

meow({
	help: [
		'Example',
		'  $ is-online',
		'  ' + logSymbols.success + ' Online'
	]
});

isOnline(function (err, online) {
	console.log(online ? logSymbols.success + ' Online' : logSymbols.error + ' Offline');
	process.exit(online ? 0 : 1);
});
