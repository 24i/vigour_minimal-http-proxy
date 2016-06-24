'use strict'
const http = require('http')
const https = require('https')

module.exports = function proxy (options, cb, proxyRes) {
  if (options.proxy) {
    const proxyOptions = options.proxy
    const protocol = proxyOptions.protocol
    delete options.proxy
    const req = (protocol === 'https' ? https : http).request({
      hostname: proxyOptions.hostname,
      port: proxyOptions.port,
      method: proxyOptions.method || 'GET',
      withCredentials: false,
      headers: {
        proxy: JSON.stringify(options)
      }
    }, cb)
    return req
  } else {
    const protocol = options.protocol
    return (protocol === 'https' ? https : http).request(options, (res) => {
      res.pipe(proxyRes)
    })
  }
}
