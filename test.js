'use strict';
var test = require('ava');
var isOnline = require('./');

test(function (t) {
	t.plan(2);

	isOnline(function (err, online) {
		t.assert(!err, err);
		t.assert(online);
	});
});
