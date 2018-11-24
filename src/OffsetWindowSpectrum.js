const {Transform} = require("stream")
const FFT = require("fft.js")
const Windower = require("./Windower.js")

class OffsetWindowSpectrum extends Windower {
  constructor(windowSize, envelopeType) {
    super({objectMode: true})

    this.windowSize = windowSize || 2048
    this.envelopeType = envelopeType || "hamming"
    this.envelopeName = this.envelopeType + this.windowSize

    // get the window envelope
    var envelope = Windower.getEnvelope(this.windowSize, this.envelopeType)

    /*// apply noise to envelope
    envelope = envelope.map((x) => {
      return (Math.random()*2-1) * x
    })*/

    // get the spetrum
    var spectrum = new Array(this.windowSize*2)
    new FFT(this.windowSize).realTransform(spectrum, envelope)

    // invert the spectrum
    for(var bin=0; bin<spectrum.length; bin+=2) {
      var inverse = complexInverse(spectrum[bin], spectrum[bin+1])
      spectrum[bin] = inverse.re
      spectrum[bin+1] = inverse.im
    }

    this.frame = spectrum
  }

  _transform(chunk, encoding, callback) {
    var outChunk = new Array(chunk.length)
    for(var bin=0; bin<chunk.length; bin+=2) {
      outChunk[bin] = (chunk[bin] * this.frame[bin] - chunk[bin+1] * this.frame[bin+1]) || 0
      outChunk[bin+1] = (chunk[bin] * this.frame[bin+1] + chunk[bin+1] * this.frame[bin]) || 0
      //console.log(outChunk[bin], outChunk[bin+1])
    }
    callback(null, outChunk)
  }
}
module.exports = OffsetWindowSpectrum

function complexInverse( re, im ) {
  var k = 1/(re*re + im*im)
  return {
    re: re*k,
    im: im*k,
  }
}
