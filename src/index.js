const estimateKey = require("./estimateKey5.js")

async function readFileAndEstimateKey(file, options={}) {
  if(!file)
    throw "readFileAndEstimateKey expects at least one argument"

  options = Object.assign({}, options, {file: file})

  return await estimateKey(options)
}
exports.readFileAndEstimateKey = readFileAndEstimateKey
