const {Transform} = require("stream")
const JPEGEncoder = require("jpg-stream/encoder")
const colorTransform = require("./colorTransform.js")
const fs = require("fs")

class PitchClassGraph extends Transform {
  constructor(width, height) {
    super({writableObjectMode: true})

    this.width = width
    this.height = height
    this.y = 0
  }

  _transform(pitch, encoding, callback) {
    var rowbuffer = new Uint8Array(this.width * 3)

    var hue = ((pitch*7)%12)/12

    var color = colorTransform.hslToRgb(hue, 1, 0.5)

    var i=0
    for(var x=0; x<this.width; x++) {
      rowbuffer[i++] = color[0]
      rowbuffer[i++] = color[1]
      rowbuffer[i++] = color[2]
    }
  //  console.log(hue, color)

    this.y++
    if(this.y > this.height)
      console.log("done!")
    else
      callback(null, rowbuffer)
  }

  pipeToFile(filepath) {
    this.pipe(new JPEGEncoder(this.width, this.height))
      .pipe(fs.createWriteStream(filepath))
  }
}
module.exports = PitchClassGraph
