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

isOnline(err, online) {
	console.log(online);
	//=> true
});
```


## API

### isOnline([domains], callback)

#### domains

*Optional*  
Type: `array`  
Default: `['google.com', 'opendns.com', 'baidu.com']` *(recommend not to change this)*

The domains will be checked concurrently and is multiple for redundancy.

When used in the browser, make sure the domains you choose has a `favicon.ico` in the root.

#### callback(error, online)

*Required*  
Type: `function`

`error` is there only by Node.js convention and is always `null`.


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


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
