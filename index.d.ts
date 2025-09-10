export type Options = {
	/**
	Milliseconds to wait for a server to respond.

	@default 5000
	*/
	readonly timeout?: number;

	/**
	AbortSignal to cancel the operation.

	When aborted, the promise will resolve to `false`.

	@example
	```
	import isOnline from 'is-online';

	const controller = new AbortController();

	setTimeout(() => {
		controller.abort();
	}, 500);

	const result = await isOnline({signal: controller.signal});
	console.log(result);
	//=> false
	```
	*/
	readonly signal?: AbortSignal;

	/**
	[Internet Protocol version](https://en.wikipedia.org/wiki/Internet_Protocol#Version_history) to use.

	This is an advanced option that is usually not necessary to be set, but it can prove useful to specifically assert IPv6 connectivity.

	@default 4
	*/
	readonly ipVersion?: 4 | 6;

	/**
	Fallback URLs to check for connectivity.

	Only HTTP and HTTPS URLs are supported. In Node.js, these URLs are checked only if all default connectivity checks fail. In the browser, these URLs are checked in parallel with the default checks for better resilience against ad blockers.

	@example
	```
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
	*/
	readonly fallbackUrls?: readonly string[];
};

/**
Check if the internet connection is up.

The following checks are run in parallel:

Node.js:
- Retrieve [icanhazip.com](https://github.com/major/icanhaz) (or ipify.org as fallback) via HTTPS
- Query `myip.opendns.com` on OpenDNS
- Retrieve Apple's Captive Portal test page
- Check Cloudflare's website via HTTPS

Browser:
- Retrieve [icanhazip.com](https://github.com/major/icanhaz) (or ipify.org as fallback) via HTTPS
- Check Cloudflare's 1.1.1.1 service via HTTPS (helps when ad blockers block icanhazip.com)

When any check succeeds, the returned Promise is resolved to `true`.

@returns A promise that resolves to `true` if the internet connection is up, `false` otherwise.

@example
```
import isOnline from 'is-online';

console.log(await isOnline());
//=> true
```

@example
```
import isOnline from 'is-online';

// With timeout
console.log(await isOnline({timeout: 10_000}));
//=> true

// With IPv6
console.log(await isOnline({ipVersion: 6}));
//=> true
```
*/
export default function isOnline(options?: Options): Promise<boolean>;
