// need to test manually in devtools
// $ browserify test-browser.js > tmp.js
var isOnline = require('./browser');

isOnline(function (online) {
	console.log('online', online);
});
