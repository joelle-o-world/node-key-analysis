const {Transform} = require("stream")

class UnHopper extends Transform {
  constructor(frameSize=2048, hopSize=441) {
    super({objectMode:true})

    this.frameSize = frameSize
    this.hopSize = hopSize

    this.buffer = new Array(frameSize).fill(0)
    this.writeHead = 0
  }

  _transform(chunk, encoding, callback) {
    if(chunk.numberOfChannels != 1)
      throw "UnHopper expects mono input"
    for(var t=0; t<chunk.lengthInSamples; t++)
      this.buffer[(this.writeHead+t)%this.buffer.length] += chunk.buffer[t]
    this.writeHead += this.hopSize

    if(this.writeHead > this.hopSize) { // surely this is never false?
      var from = (this.writeHead-this.hopSize) % this.buffer.length
      var to = this.writeHead % this.buffer.length


      if(from > to) {
        // concatting two slices
        var out = this.buffer.slice(from)
          .concat(this.buffer.slice(0, to))

        this.buffer
          .fill(0,from)
          .fill(0, 0, to)

      } else {
        // use just one slice
        var out = this.buffer.slice(from, to)
        this.buffer.fill(0, from, to)
      }
      this.push({
        numberOfChannels: 1,
        lengthInSamples: this.hopSize,
        sampleRate: chunk.sampleRate,
        buffer: out,
      })
    }
    callback()
  }
}
module.exports = UnHopper
