const chromaticSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#","A", "A#", "B"]
const chromaticFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
function parseKeyString(str) {
  var mode
  if(str[str.length-1] == "m") {
    mode = "minor"
    str = str.slice(0, str.length-1)
  } else
    mode = "major"

  var root = chromaticFlat.indexOf(str)
  if(root == -1)
    root = chromaticSharp.indexOf(str)
  if(root == -1)
    throw "unable to parse key string: " + arguments[0]

  return {
    root: root,
    mode: mode,
    scaleID: root + (mode=="minor"?12:0),
    str:str,
  }
}
module.exports = parseKeyString
