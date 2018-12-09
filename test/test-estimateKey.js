const estimateKey = require("../src/estimateKey")

estimateKey({file: "./music/Basho.mp3"}).then((key) => {
  console.log("estimatedKey:", key)
})
