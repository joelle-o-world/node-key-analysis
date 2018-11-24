const {Transform} = require("stream")

class SpectralMagnitudes extends Transform {
  constructor(windowSize) {
    super({objectMode:true})
    this.windowSize = windowSize || 2048
    this.frameSize = this.windowSize * 2
    //this.windowSizeReciprocal = 1/this.windowSize
  }

  _transform(chunk, encoding, callback) {
    if(chunk.length != this.frameSize)
      throw "SpectralMagnitudes recieved chunk of unexpected size: "+ chunk.length

    var mags = new Array(chunk.length/2)
    for(var bin=0; bin<mags.length; bin++) {
      var a = chunk[bin*2]
      var b = chunk[bin*2+1]
      mags[bin] = Math.sqrt( a*a + b*b )// * this.windowSizeReciprocal
    }
    this.push(mags)
    callback()
  }
}
module.exports = SpectralMagnitudes
