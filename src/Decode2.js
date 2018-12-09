const ffmpeg = require("fluent-ffmpeg")
const wav = require("wav")
const {Transform} = require("stream")
const ProgressBar = require("progress")

function decode(file, progressReports) {
  var ffmpegCommand = ffmpeg(file)
    .format("wav")
    .audioCodec("pcm_f32le")
    .audioChannels(1)
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
    console.log("format:", format)
    FORMAT = format
  })

  if(progressReports) {
    ffmpegCommand.on("progress", (prog) => {
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
      var buffer = new Float32Array(chunk.buffer)
      callback(null, {
        buffer: buffer,
        numberOfChannels: FORMAT.channels,
        sampleRate: FORMAT.sampleRate,
        lengthInSamples: buffer.length/FORMAT.channels,
      })
    }
  })

  return ffmpegCommand.pipe(wavDecoder).pipe(objectify)
}
module.exports = decode
