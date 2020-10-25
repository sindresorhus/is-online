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

if (!process.env.CI) {
	test('v6', async t => {
		t.true(await isOnline({ipVersion: 6}));
	});

	test('v6 with timeout', async t => {
		t.true(await isOnline({ipVersion: 6, timeout: 500}));
	});
}
