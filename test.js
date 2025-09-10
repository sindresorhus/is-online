import {test} from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import {subscribe, unsubscribe} from 'node:diagnostics_channel';
import {createTestServer} from './test-server.js';
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

test('invalid ipVersion throws error', async () => {
	await assert.rejects(isOnline({ipVersion: 5}), {message: '`ipVersion` must be 4 or 6'});
});

test('fallbackUrls when main checks fail', async () => {
	// Create a test server
	const testServer = await createTestServer();

	try {
		// Mock the main checks to fail by using invalid network
		// Use longer timeout to allow fallback URL check to work, but main checks should still fail due to network issues
		const result = await isOnline({
			timeout: 1000, // Give enough time for fallback URL check to succeed
			fallbackUrls: [testServer.url],
		});

		// Should return true because fallback URL check succeeds
		assert.equal(result, true);
	} finally {
		testServer.close();
	}
});

test('fallbackUrls with multiple URLs', async () => {
	const testServer1 = await createTestServer();
	const testServer2 = await createTestServer();

	try {
		const result = await isOnline({
			timeout: 100, // Short timeout to make main checks fail, but enough for fallback URL check
			fallbackUrls: [
				'http://this-should-not-exist-12345.com',
				testServer1.url,
				testServer2.url,
			],
		});

		assert.equal(result, true);
	} finally {
		testServer1.close();
		testServer2.close();
	}
});

test('fallbackUrls all fail', async () => {
	const result = await isOnline({
		timeout: 1, // Very short timeout to ensure main checks fail
		fallbackUrls: [
			'http://this-should-not-exist-12345.com',
			'http://another-non-existent-host-67890.com',
		],
	});

	assert.equal(result, false);
});

test('fallbackUrls with abort signal', async () => {
	const testServer = await createTestServer();

	try {
		const controller = new AbortController();
		const promise = isOnline({
			timeout: 100, // Short timeout to make main checks fail
			fallbackUrls: [testServer.url],
			signal: controller.signal,
		});

		controller.abort();
		assert.equal(await promise, false);
	} finally {
		testServer.close();
	}
});

test('invalid fallbackUrls should not crash', async () => {
	// Use pre-aborted signal to ensure main checks fail immediately
	const controller = new AbortController();
	controller.abort();

	const result = await isOnline({
		signal: controller.signal,
		fallbackUrls: [
			'not-a-valid-url',
			'ftp://invalid-protocol.com',
		],
	});

	assert.equal(result, false);
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
}

test('diagnostics channel publishes failure events', async () => {
	const diagnostics = [];
	const listener = message => {
		diagnostics.push(message);
	};

	subscribe('is-online:connectivity-check', listener);

	try {
		// Success case might publish some events in CI due to network differences
		// What matters is that failure case publishes diagnostic events
		await isOnline();

		// Clear diagnostics for failure test
		diagnostics.length = 0;

		// Failure case should publish diagnostic info
		await isOnline({timeout: 1});
		assert.ok(diagnostics.length > 0);
		assert.ok(diagnostics[0].url);
		assert.ok(diagnostics[0].error);
		assert.ok(diagnostics[0].timestamp);
	} finally {
		unsubscribe('is-online:connectivity-check', listener);
	}
});
