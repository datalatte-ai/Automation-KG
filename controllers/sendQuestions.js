const fs = require("fs");
const csv = require("csvtojson");
const { type } = require("os");

async function sendQuestions(req, res) {
    const survey_id = req.body.survey_id;
    const csvStr = fs.readFileSync(`./uploaded/questions/survey_${survey_id}.csv`, encoding="Utf-8")
    csv({
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
