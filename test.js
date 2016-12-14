'use strict';
var test = require('ava');
var isOnline = require('./');

test(async (t) => {
	isOnline()
		.then( (online) => { t.true(online); })
});

test(async (t) => {
	isOnline({ timeout: 500 })
		.then( (online) => { t.true(online); })
});

test(async (t) => {
	var result = await isOnline();
	t.true(result);
});
