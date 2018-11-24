const {Transform} = require("stream")

class Windower extends Transform {
  constructor(windowSize, envelopeType) {
    super({objectMode: true})

    this.windowSize = windowSize || 2048
    this.envelopeType = envelopeType || "hamming"
    this.envelopeName = this.envelopeType + this.windowSize

    this.envelope = getEnvelope(this.windowSize, this.envelopeType)
  }

  _transform(chunk, encoding, callback) {
    if(chunk.buffer.length != this.windowSize)
      throw "Windower has recieved chunk of wrong size"

    for(var t=0; t<this.windowSize; t++)
      chunk.buffer[t] *= this.envelope[t]
    this.push(chunk)

    callback()
  }
}
module.exports = Windower

Windower.envelopes = {}
Windower.envelopeFunctions = {
  "hamming": (n, N) => {
    return Math.pow( Math.sin((Math.PI * n) / (N-1)) , 2 )
  }
}
Windower.windowSpectrums = {}
function getEnvelope(size, type) {
  var F = Windower.envelopeFunctions[type]
  if(!F)
    throw "Window type \'"+type+"\' is not defined."
  var name = type + size
  if(Windower.envelopes[name])
    return Windower.envelopes[name]

  var env = new Float32Array(size)
  for(var n=0; n<size; n++)
    env[n] = F(n, size)

  Windower.envelopes[name] = env
  return env
}
Windower.getEnvelope = getEnvelope
