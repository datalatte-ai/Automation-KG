const { asyncCsvParser } = require("../utils/readFile.js");
const converter = require("json-2-csv");
const csv = require("csvtojson");
const fs = require("fs");
const {runScript} = require('../utils/runScript')

async function getQuestions(req, res) {
    try {
        const questions = req.body.questions;
        const wallet_address = req.body.wallet_address;
        query = `relation == 'has' & entity_2 == 'wallet_id_${wallet_address}'`
        result = JSON.parse(await runScript(query))
        console.log(result.entity_2);
        const jsonArray = await csv().fromFile(
            "./uploaded/toplevelkg/datalattekg.csv"
        );
        for (let sen of jsonArray) {
            console.log(sen.sentence.toString());
        }
        const sentence = "";
        converter.json2csv(questions, (err, csv) => {
            if (err) {
                throw err;
            }
            fs.writeFileSync("./uploaded/questions/questions.csv", csv);
        });

        res.send({
            message: "ok",
            "status code": 200,
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getQuestions,
};
