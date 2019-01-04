/*
  A bin by bin spectral low pass filter.
  IN: FFT Complex data
  OUT: FFT Complex data
*/

const {Transform} = require("stream")

class ReduceTransients extends Transform {
  constructor(cutOffF=5, hopRate, frameSize) {
    super({objectMode:true})

    var costh = 2 - Math.cos(Math.PI*2 * cutOffF / hopRate)
    this.b = Math.sqrt(costh*costh - 1) - costh
    this.a = 1 + this.b

    this.previousFrame = new Array(frameSize).fill(0)
  }

  _transform(spectralFrame, encoding, callback) {
    var outputFrame = spectralFrame.slice()

    for(var i in spectralFrame)
      outputFrame[i] = this.a * spectralFrame[i] - this.b * this.previousFrame[i]

    this.previousFrame = outputFrame
    callback(null, outputFrame)
  }
}

module.exports = ReduceTransients
