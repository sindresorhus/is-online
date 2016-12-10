// need to test manually in devtools
// $ browserify test-browser.js > tmp.js
'use strict';
var isOnline = require('./browser');

isOnline().then(function(online) {
	console.log('online', online);
});
