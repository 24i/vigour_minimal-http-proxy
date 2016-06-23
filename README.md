# minimal-http-proxy
<!-- VDOC.badges travis; standard; npm; coveralls -->
<!-- DON'T EDIT THIS SECTION (including comments), INSTEAD RE-RUN `vdoc` TO UPDATE -->
[![Build Status](https://travis-ci.org/vigour-io/minimal-http-proxy.svg?branch=master)](https://travis-ci.org/vigour-io/minimal-http-proxy)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/minimal-http-proxy.svg)](https://badge.fury.io/js/minimal-http-proxy)
[![Coverage Status](https://coveralls.io/repos/github/vigour-io/minimal-http-proxy/badge.svg?branch=master)](https://coveralls.io/github/vigour-io/minimal-http-proxy?branch=master)

<!-- VDOC END -->

```javascript
 // request, but trough a proxy
 const proxyServer = createProxyServer(8888)
  const req = proxy({
    // options that will be send to the proxy server
    hostname: 'localhost',
    port: 9090,
    method: 'POST',
    proxy: {
      // all proxy specific options
      hostname: 'localhost',
      port: 8888,
      method: 'POST'
    }
  }, (res) => {
    var data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      console.log('succes!')
      server.close()
      proxyServer.close()
    })
  })
  req.write('!')
  req.end()
```
