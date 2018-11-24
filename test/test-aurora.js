const argv = require("minimist")(process.argv.slice(2))
const AV = require("av")
  const mp3 = require("mp3")


if(argv._[0]) {

  /*try {
    var asset = AV.Asset.fromFile(argv._[0])
    asset.on('data', function(buffer) {
      console.log("working..")
    })
    asset.on('end', function() {
      console.log("finished!")
    })
    asset.on('error', function(e) {
      console.log(e)
    })
    asset.start()
  } catch(e) {
    console.log(e)
  }*/

  try {
    var asset = AV.Asset.fromFile(argv._[0])
    asset.decodeToBuffer((buffer) => {
      console.log("YEY")
      console.log(buffer)
    }, function(e) {
      console.log(e)
    })
  } catch(e) {
    console.log(e)
  }
}
