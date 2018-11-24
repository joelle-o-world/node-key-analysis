const {Transform} = require("stream")

class Hopper extends Transform {
  constructor(windowSize, hopSize) {
    super({objectMode: true})

    this.iWindow = 0
    this.windowSize = windowSize
    this.windowBuffer = new Float32Array(this.windowSize)
    this.hopSize = hopSize
    this.iHop = 0
  }

  _transform(chunk, encoding, callback) {
    if(chunk.numberOfChannels != 1)
      throw "Hopper expects a mono signal"

    for(var t=0; t<chunk.lengthInSamples; t++) {
      this.windowBuffer[this.iWindow++] = chunk.buffer[t]
      this.iWindow %= this.windowSize
      if(this.iHop++ >= this.hopSize) {
        this.iHop = 0
        var newBuffer = new Float32Array(this.windowSize)
        for(var i=this.iWindow, j=0; i<this.windowSize; i++, j++)
          newBuffer[j] = this.windowBuffer[i]
        for(var i=0, j=this.windowSize-this.iWindow; i<this.iWindow; i++, j++)
          newBuffer[j] = this.windowBuffer[i]
        this.push({
          buffer: newBuffer,
          lengthInSamples: this.windowSize,
          sampleRate: chunk.sampleRate,
          numberOfChannels: chunk.numberOfChannels,
        })
      }
    }
    callback()
  }
}
module.exports = Hopper
