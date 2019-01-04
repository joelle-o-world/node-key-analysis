const ReduceTransients = require("../src/ReduceTransients")

var myReducer = new ReduceTransients(1, 20, 2048)
console.log(myReducer.a, myReducer.b)
