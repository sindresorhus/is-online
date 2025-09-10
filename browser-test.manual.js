// Need to test manually in DevTools
// $ npx esbuild browser-test.manual.js --bundle | pbcopy
import isOnline from './browser.js';

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
	console.log('is online:', await isOnline());
})();
