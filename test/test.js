'use strict'
var express = require('express')
var tuio = require('../')

var app = express()

var server = app.listen(5000)

tuio().init({
  oscPort: 3333,
  oscHost: '0.0.0.0',
  socketPort: server
})
