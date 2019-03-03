export interface Options {
	/**
	 * Milliseconds to wait for a server to respond.
	 *
	 * @default 5000
	 */
	readonly timeout?: number;

	/**
	 * Internet Protocol version to use. This is an advanced option that is usually not necessary to be set, but it can prove useful to specifically assert IPv6 connectivity.
	 *
	 * @default 'v4'
	 */
	readonly version?: 'v4' | 'v6';
}

/**
 * Check if the internet connection is up.
 *
 * The following checks are run in parallel:
 * - Retrieve [icanhazip.com](https://github.com/major/icanhaz) via HTTPS
 * - Query `myip.opendns.com` on OpenDNS (Node.js only)
 * - Retrieve Apple's Captive Portal test page (Node.js only)
 *
 * When the first check succeeds, the returned Promise is resolved to `true`.
 */
export default function isOnline(options?: Options): Promise<boolean>;
