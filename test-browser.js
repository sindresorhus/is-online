// Need to test manually in devtools
// $ browserify test-browser.js | pbcopy
'use strict';
const isOnline = require('./browser');

isOnline().then(online => {
	console.log('online', online);
});
