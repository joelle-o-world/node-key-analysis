const Decoder = require("../src/Decode2.js")
const Hopper = require("../src/Hopper.js")
const Windower = require("../src/Windower.js")
const FFT = require("../src/FastFourierTransform.js")
const IFFT = require("../src/IFFT.js")
const UnHopper = require("../src/UnHopper.js")
const fs = require("fs")
const {Writable} = require("stream")
const Speaker = require("speaker")
const ToBuffer = require("../src/ToBuffer.js")
const ReduceTransients = require("../src/ReduceTransients.js")
const exampleData = require("../exampleData.json")
const Chromagram = require("../src/Chromagram.js")
const FrameFilter = require("../src/FrameFilter")
const LowPass = require("../src/LowPass.js")

var audioFile = exampleData[Math.floor(Math.random()*exampleData.length)].file
console.log("using file:", audioFile)

var n = 100

var dest = new Writable({
  objectMode: true,
})
dest.rootSums = {}
dest._write = function(chunk, encoding, callback) {
//  console.log("hi", chunk)
  if(n-- == 0) {
    console.log(chunk)
    throw "stop"
  }
  callback()
}

const windowSize = 4096
const hopSize = Math.round(windowSize/3)
const sampleRate = 44100

var multFrame = new Array(windowSize*2).fill(0)
pitchClasses = [0, 4, 7]
for(var j in pitchClasses) {
  var pc = pitchClasses[j]
  var pcFrame = Chromagram.makeTestFrame(
    pc,
    windowSize,
    sampleRate,
    1,
    5
  )
  for(var i in pcFrame)
    multFrame[parseInt(i)*2] += pcFrame[i] * 10
}

var chain = new Decoder(audioFile, false, sampleRate)
  .pipe(new LowPass(200, sampleRate))
  .pipe(new ToBuffer)
  .pipe(new Speaker({
    channels: 1,
    sampleRate: sampleRate,
    bitDepth:16,
  }))
