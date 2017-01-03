---
title: Node.js http client with custom lookup logic
date: 10/27/2015
author: Evan Lucas <evanlucas@me.com> (http://evanlucas.com)
keywords: nodejs, iojs, node, javascript, http, dns, lookup
---

A lot of interesting things have happened with the convergence of
[io.js](https://iojs.org) and [Node.js](https://nodejs.org). The latest
Node.js (v4.2.1 at the time of writing) is based on io.js v3.x. In the
io.js v2.0.0 release, I added the ability to specify a custom lookup function
to `net.createConnection`. It allows one to do fun things like cache a dns
lookup or add certain tracing logic into lookups. This is a quite specific
use case, but can really improve performance. Below is an example of
implementing a custom lookup in Node's `http` client. This is done merely
to show the new capabilities, but I would not recommend using this particular
solution in a production environment without understanding the implications.

**Disclaimer: DNS records can change and this example does not take that
into account.**


```js
'use strict'

const http = require('http')
const net = require('net')
const dns = require('dns')

// this will hold our hosts
// [ { family: 4, address: <ip address> } ]
var hosts

// custom lookup function
// the callback must be called with the following signature:
// function(err, family, address)
// where family is either 4 for IPv4 or 6 for IPv6
function lookup(hostname, opts, cb) {
  console.log('lookup', hostname)
  opts = opts || {}
  // this fetches all of the records instead of a single one
  opts.all = true
  if (hosts && hosts.length) {
    // make sure to defer it
    // otherwise, there are some special cases where an error
    // could be thrown before a listener is added
    setImmediate(() => {
      const host = random()
      console.log('Already looked up...using', host)
      cb(null, host.address, host.family)
    })
    return
  }
  // we don't have any records cached, so go ahead and do the actual
  // dns lookup
  dns.lookup(hostname, opts, function(err, results) {
    if (err) return cb(err)
    hosts = results
    // get random one
    const host = random()
    console.log('fresh lookup...using', host)
    cb(null, host.address, host.family)
  })
}

function random() {
  return hosts[Math.floor(Math.random() * hosts.length)]
}

function get() {
  http.get({
    hostname: 'google.com'
  , path: '/'
  // specify our custom lookup function here
  , lookup: lookup
  }, function(res) {
    console.log('RESPONSE', res.statusCode)
  }).on('error', function(err) {
    console.error('ERROR', err)
  })
}

get()

setTimeout(get, 5000)
```
