const colorTransform = require("../HSLRGB.js")

function pitchClassToColor(pc) {
  var hue = ((pc*7)%12)/12

}
module.exports = pitchClassToColor
