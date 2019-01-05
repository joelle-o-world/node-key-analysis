const {Transform} = require("stream")

class FrameFilter extends Transform {
  constructor(frame, frameSize) {
    super({objectMode: true})
    this.frame = frame
    this.frameSize = frameSize
  }

  _transform(chunk, encoding, callback) {
  //  if(chunk.length != this.frame.length)
  //    throw "Chunk length ("+chunk.length+") doesn't match multiply frame length ("+this.frame.length+")"
    var frame = this.frame

    var outputChunk = new Array(this.frameSize).fill(0)
    for(var i=0; i<this.frameSize; i+=2) {
      if(!frame[i] && !frame[i+1])
        continue
      var newPhasor = complexMultiply(frame[i], frame[i+1], chunk[i] || 0, chunk[i+1] || 0)
      outputChunk[i] = newPhasor.re
      outputChunk[i+1] = newPhasor.im
    }
    callback(null, outputChunk)
  }

  setRealFrame(frame) {
    var complexFrame = new Array(frame.length*2)
    for(var i=0; i<frame.length; i++)
      complexFrame[i*2] = frame[i]
    this.frame = complexFrame
  }
}
module.exports = FrameFilter


function complexMultiply(re1, im1, re2, im2) {
  return {
    re: re1 * re2 - im1 * im2,
    im: re1 * im2 + re2 * im1,
  }
}
