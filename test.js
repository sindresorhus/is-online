import test from 'ava';
import m from './';

test('v4', async t => {
	t.true(await m());
});

test('v4 with timeout', async t => {
	t.true(await m({timeout: 500}));
});

test('v4 with impossible timeout', async t => {
	t.false(await m({timeout: 1}));
});

if (!process.env.CI) {
	test('v6', async t => {
		t.true(await m({version: 'v6'}));
	});

	test('v6 with timeout', async t => {
		t.true(await m({version: 'v6', timeout: 500}));
	});
}
