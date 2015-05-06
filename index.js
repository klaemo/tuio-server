'use strict'

var dgram = require('dgram')
var socketio = require('socket.io')
var oscParser = require('./osc-parser')

module.exports = function() {
  var udpSocket = null
  var io = null

  function onSocketListening() {
    var address = udpSocket.address()
    console.log('TuioServer listening on: ' + address.address + ':' + address.port)
  }

  function onSocketConnection(socket) {
    udpSocket.on('message', function(msg) {
      socket.emit('osc', oscParser(msg))
    })
  }

  function init(params) {
    udpSocket = dgram.createSocket('udp4')
    udpSocket.on('listening', onSocketListening)
    udpSocket.bind(params.oscPort, params.oscHost)

    io = socketio.listen(params.socketPort)
    io.set('log level', 1)
    io.sockets.on('connection', onSocketConnection)
  }

  return {
    init: init
  }
}
