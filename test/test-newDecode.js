const decode = require("./src/Decode2.js")
const {Writable} = require("stream")

var monitor = new Writable({objectMode:true})
monitor._write = function(chunk, encoding, callback) {
  var buffer = new Float32Array()
  callback()
}

var myDecode = decode("music/Halo.mp3")
myDecode.pipe(monitor)
