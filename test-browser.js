// Need to test manually in DevTools
// $ browserify test-browser.js | pbcopy
'use strict';
const isOnline = require('./browser');

(async () => {
	console.log('is online:', await isOnline());
})();
