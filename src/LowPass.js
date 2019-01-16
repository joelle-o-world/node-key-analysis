/*
  A Butterworth low pass filter (order 2)
*/

const {Transform} = require("stream")

class LowPass extends Transform {
  constructor(f, sampleRate=44100) {
    super({objectMode:true})
    this.sampleRate = sampleRate
    this.f = f

    this.x1 = [] // input delayed by one samples for each channel
    this.x2 = [] // input delated by two samples for each channel
    this.y1 = [] // output delayed by one samples for each channel
    this.y2 = [] // output delayed by two samples for each channel
  }

  set f(f) {
    this._f = f

    var lamda = 1/Math.tan(Math.PI * f/this.sampleRate)
    var lamdaSquared = lamda * lamda
    this.a0 = 1/(1 + 2*lamda + lamdaSquared)
    this.a1 = 2 * this.a0
    this.a2 = this.a0
    this.b1 = 2 * this.a0 * (1 - lamdaSquared)
    this.b2 = this.a0 * (1 - 2 * lamda + lamdaSquared)
  }
  get f() {
    return this._f
  }

  _transform(chunk, encoding, callback) {
    // chunk format: {buffer (interleaved), numberOfChannels, lengthInSamples, sampleRate}
    if(chunk.sampleRate != this.sampleRate)
      throw "LowPass recieved chunk of unexpected sampleRate, " + chunk.sampleRate

    var outBuffer = new Array(chunk.numberOfChannels * chunk.lengthInSamples)
    for(var c=0; c<chunk.numberOfChannels; c++) {
      for(var t=c; t<chunk.lengthInSamples; t+=chunk.numberOfChannels) {
        outBuffer[t] = (
          this.a0 * chunk.buffer[t] +
          this.a1 * (this.x1[c] || 0) +
          this.a2 * (this.x2[c] || 0) -
          this.b1 * (this.y1[c] || 0) -
          this.b2 * (this.y2[c] || 0)
        )
        this.y2[c] = this.y1[c] || 0
        this.y1[c] = outBuffer[t]
        this.x2[c] = this.x1[c] || 0
        this.x1[c] = chunk.buffer[t]
      }
    }
    callback(null, {
      buffer: outBuffer,
      numberOfChannels: chunk.numberOfChannels,
      lengthInSamples: chunk.numberOfChannels,
      sampleRate: chunk.sampleRate
    })
  }
}
module.exports = LowPass
