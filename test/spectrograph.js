const ToSpectrographPixelData = require("../src/ToSpectrographPixelData.js")
const decode = require("../src/Decode2.js")
const Hopper = require("../src/Hopper.js")
const Windower = require("../src/Windower.js")
const FFT = require("../src/FastFourierTransform.js")

const argv = require("minimist")(process.argv.slice(2))

const windowSize = 2048
const hopSize = 441

const file = argv._[0] || "music/Basho.mp3"

decode(file)
  .pipe(new Hopper(windowSize, hopSize))
  .pipe(new Windower(windowSize, "hamming"))
  .pipe(new FFT(windowSize))
  .pipe(new ToSpectrographPixelData(windowSize, 1000))
  .pipeToFile(file+".spectrograph.jpg")
