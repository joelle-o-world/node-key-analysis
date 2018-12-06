const Decoder = require("../src/decode2.js")
const MixToMono = require("../src/MixToMono.js")
const Hopper = require("../src/Hopper.js")
const Windower = require("../src/Windower.js")
const FFT = require("../src/FastFourierTransform.js")
const SpectralMagnitudes = require("../src/SpectralMagnitudes.js")
const OffsetWindowSpectrum = require("../src/OffsetWindowSpectrum.js")
const Chromagram = require("../src/Chromagram.js")
const MaxChroma = require("../src/MaxChroma.js")
const PitchClassGraph = require("../src/graphs/PitchClassGraph.js")

const argv = require("minimist")(process.argv.slice(2))

const audioFile = argv._[0] || "music/sine.wav"

const {Writable} = require("stream")

const FFTSize = 4096 * 4

var dest = new Writable({
  objectMode: true,
})
dest.totals = []
dest._write = async function(chunk, encoding, callback) {
  //console.log(chunk.map(n => (Math.round(n*100)+"%").padStart(5)).join(", "))
//  var hue = ((pc*7)%12)/12
  callback()
  //setTimeout(callback, 1000)
}
dest.on("finish", function() {
  var sum = 0
  for(var i in this.totals)
    sum += this.totals[i]
  this.totals = this.totals.map(n => n/sum)
  console.log("Average:")
  console.log(this.totals.map(n => (Math.round(n*100)+"%").padStart(5)).join(", "))
})

var mixtomono = new MixToMono()
var hopper1 = new Hopper(FFTSize, 4410*2)
var windower1 = new Windower(FFTSize, "hamming")
var windowOffset1 = new OffsetWindowSpectrum(FFTSize, "hamming")
var fft1 = new FFT(FFTSize)


var mags = Decoder(audioFile)
  //.pipe(dest) /*
  //.pipe(mixtomono)
  .pipe(hopper1)
  .pipe(windower1)
  .pipe(fft1)
  //.pipe(windowOffset1)
  .pipe(new SpectralMagnitudes(FFTSize))
  .pipe(new Chromagram([0,1,2,3,4,5,6,7,8,9,10,11], FFTSize, 44100))
  .pipe(new MaxChroma)
  .pipe(new PitchClassGraph(100, 1060))
  .pipeToFile(audioFile + ".pitchgraph.jpg")
  //.pipe(dest)
