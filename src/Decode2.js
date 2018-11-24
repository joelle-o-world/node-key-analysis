const ffmpeg = require("fluent-ffmpeg")
const wav = require("wav")
const {Transform} = require("stream")

function decode(file) {
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
