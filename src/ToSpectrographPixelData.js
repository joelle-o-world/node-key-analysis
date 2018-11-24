const {Transform} = require("stream")
const JPEGEncoder = require("jpg-stream/encoder")
const fs = require("fs")

class ToSpectrographPixelData extends Transform {
  constructor(width, maxHeight, ceiling) {
    super({writableObjectMode:true})

    if(!width) {
      throw "Please specify spectrograph width in constructor"
    }

    this.width = width
    this.height = 0
    this.maxHeight = maxHeight || 30000
    this.ceiling = ceiling ||  724 // the max input value
  }

  _transform(chunk, encoding, callback) {
  /*  if(chunk.length/2 != this.width)
      throw "chunk length does not match spectrograph width"*/

    var rowbuffer = new Uint8Array(this.width * 3)

    for(var x=0; x<this.width; x++) {
      var bin = Math.floor(x/this.width * chunk.length/2)
      var binIndex = bin
      var mag = Math.sqrt(chunk[binIndex]*chunk[binIndex] + chunk[binIndex+1]*chunk[binIndex+1])
    /*  if(mag > this.ceiling)
        console.warn("Spectrograph ceiling has been exceeded", mag)//*/
      var l = 256 * Math.pow(mag / this.ceiling, 1/8)
      if(l > 256)
        l = 255
      //l = 256-l
      rowbuffer[x*3] = l
      rowbuffer[x*3+1] = l
      rowbuffer[x*3+2] = l
    }

    //console.log(rowbuffer[500])
    this.push(rowbuffer)
    this.height++
    if(this.height < this.maxHeight)
      callback()
    else
      console.log("done!")
  }

  pipeToFile(filepath, fileWidth) {
    this.pipe(new JPEGEncoder(fileWidth || this.width, this.maxHeight))
      .pipe(fs.createWriteStream(filepath))
  }
}
module.exports = ToSpectrographPixelData
