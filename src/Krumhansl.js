// Cross multiplies and sums the Krumhansl templates with the input vectors

const {Transform} = require("stream")
const config = require("./config.js")

var cMajor = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
var cMinor = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

if(config.useShaathTemplates) {
  cMajor = [6.7, 2, 3.48, 2.33, 4.6, 4, 2.5, 5.2, 2.39, 3.75, 2.3, 3.4]
  cMinor = [6.5, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 5.15, 3.98, 2.69, 4.3, 3.17]
}

// normalise templates
var cMajorSum = 0
for(var i in cMajor)
  cMajorSum += cMajor[i]
for(var i in cMajor)
  cMajor[i] /= cMajorSum

var cMinorSum = 0
for(var i in cMinor)
  cMinorSum += cMinor[i]
for(var i in cMinor)
  cMinor[i] /= cMinorSum
//console.log("Krumhansl template sums (major, minor respectively):", cMajorSum, cMinorSum)



var templates = []
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

console.log(templates)

class Krumhansl extends Transform {
  constructor() {
    super({objectMode:true})
  }

  _transform({chromas}, encoding, callback) {
    if(chromas.length != 12)
      throw "Krumhansl can only analyse chromagrams of vector size 12"

    var output = []
    for(var root in templates) {
      var sum = 0
      var template = templates[root]
      for(var i in template)
        sum += chromas[i].energy * template[chromas[i].pitchClass]

      output[root] = {scaleID: root, score:sum}
    }

    //console.log(output)
    callback(null, output)
  }
}
module.exports = Krumhansl
