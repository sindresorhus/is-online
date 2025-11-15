// Need to test manually in DevTools
// $ npx esbuild browser-test.manual.js --bundle | pbcopy
import isOnline from './browser.js';

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
	console.log('Basic check - is online:', await isOnline());

	// Test with fallback URLs (should only be called if main check fails)
	console.log('With fallback URLs:', await isOnline({
		fallbackUrls: ['https://checkip.amazonaws.com'],
	}));

	// Test with very short timeout to force main check to fail and use fallback
	console.log('With short timeout and fallback:', await isOnline({
		timeout: 1, // Very short timeout to force main check to fail
		fallbackUrls: ['https://checkip.amazonaws.com'],
	}));
})();
