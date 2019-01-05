const ffmpeg = require("fluent-ffmpeg")
const wav = require("wav")
const {Transform} = require("stream")
const ProgressBar = require("progress")
const Promise = require("bluebird")

function decode(file, progressReports, sampleRate=44100) {
  var ffmpegCommand = ffmpeg(file)
    .format("wav")
    .audioCodec("pcm_f32le")
    .audioChannels(1)
    .audioFrequency(sampleRate)
    .noVideo()
    .on('error', (e) => {
      console.error(e)
    })
  var wavDecoder = new wav.Reader()
  wavDecoder.on('error', (e) => {
    console.error(e)
  })
  var FORMAT
  wavDecoder.on('format', (format) => {
    FORMAT = format
  })

  if(progressReports) {
    ffmpegCommand.on("progress", function(prog) {
      if(!this.bar) {
        this.bar = new ProgressBar(file+" :percent \t[:bar] ETA: :eta seconds ", {total: 100, width:50})
      }
      this.bar.tick(prog.percent-(this.bar.curr || 0))
    })
  }


  var objectify = new Transform({
    //writableObjectMode: true,
    readableObjectMode: true,
    transform(chunk, encoding, callback) {
      try {
        var buffer = new Float32Array(chunk.buffer)
      } catch(e) {
        console.warn("Decoding skipped, not good")
        callback()
        return
      }
      callback(null, {
        buffer: buffer,
        numberOfChannels: FORMAT.channels,
        sampleRate: FORMAT.sampleRate,
        lengthInSamples: buffer.length/FORMAT.channels,
      })
    }
  })

  objectify.sampleRate = new Promise((fulfil, reject) => {
    wavDecoder.on('format', (format) => {
      fulfil(format.sampleRate)
    })
  })

  return ffmpegCommand.pipe(wavDecoder).pipe(objectify)
}
module.exports = decode
