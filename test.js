'use strict';
var test = require('ava');
var isOnline = require('./');

test(function (t) {
	t.plan(1);

	isOnline(function (err, online) {
		t.assert(online);
	});
});
