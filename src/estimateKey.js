const Decode = require("./Decode2.js")
const Hopper = require("./Hopper")
const Windower = require("./Windower")
const FFT = require("./FastFourierTransform")
const SpectralMagnitudes = require("./SpectralMagnitudes")
const Chromagram = require("./Chromagram")
const AnalyseChromaData = require("./AnalyseChromaData")

async function estimateKey(options) {
  options = Object.assign({
    fftsize: 4096*4,
    hopSize: 441,
    windowType: "hamming",

    pitchClasses: [0,1,2,3,4,5,6,7,8,9,10,11],

    decoderProgressBar: true,
  }, options)

  if(!options.file)
    throw "no input file"

  var decodeStream = Decode(options.file, options.decoderProgressBar)
  var sampleRate = await decodeStream.sampleRate
  var chromagramStream = decodeStream
    .pipe(new Hopper(options.fftsize, options.hopSize))
    .pipe(new Windower(options.fftsize, options.windowType))
    .pipe(new FFT(options.fftsize))
    .pipe(new SpectralMagnitudes(options.fftsize))
    .pipe(new Chromagram(options.pitchClasses, options.fftsize, sampleRate))
  var analyse = new AnalyseChromaData(options.pitchClasses)
  chromagramStream.pipe(analyse)

  return await (new Promise((fulfil, rej) => {
    analyse.on('finish', function() {
      var bestGuess = null
      var bestGuessVal = 0
      var nRootsFound = 0
      for(var i in this.rootTotals) {
        if(this.rootTotals[i] > bestGuessVal) {
          bestGuess = i
          bestGuessVal = this.rootTotals[i]
        }
        nRootsFound += this.rootTotals[i]
      }

      var estimate2 = null
      var estimate2Val = 0
      for(var i in this.winnerTotals)
        if(this.winnerTotals[i] > estimate2Val) {
          estimate2 = i
          estimate2Val = this.winnerTotals[i]
        }

      fulfil({
        key: bestGuess,
        scaleID: bestGuess,
        estimate2: estimate2,
        rootTotals: this.rootTotals,
        rootOGram: this.rootOGram.join(""),
        pitchClassTotals: this.winnerTotals,
        loserTotals: this.loserTotals,
        rootFoundDensity: nRootsFound/this.nFrames
      })
    })
  }))
}

module.exports = estimateKey
