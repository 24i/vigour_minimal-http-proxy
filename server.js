'use strict'
const http = require('http')
const proxy = require('./')
const pckg = require('./package.json')

module.exports = function createProxy (port) {
  console.log('minimal-http-proxy', port)
  return http.createServer((req, res) => {
    var payload = ''
    req.on('data', (data) => { payload += data })
    req.on('end', () => {
      const options = req.headers.proxy ? JSON.parse(req.headers.proxy) : false
      if (options) {
        const realReq = proxy(options, () => {}, res)
        if (payload) { realReq.write(payload) }
        realReq.on('error', (err) => {
          res.statusCode = 500
          res.statusMessage = JSON.stringify({ error: err.message, options: options })
          res.end()
        })
        realReq.end()
      } else {
        res.statusCode = 500
        res.statusMessage = 'no payload passed'
        res.end('minimal-http-proxy ' + pckg.version)
      }
    })
  }).listen(port)
}
