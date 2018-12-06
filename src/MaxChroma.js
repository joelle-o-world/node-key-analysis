const {Transform} = require("stream")

class MaxChroma extends Transform {
  constructor() {
    super({objectMode:true})
  }

  _transform(chunk, encoding, callback) {
    var winner = 0
    var winningVal = chunk[0]
    for(var i=1; i<chunk.length; i++)
      if(chunk[i] < winningVal) {
        winner = i
        winningVal = chunk[i]
      }

    callback(null, winner)
  }
}
module.exports = MaxChroma
