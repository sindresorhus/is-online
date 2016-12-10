'use strict';
var test = require('ava');
var isOnline = require('./');

test(function (t) {
	t.plan(1);

	isOnline()
		.then(function (online) { t.assert(online); })
		.catch(function (err) { t.assert(!err, err); });
});

test(function (t) {
	t.plan(1);

	isOnline({ timeout: 500 })
		.then(function (online) { t.assert(online); })
		.catch(function (err) { t.assert(!err, err); });
});
