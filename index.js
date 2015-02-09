'use strict';
var dns = require('dns');
var roots = require('root-hints')('A');

module.exports = function (cb) {
    // set dns to query the root servers
    dns.setServers(roots);

    // request the authoritative records for the root zone
    dns.resolveNs('', function (err, servers) {
        cb(null, Boolean(!err && servers.length));
    });
};
