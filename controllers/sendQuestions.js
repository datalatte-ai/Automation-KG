const fs = require("fs");
const csv = require("csvtojson");
const { type } = require("os");

async function sendQuestions(req, res) {
    const csvStr = fs.readFileSync('./uploaded/questions/questions.csv', encoding="Utf-8")
    csv({
        // noheader:true,
        output: "csv"
    })
    .fromString(csvStr)
    .then((csvRow)=>{ 
        res.send({
            "response":csvRow,
            "message":"ok",
            "status code":200
        })
    })
}

module.exports = {
  sendQuestions,
};
