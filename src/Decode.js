/*
  A stream wrapper for Aurora.js audio file decoding.
  Pass the filepath to the constructor.
  Returns a object-mode stream of interleaved PCM in Float32Array chunks.
*/

const AV = require("av")
  mp3 = require("mp3"),
  flac = require("flac.js"),
  alac = require("alac"),
  aac = require("aac"),
  ogg = require("ogg.js"),
  vorbis = require("vorbis.js"),
  opus = require("opus.js")
const { Readable } = require("stream")

class AudioFileDecoder extends Readable {
  constructor(filePath) {
    super({ objectMode: true });

    this._source = AV.Asset.fromFile(filePath)

    this._source.on('data', (chunk) => {
      if(!this.push({
        buffer: chunk,
        numberOfChannels: this._source.format.channelsPerFrame,
        sampleRate: this._source.format.sampleRate,
        lengthInSamples: chunk.length/this._source.format.channelsPerFrame,
      }))
        this._source.stop()
    })

    this._source.on('end', () => {
      this.push(null)
    })

    this._source.on('error', (error) => {
      throw error;
    })
  }

  _read(size) {
    this._source.start()
  }
}

module.exports = AudioFileDecoder
