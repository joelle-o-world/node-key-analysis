const ToSpectrographPixelData = require("../src/ToSpectrographPixelData.js")
const Chromagram = require("../src/Chromagram.js")

const numberOfBins = 2048

grapher = new ToSpectrographPixelData(2048, 100*12)
grapher.pipeToFile("frameograms.jpg")

for(var pc=0; pc<12; pc+=0.25) {
  var frame = Chromagram.makeTestFrame(pc, numberOfBins, 44100)
  var complexFrame = new Float32Array(frame.length*2).fill(0)
  for(var i=0; i<frame.length; i++) {
    complexFrame[i*2] = frame[i]
    complexFrame[i*2+1] = frame[i]
  }
  //console.log(complexFrame)
  for(var x=0; x<25; x++) {
    grapher.write(complexFrame)
  }
}
