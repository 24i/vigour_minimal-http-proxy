'use strict'
const test = require('tape')
const proxy = require('../')
const createProxyServer = require('../server')
const http = require('http')
const pckg = require('../package.json')

function createOrigin (statusCode, message) {
  return http.createServer((req, res) => {
    var cnt = 0
    var payload = ''
    res.writeHead(statusCode || 200, message || 'OK', { hello: 'haha' })
    req.on('data', (chunk) => { payload += chunk })
    req.on('end', send)
    function send () {
      if (cnt === 10) {
        res.end()
      } else {
        cnt++
        res.write(cnt + payload)
        setTimeout(send, 10)
      }
    }
  }).listen(9090)
}

test('proxy request GET', (t) => {
  t.plan(2)
  const server = createOrigin()
  const proxyServer = createProxyServer(8888)
  const req = proxy({
    hostname: 'localhost',
    port: 9090,
    method: 'GET',
    proxy: {
      hostname: 'localhost',
      port: 8888,
      method: 'GET'
    }
  }, (res) => {
    var data = ''
    var cnt = 0
    res.on('data', (chunk) => {
      data += chunk
      cnt++
    })
    res.on('end', () => {
      t.equal(cnt, 10, 'received in 10 chunks')
      t.equal(data, '12345678910', 'correct final response')
      server.close()
      proxyServer.close()
    })
  })
  req.end()
})

test('proxy request GET as a queryparameter', (t) => {
  t.plan(2)
  const server = createOrigin()
  const proxyServer = createProxyServer(8888)
  const req = http.request({
    hostname: 'localhost',
    port: 8888,
    method: 'GET',
    path: '/?proxy=http://localhost:9090'
  }, (res) => {
    var data = ''
    var cnt = 0
    res.on('data', (chunk) => {
      data += chunk
      cnt++
    })
    res.on('end', () => {
      t.equal(cnt, 10, 'received in 10 chunks')
      t.equal(data, '12345678910', 'correct final response')
      server.close()
      proxyServer.close()
    })
  })
  req.end()
})

test('proxy request GET as a queryparameter enhance request handler', (t) => {
  t.plan(2)
  const server = createOrigin()
  const proxyServer = createProxyServer(8888, false, (req) => {
    req.url = req.url.replace('something', 'http://localhost:9090')
  })
  const req = http.request({
    hostname: 'localhost',
    port: 8888,
    method: 'GET',
    path: '/?proxy=something'
  }, (res) => {
    var data = ''
    var cnt = 0
    res.on('data', (chunk) => {
      data += chunk
      cnt++
    })
    res.on('end', () => {
      t.equal(cnt, 10, 'received in 10 chunks')
      t.equal(data, '12345678910', 'correct final response')
      server.close()
      proxyServer.close()
    })
  })
  req.end()
})

test('proxy request GET as a queryparameter enhance request handler, block response', (t) => {
  t.plan(1)
  const server = createOrigin()
  const proxyServer = createProxyServer(8888, false, (req, res) => {
    return res.end('yo wrong')
  })
  const req = http.request({
    hostname: 'localhost',
    port: 8888,
    method: 'GET',
    path: '/?proxy=something'
  }, (res) => {
    var data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      t.equal(data, 'yo wrong', 'correct response')
      server.close()
      proxyServer.close()
    })
  })
  req.end()
})

test('proxy request GET as qeuryparam with json', (t) => {
  t.plan(2)
  const server = createOrigin()
  const proxyServer = createProxyServer(8888)
  const req = http.request({
    hostname: 'localhost',
    port: 8888,
    method: 'GET',
    path: '/?proxy={"host":"localhost","port":"9090"}'
  }, (res) => {
    var data = ''
    var cnt = 0
    res.on('data', (chunk) => {
      data += chunk
      cnt++
    })
    res.on('end', () => {
      t.equal(cnt, 10, 'received in 10 chunks')
      t.equal(data, '12345678910', 'correct final response')
      server.close()
      proxyServer.close()
    })
  })
  req.end()
})

