import test from 'ava';
import isOnline from '.';

test('v4', async t => {
	t.true(await isOnline());
});

test('v4 with timeout', async t => {
	t.true(await isOnline({timeout: 500}));
});

test('v4 with impossible timeout', async t => {
	t.false(await isOnline({timeout: 1}));
});

test('check url', async t => {
	t.true(await isOnline({url: 'https://google.com'}));
});

if (!process.env.CI) {
	test('v6', async t => {
		t.true(await isOnline({version: 'v6'}));
	});

	test('v6 with timeout', async t => {
		t.true(await isOnline({version: 'v6', timeout: 500}));
	});
}
