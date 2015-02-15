# is-online [![Build Status](https://travis-ci.org/sindresorhus/is-online.svg?branch=master)](https://travis-ci.org/sindresorhus/is-online)

> Check if the internet connection is up

Works in Node.js, CLI and the browser *(with [browserify](http://browserify.org))*.

In the browser you have [`navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine.onLine), but it's useless as it only tells you if there's a local connection, and not whether the internet is accessible.


## Install

```sh
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

### isOnline(callback)

#### callback(online)

*Required*  
Type: `function`


## CLI

<img src="screenshot.png" width="397">

```sh
$ npm install --global is-online
```

```
$ is-online --help

  Example
    is-online
    ✔︎ Online
```


## How it works

In node, we contact one of the thirteen [root servers](https://www.iana.org/domains/root/servers) and ask them to direct us to the servers which host the root zone (an empty string query with the type `NS`). If we get an answer containing one or more server, we return online status, any error on this requests leads to an offline status. In the rare case where we don't get an acceptable answer a second check is run which tries to connect to a series of popular web sites on port 80. If one of these connects, we return online, otherwise offline status.

In the browser, a sophisticated check like in node is not possible because DNS and sockets are abstracted away. We use a check which requests an uncached `favicon.ico` on a series of popular websites. If one of this checks succeeds, we return online status. If all the requests fail, we return offline status.


## Contributors

- [silverwind](https://github.com/silverwind)


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
