# is-online

> Check if the internet connection is up

Works in Node.js and the browser *(with a bundler)*.

In the browser, there is already [`navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine.onLine), but it's useless as it only tells you if there's a local connection, and not whether the internet is accessible.

## Install

```sh
npm install is-online
```

## Requirements

- Node.js 20+
- Works in modern browsers when bundled (requires `fetch` API support)

## Usage

```js
import isOnline from 'is-online';

console.log(await isOnline());
//=> true
```

### With timeout

```js
import isOnline from 'is-online';

console.log(await isOnline({timeout: 10_000}));
//=> true
```

### With abort signal

```js
import isOnline from 'is-online';

const controller = new AbortController();

setTimeout(() => {
	controller.abort();
}, 500);

const result = await isOnline({
	timeout: 3000,
	signal: controller.signal
});

console.log(result);
//=> false
```

### With fallback URLs

```js
import isOnline from 'is-online';

const result = await isOnline({
	fallbackUrls: [
		'https://www.google.com',
		'https://www.github.com',
		'http://example.com'
	]
});

console.log(result);
//=> true
```

## API

### isOnline(options?)

Returns a `Promise<boolean>` that resolves to `true` if the internet connection is up, `false` otherwise.

#### options

Type: `object`

##### timeout

Type: `number`\
Default: `5000`

Milliseconds to wait for a server to respond.

##### signal

Type: `AbortSignal`

An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to abort the operation.

When the signal is aborted, the promise will resolve to `false`.

##### ipVersion

Type: `number`\
Values: `4 | 6`\
Default: `4`

The [Internet Protocol version](https://en.wikipedia.org/wiki/Internet_Protocol#Version_history) to use.

This is an advanced option that is usually not necessary to be set, but it can prove useful to specifically assert IPv6 connectivity.

##### fallbackUrls

Type: `string[]`

Fallback URLs to check for connectivity.

Only HTTP and HTTPS URLs are supported. In Node.js, these URLs are checked only if all default connectivity checks fail. In the browser, these URLs are checked in parallel with the default checks for better resilience against ad blockers.

## How it works

The following checks are run in parallel:

**Node.js:**
- Retrieve [icanhazip.com](https://github.com/major/icanhaz) (or [ipify.org](https://www.ipify.org) as fallback) via HTTPS.
- Query `myip.opendns.com` and `o-o.myaddr.l.google.com` DNS entries.
- Retrieve Apple's Captive Portal test page (this is what iOS does).
- Check Cloudflare's website via HTTPS.

**Browser:**
- Retrieve [icanhazip.com](https://github.com/major/icanhaz) (or [ipify.org](https://www.ipify.org) as fallback) via HTTPS.

When any check succeeds, the returned Promise is resolved to `true`.

If all the above checks fail and you have provided `fallbackUrls`, those will be checked as a fallback. The URLs are checked by making HTTP/HTTPS requests (HEAD requests when possible, with GET as fallback).

## Diagnostics

The package publishes diagnostic information when connectivity checks fail using Node.js [Diagnostics Channel](https://nodejs.org/api/diagnostics_channel.html#diagnostics-channel). This is useful for debugging network issues and is only available in Node.js environments.

```js
import {subscribe} from 'node:diagnostics_channel';
import isOnline from 'is-online';

// Subscribe to failure events
subscribe('is-online:connectivity-check', message => {
	console.log('Failed URL:', message.url);
	console.log('Error:', message.error);
});

await isOnline();
```

Each failure event includes:
- `timestamp` - When the failure occurred
- `url` - The specific URL that failed
- `error` - Error details (name, message, code)

## Proxy support

To make it work through proxies, you need to set up [`global-agent`](https://github.com/gajus/global-agent).

## Maintainers

- [Sindre Sorhus](https://github.com/sindresorhus)
- [silverwind](https://github.com/silverwind)

## Related

- [is-online-cli](https://github.com/sindresorhus/is-online-cli) - CLI for this module
- [is-reachable](https://github.com/sindresorhus/is-reachable) - Check if servers are reachable
