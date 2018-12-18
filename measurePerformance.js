const fs = require("fs").promises
const oldFs = require("fs")
const path = require('path')
const estimateKey = require("./src/estimateKey2.js")
const argv = require("minimist")(process.argv.slice(2))

async function measurePerformance(examples) {
  if(!examples)
    examples = JSON.parse(await fs.readFile("./exampleData3.json"))

  examples = examples.filter(function(example) {
    if(!example.file) {
      //console.warn(example, "has no file")
      return false
    } else if(!oldFs.existsSync(example.file)) {
      console.warn(example.file, "does not exist")
      return false
    } else
      return true
  });

  var confusionMatrix = []
  for(var i=0; i<24; i++)
    confusionMatrix[i] = new Array(24).fill(0)

  var report = {
    date: new Date().toLocaleString(),
    nCorrect: 0,
    nIncorrect: 0,
    nError: 0,
    errors: [],
    successRate: undefined,
    percentSuccessRate: undefined,
    totalProcessTime: 0,
    trackByTrack: [],
    confusionMatrix: confusionMatrix
  }

  if(argv._[0])
    report.reportName = argv._[0]

  var reportName = (report.reportName || Date.now()) + ".json"





  for(var i in examples) {
    if(!examples[i].file) {
      console.warn("skipped example because has no file")
      continue
    }
    if(!examples[i].checked) {
      console.warn("skipped example because it has not been checked")
      continue
    }
    var startT = Date.now()
    var file = examples[i].file
    var trackReport = {
      file: file,
      correctRoot: examples[i].root,
      correctMode: examples[i].mode,
    }

    var correctScaleID = examples[i].root + (examples[i].mode == "minor" ? 12 : 0)
    trackReport.correctScaleID = correctScaleID

    try {
      var result = await estimateKey({file: file})
      var key = result.key
      fs.writeFile(file + ".rootOgram.txt", result.rootOGram)

      trackReport.estimatedRoot = key
      trackReport.estimatedMode = result.mode
      if(result.estimate2)
        trackReport.estimate2 = result.estimate2
      //trackReport.rootTotals = result.rootTotals
      //trackReport.pitchClassTotals = result.pitchClassTotals
      //trackReport.minima = result.loserTotals
      confusionMatrix[correctScaleID][result.scaleID]++
      trackReport.correct = key == examples[i].root
      if(result.rootFoundDensity)
        trackReport.rootFoundDensity = (result.rootFoundDensity * 100).toFixed(2)+"%"
      if(trackReport.correct)
        report.nCorrect++
      else
        report.nIncorrect++
    } catch(e) {
      console.log("\n", file, "error", e)
      trackReport.error = e
      report.nError++
      report.errors.push(e)
    }

    var endT = Date.now()


    trackReport.processTime = (endT-startT)/1000
    report.totalProcessTime += trackReport.processTime

    report.trackByTrack.push(trackReport)
    if(trackReport.correct)
      console.log("Correct!")
    else
      console.log("Incorrect!")
    //console.log(trackReport)


    // (re)save report after each analysis
    report.nTotal = report.nCorrect + report.nIncorrect + report.nError
    report.successRate = report.nCorrect/report.nTotal
    report.percentSuccessRate = (report.successRate * 100).toFixed(2)+"%"
    report.averageProcessTime = report.totalProcessTime / report.nTotal


    var printedConfusionMatrix = confusionMatrix.map((row, iRow) => row.map((cell, iCol) => ((iCol==iRow?"*":" ")+cell.toString()).padStart(5)).join(""))
    report.confusionMatrix = printedConfusionMatrix
    var outputPath = path.resolve("./performanceReports", reportName)
    var reportString = JSON.stringify(report, null, 4)
    await fs.writeFile(outputPath, reportString)
  }

  console.log("final report:", report)

  console.log("\nconfusion matrix:")
  var printedConfusionMatrix = confusionMatrix.map(row => row.map(cell => cell.toString().padStart(4)).join("")).join("\n")
  console.log(printedConfusionMatrix)

  return report
}


measurePerformance()
