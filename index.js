'use strict'
const http = require('http')
const https = require('https')

module.exports = function proxy (options, cb, proxyRes, proxyfn) {
  if (options.proxy) {
    const proxyOptions = options.proxy
    const protocol = proxyOptions.protocol
    delete options.proxy
    const requestOptions = {
      hostname: proxyOptions.hostname,
      port: proxyOptions.port,
      method: proxyOptions.method || 'GET',
      withCredentials: false,
      headers: {
        proxy: JSON.stringify(options)
      }
    }

    if (proxyOptions.path) {
      requestOptions.path = proxyOptions.path
    }

    const req = (protocol === 'https' ? https : http).request(requestOptions, cb)
    return req
  } else {
    const protocol = options.protocol
    delete options.protocol
    return (protocol === 'https' ? https : http).request(options, (res) => {
      for (let key in res.headers) {
        if (!/^access/.test(key)) {
          proxyRes.setHeader(key, res.headers[key])
        }
      }
      proxyRes.statusCode = res.statusCode
      proxyRes.statusMessage = res.statusMessage
      if (proxyfn) {
        if (!proxyfn(res, proxyRes)) {
          res.pipe(proxyRes)
        }
      } else {
        res.pipe(proxyRes)
      }
    })
  }
}
