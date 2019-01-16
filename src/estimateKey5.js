const Decode = require("./Decode2.js")
const Hopper = require("./Hopper")
const Windower = require("./Windower")
const FFT = require("./FastFourierTransform")
const SpectralMagnitudes = require("./SpectralMagnitudes")
const Chromagram = require("./Chromagram")
const ReduceTransients = require("./ReduceTransients.js")
const KrumhanslCorrelation = require("./KrumhanslCorrelation")
const AnalyseKrumhanslData = require("./AnalyseKrumhanslData")
const config = require("./config.js")

async function estimateKey(options) {
  options = Object.assign({
    fftsize: config.fftSize,
    hopSize: config.hopSize,
    windowType: "hamming",
    sampleRate: config.sampleRate,

    // chroma test frame settings
    nOctaves: config.nOctaves,
    nHarmonics: config.nHarmonics,

    pitchClasses: [0,1,2,3,4,5,6,7,8,9,10,11],

    decoderProgressBar: true,
  }, options)

  if(!options.file)
    throw "no input file"

  var decodeStream = Decode(options.file, options.decoderProgressBar, options.sampleRate)
  var chromagramStream = decodeStream
    .pipe(new Hopper(options.fftsize, options.hopSize))
    .pipe(new Windower(options.fftsize, options.windowType))
    .pipe(new FFT(options.fftsize))
    //.pipe(new ReduceTransients(5, options.sampleRate/options.hopSize, options.fftsize*2))
    .pipe(new SpectralMagnitudes(options.fftsize))
    .pipe(new Chromagram(options.pitchClasses, options.fftsize, options.sampleRate, options.nHarmonics, options.nOctaves,))

  var analyser = new AnalyseKrumhanslData
  chromagramStream.pipe(new KrumhanslCorrelation).pipe(analyser)

  return await new Promise((fulfil, reject) => {
    analyser.on("finish", () => {
      var winningScaleID = -1
      var winningScore = 0
      //console.log(analyser.totals)
      if(config.estimationMetric == "totals") {
        for(var i in analyser.totals)
          if(analyser.totals[i] > winningScore) {
            winningScore = analyser.totals[i]
            winningScaleID = parseInt(i)
          }
      } else if(config.estimationMetric == "bestMatchCounts") {

        for(var i in analyser.bestMatchCounts)
          if(analyser.bestMatchCounts[i] > winningScore) {
            winningScore = analyser.bestMatchCounts[i]
            winningScaleID = parseInt(i)
          }
      }

      var root = winningScaleID < 12 ? winningScaleID : winningScaleID - 12
      var mode = winningScaleID < 12 ? "major" : "minor"
      if(winningScaleID == -1)
        mode = undefined
      fulfil({
        key: root,
        mode: mode,
        scaleID: winningScaleID,
      })
    })
  })

}
module.exports = estimateKey
