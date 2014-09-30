'use strict';
var test = require('ava');
var isOnline = require('./');

test(function (t) {
	isOnline(function (err, online) {
		t.assert(online);
		t.end();
	});
});
