'use strict'
const http = require('http')
const https = require('https')

module.exports = function proxy (options, cb, proxyRes) {
  if (options.proxy) {
    const proxyOptions = options.proxy
    const protocol = proxyOptions.protocol
    delete options.proxy
    return (protocol === 'https' ? https : http).request({
      hostname: proxyOptions.hostname,
      port: proxyOptions.port,
      method: proxyOptions.method || 'GET',
      headers: {
        proxy: JSON.stringify(options)
      }
    }, cb)
  } else {
    const protocol = options.protocol
    delete options.proxy
    return (protocol === 'https' ? https : http).request(options, (res) => {
      proxyRes.setHeader('Access-Control-Allow-Origin', '*')
      res.pipe(proxyRes)
    })
  }
}
