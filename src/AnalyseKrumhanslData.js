const {Writable} = require("stream")

class AnalyseKrumhanslData extends Writable {
  constructor() {
    super({objectMode: true})

    this.totals = new Array(24).fill(0)
    this.bestMatchCounts = new Array(24).fill(0)
  }

  _write(chunk, encoding, callback) {
    var bestMatch = -1
    var bestMatchScore = 0
    for(var i in chunk) {
      this.totals[chunk[i].scaleID] += chunk[i].score
      if(chunk[i].score > bestMatchScore) {
        bestMatch = chunk[i].scaleID
        bestMatchScore = chunk[i].score
      }
    }
    callback()
  }
}
module.exports = AnalyseKrumhanslData
