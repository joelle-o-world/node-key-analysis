var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

function printPitchClass(pc) {
  if(pc.constructor == String)
    pc = parseFloat(pc)
  var str = noteNames[Math.floor(pc)]
  if(pc%1)
    str += "+" + (pc%1).slice(1)

  return str
}

module.exports = printPitchClass
