# is-online [![Build Status](https://travis-ci.org/sindresorhus/is-online.svg?branch=master)](https://travis-ci.org/sindresorhus/is-online)

> Check if the internet connection is up

Works in Node.js and the browser *(with browserify/webpack)*.

In the browser you have [`navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine.onLine), but it's useless as it only tells you if there's a local connection, and not whether the internet is accessible.


## Install

```
$ npm install --save is-online
```


## Usage

```js
const isOnline = require('is-online');

isOnline().then(online => {
	console.log(online);
	//=> true
});
```


## API

### isOnline([options])

#### options

Type: `Object`

##### timeout

Type: `number`<br>
Default: `2000`

Milliseconds to wait for a server to respond.

##### hostnames

Type: `string` `Array`<br>
Default: `['www.google.com', 'www.cloudflare.com', 'www.baidu.com', 'www.yandex.ru']`

One or more hosts to check.


## How it works

In Node.js, we first contact one of the thirteen [root servers](https://www.iana.org/domains/root/servers) and ask them to direct us to the servers which host the `<root>` zone (Which they are themselves). If the server answers, we return an online status.

If no satisfying answer is given within two seconds, we return an offline status. In the rare case where a firewall intercepts the packet and answers on its behalf, a second check is run which tries to connect to a series of popular web sites on port 80. If one of these connect, we return online, otherwise offline status.

In the browser, a sophisticated check like in Node.js is not possible because DNS and sockets are abstracted away. We use a check which requests an uncached `favicon.ico` on a series of popular websites. If one of these checks succeed, we return online status. If all the requests fail, we return offline status.


## Maintainers

- [silverwind](https://github.com/silverwind)


## Related

- [is-online-cli](https://github.com/sindresorhus/is-online-cli) - CLI for this module
- [is-reachable](https://github.com/sindresorhus/is-reachable) - Check if servers are reachable


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
