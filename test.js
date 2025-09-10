import process from 'node:process';
import test from 'ava';
import isOnline from './index.js';

test('v4', async t => {
	t.true(await isOnline());
});

test('v4 with timeout', async t => {
	t.true(await isOnline({timeout: 10_000}));
});

test('v4 with impossible timeout', async t => {
	t.false(await isOnline({timeout: 1}));
});

test('v4 with abort signal', async t => {
	const controller = new AbortController();
	const promise = isOnline({signal: controller.signal});
	controller.abort();
	t.false(await promise);
});

test('v4 with pre-aborted signal', async t => {
	const controller = new AbortController();
	controller.abort();
	t.false(await isOnline({signal: controller.signal}));
});

test('v4 with abort signal after delay', async t => {
	const controller = new AbortController();
	const promise = isOnline({signal: controller.signal, timeout: 5000});
	setTimeout(() => controller.abort(), 100);
	t.false(await promise);
});

test('invalid ipVersion throws error', async t => {
	await t.throwsAsync(isOnline({ipVersion: 5}), {message: '`ipVersion` must be 4 or 6'});
});

if (!process.env.CI) {
	test('v6', async t => {
		t.true(await isOnline({ipVersion: 6}));
	});

	test('v6 with timeout', async t => {
		t.true(await isOnline({ipVersion: 6, timeout: 10_000}));
	});

	test('v6 with abort signal', async t => {
		const controller = new AbortController();
		const promise = isOnline({ipVersion: 6, signal: controller.signal});
		controller.abort();
		t.false(await promise);
	});

	test('v6 with pre-aborted signal', async t => {
		const controller = new AbortController();
		controller.abort();
		t.false(await isOnline({ipVersion: 6, signal: controller.signal}));
	});

	test('v6 with abort signal after delay', async t => {
		const controller = new AbortController();
		const promise = isOnline({ipVersion: 6, signal: controller.signal, timeout: 5000});
		setTimeout(() => controller.abort(), 100);
		t.false(await promise);
	});
}
