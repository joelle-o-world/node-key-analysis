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
const exampleData = require("../exampleData3.json")

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

var chain = new Decoder(audioFile)
  .pipe(new Hopper(windowSize, hopSize))
  .pipe(new Windower(windowSize, "hamming"))
  .pipe(new FFT(windowSize))
  // spectral processing processing
  .pipe(new ReduceTransients(5, sampleRate/hopSize, windowSize*2))

  .pipe(new IFFT(windowSize, sampleRate)) // why is the length of the output chunks 8192?
  .pipe(new Windower(windowSize, "hamming"))
  .pipe(new UnHopper(windowSize, hopSize))
  .pipe(new ToBuffer)
  .pipe(new Speaker({
    channels: 1,
    sampleRate: sampleRate,
    bitDepth:16,
  }))
