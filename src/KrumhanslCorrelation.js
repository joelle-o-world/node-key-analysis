const config = require("./config.js")
const {Transform}  = require("stream")

// define/pre-process constants
var cMajor = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
var cMinor = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

if(config.useShaathTemplates) {
  cMajor = [6.7, 2, 3.48, 2.33, 4.6, 4, 2.5, 5.2, 2.39, 3.75, 2.3, 3.4]
  cMinor = [6.5, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 5.15, 3.98, 2.69, 4.3, 3.17]
}

const cMajorSum = cMajor.reduce((a,b)=>a+b)
const cMinorSum = cMinor.reduce((a,b)=>a+b)

const cMajorMean = cMajorSum / 12
const cMinorMean = cMinorSum / 12

const cMajor12Variance = cMajor.reduce((acc, val) => acc + Math.pow(val-cMajorMean, 2))
const cMinor12Variance = cMinor.reduce((acc, val) => acc + Math.pow(val-cMinorMean, 2))
// 12Variance: variance * sample size (which is 12)

const templates = []
for(var root=0; root<12; root++) {
  var nextTemplate = []
  for(var i=0; i<12; i++)
    nextTemplate[i] = cMajor[(i+12-root)%12]
  templates.push(nextTemplate)
}

for(var root=0; root<12; root++) {
  var nextTemplate = []
  for(var i=0; i<12; i++)
    nextTemplate[i] = cMinor[(i+12-root)%12]
  templates.push(nextTemplate)
}

// Transform Stream
class KrumhanslCorrelation extends Transform {
  constructor() {
    super({objectMode:true})
  }

  _transform({chromas}, encoding, callback) {
    if(chromas.length != 12)
      throw "Krumhansl can only analyse chromagrams of vector size 12"
    // should possibly also check that chromas contains pitchclasses 0-11

    var x = chromas.map(chroma => chroma.energy)

    // calculate xMean, x12Variance
    var xMean = x.reduce((acc, val) => acc+val)/12
    var x12Variance = x.reduce((acc, val) => acc + Math.pow(val-xMean, 2))

    var output = []
    for(var root=0; root<templates.length; root++) {
      var y = templates[root]
      var major = root < 12
      var yMean = major ? cMajorMean : cMinorMean
      var y12Variance = major ? cMajor12Variance : cMinor12Variance

      // calculate SIGMA (xN - xMean)(yN - yMean)
      var topHalf = 0
      for(var n=0; n<12; n++)
        topHalf += (x[n] - xMean) * (y[n]-yMean)

      // SQRT(x12Variance * y12Variance)
      var correlationScore = topHalf / Math.sqrt(x12Variance * y12Variance)
      if(isNaN(correlationScore)) {
        callback()
        return null
      }
      output[root] = {
        scaleID: root,
        score: correlationScore,
      }
    }

    callback(null, output)
  }
}
module.exports = KrumhanslCorrelation
