'use strict'
var http = require('http')
const proxy = require('./')

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
  }).listen(port || 8888)
}
