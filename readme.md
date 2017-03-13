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
Default: `5000`

Milliseconds to wait for a server to respond.

##### version

Type: `string`<br>
Values: `v4` `v6`<br>
Default: `v4`

Internet Protocol version to use. This is an advanced option that is usually not neccessary to be set, but it can prove useful to specifically assert IPv6 connectivity.


## How it works

The following checks are run in parallel:

- Retrieve [icanhazip.com](https://github.com/major/icanhaz) via HTTPS
- Query `myip.opendns.com` on OpenDNS (Node.js only)
- Retrieve Apple's Captive Portal test page (Node.js only)

When the first check succeeds, the returned Promise is resolved to `true`.


## Maintainers

- [silverwind](https://github.com/silverwind)


## Related

- [is-online-cli](https://github.com/sindresorhus/is-online-cli) - CLI for this module
- [is-reachable](https://github.com/sindresorhus/is-reachable) - Check if servers are reachable


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
