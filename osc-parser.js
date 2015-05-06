// OSC parsing based on node-osc
'use strict'

var jspack = require('jspack').jspack

module.exports = decode

function decode(data) {
  var message = []
  var address = decodeString(data)
  data = address.data

  if (address.value === '#bundle') {
    data = decodeBundle(data, message)
  } else if (data.length > 0) {
    data = decodeMessage(address, data, message)
  }

  return message
}

function decodeBundle(data, message) {
  var time = decodeTime(data)
  var bundleSize
  var content

  data = time.data

  message.push('#bundle')
  message.push(time.value)

  while (data.length > 0) {
    bundleSize = decodeInt(data)
    data = bundleSize.data

    content = data.slice(0, bundleSize.value)
    message.push(decode(content))

    data = data.slice(bundleSize.value, data.length)
  }

  return data
}

function decodeMessage(address, data, message) {
  message.push(address.value)

  var typeTags = decodeString(data)
  data = typeTags.data
  typeTags = typeTags.value

  if (typeTags[0] === ',') {
    for (var i = 1; i < typeTags.length; i++) {
      var arg = decodeByTypeTag(typeTags[i], data)
      data = arg.data
      message.push(arg.value)
    }
  }

  return data
}

function decodeByTypeTag(typeTag, data) {
  switch (typeTag) {
    case 'i':
    return decodeInt(data)
    case 'f':
    return decodeFloat(data)
    case 's':
    return decodeString(data)
  }
}

function decodeInt(data) {
  return {
    value: jspack.Unpack('>i', data.slice(0, 4))[0],
    data: data.slice(4)
  }
}

function decodeString(data) {
  var end = 0
  while (data[end] && end < data.length) {
    end++
  }
  return {
    value: data.toString('ascii', 0, end),
    data: data.slice(Math.ceil((end + 1) / 4) * 4)
  }
}

function decodeFloat(data) {
  return {
    value: jspack.Unpack('>f', data.slice(0, 4))[0],
    data: data.slice(4)
  }
}

function decodeTime(data) {
  var time = jspack.Unpack('>LL', data.slice(0, 8))
  var seconds = time[0]
  var fraction = time[1]
  return {
    value: seconds + fraction / 4294967296,
    data: data.slice(8)
  }
}
