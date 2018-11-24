const {Writable} = require("stream")
const Promise = require("bluebird")

class PitchClassTest extends Writable {
  constructor(pitchClass, numberOfBins, sampleRate) {
    if(!sampleRate)
      throw "sample rate unknown"

    super({objectMode: true})
    this.numberOfBins = numberOfBins || 2048
    this.pitchClass = pitchClass
    this.sampleRate = sampleRate

    this.total = 0
    this.counter = 0

    this.testFrame = makeTestFrame(this.pitchClass, this.numberOfBins, sampleRate)

    this.finalMeasurement = new Promise((fulfil, reject) => {
      this.on('finish', () => {
        fulfil({
          total: this.total,
          counter: this.counter,
          pitchClass: this.pitchClass,
        })
      })
      this.on('error', reject)
    })
  }

  _write(chunk, encoding, callback) {
    if(chunk.length != this.numberOfBins)
      throw "PitchClassTest recieved chunk of wrong size: " + chunk.length
      
    var sum = 0
    for(var bin=0; bin<this.numberOfBins; bin++)
      sum += chunk[bin] * this.testFrame[bin]

    this.total += sum
    this.counter++
    callback()
  }
}
module.exports = PitchClassTest

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

function makeTestFrame(pitchClass, numberOfBins, sampleRate) {
  var pc = binPitchClasses(numberOfBins, sampleRate)

  var sum = 0
//  pc[0] = 0
  for(var bin=0; bin<numberOfBins; bin++) {
    var dif = Math.abs(pc[bin] - pitchClass)
    if(dif > 6) {
      dif = 12-dif
    }
    if(dif < 0.5)
      pc[bin] = 1/dif
    else
      pc[bin] = 0

    //if(bin < 0)
    //  pc[bin] = 0
    sum += pc[bin]
  }

  for(var bin=0; bin<numberOfBins; bin++)
    pc[bin] /= sum

  return pc
}
