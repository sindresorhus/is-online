// Need to test manually in DevTools
// $ browserify test-browser.js | pbcopy
import isOnline from './browser.js';

console.log('is online:', await isOnline());
