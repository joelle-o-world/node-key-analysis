const {Transform} = require("stream")

class Chromagram extends Transform {
  constructor(pitchClasses, numberOfBins, sampleRate, nHarmonics, nOctaves) {
    super({objectMode: true})

    nHarmonics = nHarmonics || 16
    nOctaves = nOctaves || 6

    if(!sampleRate)
      throw "sample rate unknown"

    this.numberOfBins = numberOfBins || 2048
    this.pitchClasses = pitchClasses
    this.sampleRate = sampleRate

    this.testFrames = this.pitchClasses.map(
      pc => makeTestFrame(pc, numberOfBins, sampleRate, nHarmonics, nOctaves)
    )
  }

  _transform(chunk, encoding, callback) {
    if(chunk.length != this.numberOfBins)
      throw "Chromagram recieved chunk of wrong size: " + chunk.length

    var chromagram = []
    var sum = 0
    for(var i in this.testFrames) {
      var pc = this.pitchClasses[i]
      chromagram[pc] = {pitchClass: pc}
      var energy = 0
      var testFrame = this.testFrames[i]
      for(var bin in testFrame)
        energy += chunk[bin] * testFrame[bin]
      sum += energy
      chromagram[pc].energy = energy
    }
    if(sum)
      for(var i in chromagram)
        chromagram[i].energy /= sum
    callback(null, {chromas: chromagram})
  }
}
module.exports = Chromagram


const veryLowC = 16.3515978313 / 2 // Hz
const twelveOverLog2 = 12 / Math.log(2)
function binPitchClasses(numberOfBins /* (windowSize) */, sampleRate) {
  var pc = new Array(numberOfBins) // pitchClasses
  var increment = (sampleRate/2)/numberOfBins
  for(var bin=0; bin<numberOfBins; bin++) {
    var f = increment * bin
    pc[bin] = (twelveOverLog2 * Math.log(f / veryLowC)) % 12
  }
  return pc
}

function makeTestFrame(pitchClass, numberOfBins, sampleRate, nHarmonics, nOctaves) {
  nHarmonics = nHarmonics || 16
  nOctaves = nOctaves || 6
  var frame = {}//new Float32Array(numberOfBins).fill(0)

  var low = 55/4 * Math.pow(2, (pitchClass+3)/12)
  for(var octave=0; octave<nOctaves; octave++) {
    var f = low * Math.pow(2, octave)

    var h = 0.5
    for(var harmonic=1; harmonic<nHarmonics; harmonic++) {
      var ammount = Math.pow(h, harmonic-1)
      try {
        incrementFrequency(frame, f*(harmonic+1), ammount, numberOfBins, sampleRate)
      } catch(e) {
        console.log("f:", f, "h:", harmonic, "octave: ", octave)
        throw e
      }
    }
  }

  return frame
}
Chromagram.makeTestFrame = makeTestFrame

function incrementFrequency(frame, f, ammount, numberOfBins, sampleRate) {
  var bin = Math.round(f / (sampleRate/2/numberOfBins))
  //frame[Math.floor(bin)] += ammount * (1-bin%1)
  //frame[Math.ceil(bin)] += ammount * (bin%1)
  if(bin >= frame.length)
    throw "Trying to increment a frequency not present in the frame: " + f+"Hz"
  frame[bin] = (frame[bin] || 0) + ammount

}
