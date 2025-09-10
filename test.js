import {test} from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import isOnline from './index.js';

test('v4', async () => {
	assert.equal(await isOnline(), true);
});

test('v4 with timeout', async () => {
	assert.equal(await isOnline({timeout: 10_000}), true);
});

test('v4 with impossible timeout', async () => {
	assert.equal(await isOnline({timeout: 1}), false);
});

test('v4 with abort signal', async () => {
	const controller = new AbortController();
	const promise = isOnline({signal: controller.signal});
	controller.abort();
	assert.equal(await promise, false);
});

test('v4 with pre-aborted signal', async () => {
	const controller = new AbortController();
	controller.abort();
	assert.equal(await isOnline({signal: controller.signal}), false);
});

test('v4 with abort signal after delay', async () => {
	const controller = new AbortController();
	const promise = isOnline({signal: controller.signal, timeout: 5000});
	setImmediate(() => controller.abort());
	assert.equal(await promise, false);
});

test('invalid ipVersion throws error', async () => {
	await assert.rejects(isOnline({ipVersion: 5}), {message: '`ipVersion` must be 4 or 6'});
});

if (!process.env.CI) {
	test('v6', async () => {
		assert.equal(await isOnline({ipVersion: 6}), true);
	});

	test('v6 with timeout', async () => {
		assert.equal(await isOnline({ipVersion: 6, timeout: 10_000}), true);
	});

	test('v6 with abort signal', async () => {
		const controller = new AbortController();
		const promise = isOnline({ipVersion: 6, signal: controller.signal});
		controller.abort();
		assert.equal(await promise, false);
	});

	test('v6 with pre-aborted signal', async () => {
		const controller = new AbortController();
		controller.abort();
		assert.equal(await isOnline({ipVersion: 6, signal: controller.signal}), false);
	});

	test('v6 with abort signal after delay', async () => {
		const controller = new AbortController();
		const promise = isOnline({ipVersion: 6, signal: controller.signal, timeout: 5000});
		setImmediate(() => controller.abort());
		assert.equal(await promise, false);
	});
}
