const FFT = require('fft.js')
const {Transform} = require("stream")

class IFFT extends Transform {
  constructor(windowSize=2048, sampleRate) {
    super({objectMode: true})
    if(!sampleRate)
      throw "IFFT requires a sampleRate"
    this.windowSize = windowSize
    this.frameSize = 2 * this.windowSize
    this.fftFunction = new FFT(this.windowSize)
    this.sampleRate = sampleRate
    console.log("I am an IFFT")
  }

  _transform(spectralChunk, encoding, callback) {
    if(spectralChunk.length != this.frameSize)
      throw "IFFT recieved chunk of unexpected size: "+ spectralChunk.length
    var pcmBuffer = new Array(this.frameSize)
    this.fftFunction.inverseTransform(pcmBuffer, spectralChunk)
    var realBuffer = new Array(this.windowSize)
    for(var i=0; i<this.windowSize; i++)
      realBuffer[i] = pcmBuffer[2*i]

    callback(null, {
      sampleRate: this.sampleRate,
      lengthInSamples: this.windowSize,
      buffer: realBuffer,
      numberOfChannels: 1,
    })
  }
}
module.exports = IFFT
