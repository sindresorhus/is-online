'use strict';
var test = require('ava');
var isOnline = require('./');

test('isOnline()', function (t) {
	isOnline(function (err, online) {
		t.assert(online);
		t.end();
	});
});

test('custom domain', function (t) {
	isOnline('github.com', function (err, online) {
		t.assert(online);
		t.end();
	});
});
