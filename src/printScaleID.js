function printScaleID(n) {
  n = parseFloat(n)
  if(n%1){
    console.warn("cannot print microtonal scales yet")
    n = Math.round(n)
  }
  if(n < 12)
    return letters[n]
  else
    return letters[n-12] + "m"
}
module.exports = printScaleID

const letters = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
