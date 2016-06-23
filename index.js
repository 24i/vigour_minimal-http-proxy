'use strict'
var http = require('http')

module.exports = function proxy (options, cb, proxyRes) {
  if (!proxyRes) {
    const req = http.request({
      hostname: 'localhost',
      port: 8888,
      method: 'POST'
    }, cb)
    // needs to be different -- add as headers and parse them
    req.write(JSON.stringify(options))
    req.end()
  } else {
    // not only get... just do http request
    http.get(options, (res) => {
      var data = ''
      proxyRes.setHeader('Access-Control-Allow-Origin', '*')
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => { proxyRes.end(data) })
    })
  }
}
