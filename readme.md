# is-online [![Build Status](https://travis-ci.org/sindresorhus/is-online.svg?branch=master)](https://travis-ci.org/sindresorhus/is-online)

> Check if the internet connection is up

Works in Node.js and the browser *(with [browserify](http://browserify.org))*.

In the browser you have [`navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine.onLine), but it's useless as it only tells you if there's a local connection, and not whether the internet is accessible.


## Install

```
$ npm install --save is-online
```


## Usage

```js
var isOnline = require('is-online');

isOnline(function(err, online) {
	console.log(online);
	//=> true
});
```


## Node API

### isOnline(callback)

#### callback(error, online)

*Required*  
Type: `function`

`error` is there only by Node.js convention and is always `null`.


## Browser API

Same as above except the `callback` doesn't have an `error` parameter.


## How it works

In node, we first contact one of the thirteen [root servers](https://www.iana.org/domains/root/servers) and ask them to direct us to the servers which host the `<root>` zone (Which they are themselves). If the server answers, we return an online status.

If no satisfying answer is given within one second, we return an offline status. In the rare case where an firewall intercepts the packet and answers it on its behalf, a second check is run which tries to connect to a series of popular web sites on port 80. If one of these connects, we return online, otherwise offline status.

In the browser, a sophisticated check like in node is not possible because DNS and sockets are abstracted away. We use a check which requests an uncached `favicon.ico` on a series of popular websites. If one of this checks succeeds, we return online status. If all the requests fail, we return offline status.


## Contributors

- [silverwind](https://github.com/silverwind)


## Related

- [is-online-cli](https://github.com/sindresorhus/is-online-cli) - CLI for this module
- [is-reachable](https://github.com/sindresorhus/is-reachable) - Check if servers are reachable


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
