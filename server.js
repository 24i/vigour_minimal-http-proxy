'use strict'
const http = require('http')
const proxy = require('./')
const pckg = require('./package.json')
const url = require('url')
const querystring = require('querystring')
const isUrl = require('is-url')

module.exports = function createProxy (port, secret, fn, proxyfn) {
  console.log('minimal-http-proxy', port)
  return http.createServer((req, res) => {
    if (fn) {
      const ret = fn(req, res)
      if (ret) {
        if (ret instanceof Promise) {
          ret
          .then(proceed)
          .catch((err) => {
            res.writeHead(
              500,
              err.message,
              { 'content-type': 'text/plain' }
            )
            res.end()
          })
        }
      } else {
        proceed()
      }
    } else {
      proceed()
    }

    function proceed () {
      var payload = ''
      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, Accept, X-Request-With, proxy')
      res.setHeader('Access-Control-Allow-Credentials', true)
      res.setHeader('Accept', '*/*')
      req.on('data', (data) => { payload += data })
      req.on('end', () => {
        var options = req.headers.proxy ? JSON.parse(req.headers.proxy) : false
        if (!options) {
          const parsed = url.parse(req.url)
          const q = querystring.parse(parsed.query)
          if (q) {
            if (q.proxy) {
              if (isUrl(q.proxy)) {
                const p = url.parse(q.proxy)
                if (/^https/.test(p.protocol)) {
                  p.protocol = 'https'
                } else if (/^http/.test(p.protocol)) {
                  p.protocol = 'http'
                }
                options = {
                  protocol: p.protocol,
                  port: p.port || (p.protocol === 'https' ? 443 : 80),
                  host: p.hostname,
                  path: p.path
                }
              } else {
                try {
                  options = JSON.parse(q.proxy)
                } catch (e) {
                  res.end('wrong json: ' + q.proxy)
                  return
                }
              }
            }
          }
        }
        if (options) {
          const realReq = proxy(options, () => {}, res, proxyfn)
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
          res.writeHead(200, 'OK')
          res.end('minimal-http-proxy ' + pckg.version)
        }
      })
    }
  }).listen(port)
}
