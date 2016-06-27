'use strict'
const http = require('http')
const proxy = require('./')
const pckg = require('./package.json')

module.exports = function createProxy (port) {
  console.log('minimal-http-proxy', port)
  return http.createServer((req, res) => {
    var payload = ''
    // res.writeHead(200, 'OK', {
    //   'Content-Type': 'text/plain',
    //   'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    //   'Access-Control-Allow-Headers': 'proxy',
    //   'Accept': '*/*'
    // })

    // res.statusCode = 200
    // res.statusMessage = 'OK'
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'proxy')
    res.setHeader('Accept', '*/*')

    req.on('data', (data) => { payload += data })
    req.on('end', () => {
      const options = req.headers.proxy ? JSON.parse(req.headers.proxy) : false
      if (options) {
        const realReq = proxy(options, () => {}, res)
        if (payload) { realReq.write(payload) }
        realReq.on('error', (err) => {
          res.writeHead(
            500,
            JSON.stringify({ error: err.message, options: options }),
            { 'content-type': 'text/plain' }
          )
          res.end()
        })
        realReq.end()
      } else {
        res.end('minimal-http-proxy ' + pckg.version)
      }
    })
  }).listen(port)
}
