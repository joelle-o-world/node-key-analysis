const {Writable} = require("stream")
const printPitchClass = require("./printPitchClass.js")

class AnalyseChromaData extends Writable {
  constructor(pitchClasses) {
    super({objectMode:true})
    this.pitchClasses = pitchClasses || [0,1,2,3,4,5,6,7,8,9,10,11]
    this.rootOGram = []
    this.rootTotals = {}
    this.loserTotals = {}
    this.winnerTotals = {}
    this.nFrames = 0

    for(var i in this.pitchClasses) {
      var pc = this.pitchClasses[i]
      this.rootTotals[pc] = 0
      this.loserTotals[pc] = 0
      this.winnerTotals[pc] = 0
    }

  /*  this.on("finish", function() {
      console.log(this.rootOGram.join(""))
      console.log("roots:", this.rootTotals)
      console.log("winners:", this.winnerTotals)
      console.log("losers:", this.loserTotals)

      var bestGuess = null
      var bestGuessVal = 0
      for(var i in this.rootTotals)
        if(this.rootTotals[i] > bestGuessVal) {
          bestGuess = i
          bestGuessVal = this.rootTotals[i]
        }

      console.log("best guess for key:", printPitchClass(bestGuess))
    })*/
  }

  _write(chunk, encoding, callback) {

    var ordered = chunk.chromas.sort((a, b) => {
      return b.energy-a.energy
    })

    var fifth = (ordered[0].pitchClass + 7)%12

    var winner = ordered[0].pitchClass
    this.winnerTotals[winner]++
    var loser = ordered[ordered.length-1].pitchClass
    this.loserTotals[loser]++

    this.nFrames++

    if(ordered[0].energy > 0.15 && (ordered[1].pitchClass == fifth)) {
    //  console.log("found chord root:", printPitchClass(ordered[0].pitchClass))
    //  console.log(ordered.map(pc => printPitchClass(pc.pitchClass) + " " + Math.round(pc.energy*100) + "%"))
      this.rootTotals[ordered[0].pitchClass]++
      this.rootOGram.push(printPitchClass(ordered[0].pitchClass))
    } else
      this.rootOGram.push("~")

  //  console.log(this.rootOGram[this.rootOGram.length-1])

    callback(null)
  }
}
module.exports = AnalyseChromaData
