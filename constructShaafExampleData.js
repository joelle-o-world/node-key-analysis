const parseCSV = require("csv-parse/lib/sync")
const fs = require("fs")
const path = require("path")
const stringSimilarity = require("string-similarity")
const parseKeyString = require("./src/parseKeyString")

const argv = require("minimist")(process.argv.slice(2))

const inputCSV = argv._[0] || "./KeyFinderV2Dataset - KeyFinder v2 dataset.csv"
const musicFolder = argv.music || "./music/keyFinder"
const output = argv.o

async function main() {
  // parse csv
  var str = fs.readFileSync(inputCSV)
  var data = parseCSV(str)

  var files = fs.readdirSync(musicFolder)

  var found = []
  var exampleData = []

  for(var r in data) {
    var row = data[r]
    var filename = row[0] + " - " + row[1]+".mp3"
    var filepath = path.resolve(
      musicFolder,
      filename
    )

    var pathMatch = null
    var rating
    if(false && fs.existsSync(filepath)){
      found.push(filepath)
      files.splice(files.indexOf(filename), 1)
      pathMatch = filepath
      rating = 1
    } else {
      var bestMatch = stringSimilarity.findBestMatch(filename, files)
      bestMatch = bestMatch.ratings.filter(match => match.rating > 0.6)
      if(bestMatch.length > 0) {
        //console.log("found a match", filename, bestMatch[0].target)
        var newpath = path.resolve(musicFolder, bestMatch[0].target)
        found.push(newpath)
        files.splice(files.indexOf(bestMatch[0].target), 1)
        pathMatch = newpath
        rating = bestMatch[0].rating
      }
    }

    if(!pathMatch)
      continue

    var key = parseKeyString(row[2])

    exampleData.push({
      file: pathMatch,
      key: row[2],
      root: key.root,
      mode: key.mode,
      scaleID: key.scaleID,
      artist: row[0],
      trackName: row[1],
      fileMatchRating: rating,
    })
  }
  console.log(exampleData)
  console.log(found.length, "matches")
  console.log(files.length, "files without matches")

  if(output) {
    var outStr = JSON.stringify(exampleData, null, 4)
    fs.writeFileSync(output, outStr)
    console.log("wrote output to", output)
  }
}

main()
