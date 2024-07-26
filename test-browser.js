// Need to test manually in DevTools
// $ npx browserify test-browser.js | pbcopy
import isOnline from './browser.js';

console.log('is online:', await isOnline());
