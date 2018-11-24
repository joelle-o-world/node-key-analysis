const { Transform } = require("stream")

class MixToMono extends Transform {
  constructor() {
    super({objectMode: true})
  }

  _transform(chunk, encoding, callback) {
    if(chunk.numberOfChannels > 1) {
      var newBuffer = new Float32Array(chunk.lengthInSamples).fill(0)
      for(var c=0; c<chunk.numberOfChannels; c++)
        for(var t=0; t<chunk.lengthInSamples; t++)
          newBuffer[t] += chunk.buffer[t * chunk.numberOfChannels + c]
      this.push({
        buffer: newBuffer,
        numberOfChannels: 1,
        lengthInSamples: chunk.lengthInSamples,
        sampleRate: chunk.sampleRate,
      })
    } else {
      this.push(chunk)
    }
    callback()
  }
}
module.exports = MixToMono
