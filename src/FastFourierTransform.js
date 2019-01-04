const FFT = require('fft.js')
const {Transform} = require("stream")

class FastFourierTransform extends Transform {
  constructor(windowSize=2048) {
    super({objectMode:true})
    this.windowSize = windowSize
    this.frameSize = this.windowSize * 2
    this.fftFunction = new FFT(this.windowSize)
  }

  _transform(chunk, encoding, callback) {
    if(chunk.numberOfChannels != 1)
      throw "FastFourierTransform expects mono input"
    if(chunk.buffer.length != this.windowSize)
      throw "FastFourierTransform recieved chunk of incorrect size: " + chunk.buffer.length

    var spectralBuffer = new Array(this.frameSize) // a complex array [re, im, re, im, ...]
    this.fftFunction.realTransform(spectralBuffer, chunk.buffer)
    this.fftFunction.completeSpectrum(spectralBuffer)
    this.push(spectralBuffer)

    callback()
  }
}
module.exports = FastFourierTransform
