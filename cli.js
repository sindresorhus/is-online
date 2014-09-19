#!/usr/bin/env node
'use strict';
var logSymbols = require('log-symbols');
var pkg = require('./package.json');
var isOnline = require('./');
var argv = process.argv.slice(2);
var input = argv[0];

function help() {
	console.log([
		'',
		'  ' + pkg.description,
		'',
		'  Example',
		'    is-online',
		'    ' + logSymbols.success + ' Online'
	].join('\n'));
}

if (argv.indexOf('--help') !== -1) {
	help();
	return;
}

if (argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

isOnline(function (err, online) {
	console.log(online ? logSymbols.success + ' Online' : logSymbols.error + ' Offline');
	process.exit(online ? 0 : 1);
});
