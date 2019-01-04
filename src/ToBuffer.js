const {Transform} = require("stream")

class ToBuffer extends Transform {
  constructor(bitDepth=16) {
    super({readableObjectMode:false, writableObjectMode:true})
    this.bitDepth = bitDepth
    this.byteDepth = this.bitDepth/8
    this.scaleFloats = Math.pow(2, this.bitDepth-4)
  }
  _transform(chunk, encoding, callback) {
    var buffer = new Buffer(this.byteDepth*chunk.buffer.length)//new Buffer(this.byteDepth * chunk.numberOfChannels * chunk.lengthInSamples)
    for(var i=0; i<chunk.buffer.length; i++)
      buffer.writeInt16LE(chunk.buffer[i] * this.scaleFloats, i*this.byteDepth)
    callback(null, buffer)
  }
}
module.exports = ToBuffer
