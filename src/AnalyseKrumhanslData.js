const {Writable} = require("stream")

class AnalyseKrumhanslData extends Writable {
  constructor() {
    super({objectMode: true})

    this.totals = new Array(24).fill(0)
    this.bestMatchCounts = new Array(24).fill(0)
  }

  _write(chunk, encoding, callback) {
    var bestMatch = chunk[0].scaleID
    var bestMatchScore = chunk[0].score
    for(var i=1; i<chunk.length; i++) {
      this.totals[chunk[i].scaleID] += chunk[i].score
      if(chunk[i].score > bestMatchScore) {
        bestMatch = chunk[i].scaleID
        bestMatchScore = chunk[i].score
      }
    }
    this.bestMatchCounts[bestMatch]++
    callback()
  }
}
module.exports = AnalyseKrumhanslData
