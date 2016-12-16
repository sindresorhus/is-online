import test from 'ava';
import m from './';

test('main', async t => {
	t.true(await m());
});

test('timeout', async t => {
	t.true(await m({timeout: 500}));
});
