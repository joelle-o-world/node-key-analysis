const ffmpeg = require("fluent-ffmpeg")
const {Writable} = require("stream")
const fs = require("fs")
const wav = require("wav")

var outStream = fs.createWriteStream('oOoUut.raw');

console.log(outStream)

var reader = new wav.Reader()
reader.on("format", function(format) {
  console.log(format)
  this.pipe(outStream)
})

var halo = ffmpeg("music/Halo.mp3")
  .format("wav")
  .withAudioCodec("pcm_s16le")
  .noVideo()
  .on('error', function(err) {
    console.log('An error occurred: ' + err.message);
  })
  .on('end', function() {
    console.log('Processing finished !');
  })
  .pipe(reader)

console.log("great")