test('proxy request GET as qeuryparam with wrong json - error', (t) => {
  t.plan(1)
  const server = createOrigin()
  const proxyServer = createProxyServer(8888)
  const req = http.request({
    hostname: 'localhost',
    port: 8888,
    method: 'GET',
    path: '/?proxy={haha}'
  }, (res) => {
    var data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      t.equal(data, 'wrong json: {haha}', 'correct error message')
      server.close()
      proxyServer.close()
    })
  })
  req.end()
})

test('proxy request POST', (t) => {
  t.plan(3)
  const server = createOrigin()
  const proxyServer = createProxyServer(8888)
  const req = proxy({
    hostname: 'localhost',
    port: 9090,
    method: 'POST',
    proxy: {
      hostname: 'localhost',
      port: 8888,
      method: 'POST'
    }
  }, (res) => {
    var data = ''
    var cnt = 0
    res.on('data', (c) => {
      data += c
      cnt++
    })
    res.on('end', () => {
      t.equal(res.headers.hello, 'haha', 'correct headers from origin get passed')
      t.equal(cnt, 10, 'received in 10 chunks')
      t.equal(data, '1!2!3!4!5!6!7!8!9!10!', 'correct final response, recieves payload')
      server.close()
      proxyServer.close()
    })
  })
  req.write('!')
  req.end()
})

test('proxy request statusCode response', (t) => {
  t.plan(2)
  const statusCode = 500
  const statusMessage = 'nasty server error'
  const server = createOrigin(statusCode, statusMessage)
  const proxyServer = createProxyServer(8888)
  const req = proxy({
    hostname: 'localhost',
    port: 9090,
    method: 'GET',
    proxy: {
      hostname: 'localhost',
      port: 8888,
      method: 'GET'
    }
  }, (res) => {
    t.equal(res.statusCode, 500, 'proxy should forward the statusCode')
    t.equal(res.statusMessage, 'nasty server error')
    server.close()
    proxyServer.close()
  })
  req.end()
})

test('proxy request error forwarding', (t) => {
  t.plan(3)
  const server = createOrigin()
  const proxyServer = createProxyServer(8888)
  const errorReq = proxy({
    hostname: 'weirdurl.weirdness',
    port: 9090,
    method: 'POST',
    proxy: {
      hostname: 'localhost',
      port: 8888,
      method: 'POST'
    }
  }, (res) => {
    var data = ''
    res.on('data', (c) => {
      data += c
    })
    res.on('end', () => {
      t.equal(res.statusCode, 500, '500 statuscode')
      t.same(
        JSON.parse(res.statusMessage),
        {
          error: 'getaddrinfo ENOTFOUND weirdurl.weirdness weirdurl.weirdness:9090',
          options: {
            hostname: 'weirdurl.weirdness',
            port: 9090,
            method: 'POST'
          }
        },
        'correct errorMessage'
      )
      t.equal(data, '', 'empty response on error')
      server.close()
      proxyServer.close()
    })
  })
  errorReq.end()
})

test('proxy request error forwarding', (t) => {
  t.plan(1)
  const proxyServer = createProxyServer(8888)
  http.request({
    hostname: 'localhost',
    port: 8888
  }, (res) => {
    var str = ''
    res.on('data', (chunk) => { str += chunk })
    res.on('end', () => {
      t.equal(str, 'minimal-http-proxy ' + pckg.version, 'return minimal-http-proxy on normal requests')
      proxyServer.close()
    })
  }).end()
})

test('proxy request over https', (t) => {
  t.plan(1)
  const req = proxy({
    hostname: 'google.com',
    protocol: 'https',
    method: 'GET',
    proxy: {
      hostname: 'proxy.vigour.io',
      method: 'POST',
      protocol: 'https',
      path: '/?random=true'
    }
  }, (res) => {
    var str = ''
    res.on('data', (chunk) => { str += chunk })
    res.on('end', () => {
      t.equal(!!str, true, 'returns data')
    })
  })
  req.end()
})

test('proxy request over https using qeuryparam', (t) => {
  t.plan(1)
  const proxyServer = createProxyServer(8888)
  const req = http.request({
    hostname: 'localhost',
    port: 8888,
    method: 'GET',
    path: '/?proxy=https://google.com'
  }, (res) => {
    var str = ''
    res.on('data', (chunk) => { str += chunk })
    res.on('end', () => {
      t.equal(!!str, true, 'returns data')
      proxyServer.close()
    })
  })
  req.end()
})
