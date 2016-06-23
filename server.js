'use strict'
var http = require('http')
const proxy = require('./get/proxy')

module.exports = function start (port) {
  http.createServer(function (req, res) {
    var str = ''
    req.on('data', function (data) {
      str += data
    })
    req.on('end', function () {
      proxy(JSON.parse(str), res, () => {
        console.log('haha!')
      })
    })
  }).listen(8888)
}
