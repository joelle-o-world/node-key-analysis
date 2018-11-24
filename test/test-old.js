const Decoder = require("./src/decode2.js")
const MixToMono = require("./src/MixToMono.js")
const Hopper = require("./src/Hopper.js")
const Windower = require("./src/Windower.js")
const FFT = require("./src/FastFourierTransform.js")
const SpectralMagnitudes = require("./src/SpectralMagnitudes.js")
const PitchClassTest = require("./src/PitchClassTest.js")
const OffsetWindowSpectrum = require("./src/OffsetWindowSpectrum.js")

const argv = require("minimist")(process.argv.slice(2))

const {Writable} = require("stream")

var dest = new Writable({
  objectMode: true,
})
dest._write = async function(chunk, encoding, callback) {
//  console.log(chunk)
  callback()
  //setTimeout(callback, 1000)
}

var mixtomono = new MixToMono()
var hopper1 = new Hopper(2048, 441)
var windower1 = new Windower(2048, "hamming")
var windowOffset1 = new OffsetWindowSpectrum(2048, "hamming")
var fft1 = new FFT(2048)

var mags = Decoder(argv._[0] || "WhiteNoise3Mins.wav")
  //.pipe(dest) /*
  //.pipe(mixtomono)
  .pipe(hopper1)
  .pipe(windower1)
  .pipe(fft1)
  .pipe(windowOffset1)
  .pipe(new SpectralMagnitudes(2048))

mags.setMaxListeners(100)
var measures = []
for(var pc=0; pc<12; pc+=0.25) {
  var test = new PitchClassTest(pc, 2048, 44100)
/*  test.on('finish', function() {
    var letters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    console.log(
      ((letters[this.pitchClass] || this.pitchClass)+":").padStart(10),
      (this.total/this.counter).toFixed(4).toString().padStart(25),
    )
  })*/
  measures.push(test.finalMeasurement)
  mags.pipe(test)
}

Promise.all(measures).then(function(measures) {
  var sum = 0
  for(var i in measures)
    sum += measures[i].total
  var letters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  for(var i in measures) {
    console.log(
      (letters[Math.floor(measures[i].pitchClass)] + (measures[i].pitchClass%1).toString().slice(1)).padEnd(10),
      ((measures[i].total/sum * 100).toFixed(2) + "%").padStart(10),
    )
  }
})
//*/
