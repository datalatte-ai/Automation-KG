const { asyncCsvParser } = require("../utils/readFile.js");
const converter = require("json-2-csv");
const csv = require("csvtojson");
const fs = require("fs");
const {runScript} = require('../utils/runScript')

async function getQuestions(req, res) {
    try {
        const title = req.body.title;
        const questions = req.body.questions;
        const wallet_address = req.body.wallet_address;
        query_get_user = `relation == 'has' & entity_2 == 'wallet_id_${wallet_address}'`
        get_owner_kg_user = JSON.parse(await runScript(query_get_user, "./pythonapp/datalattekg.csv"))
        //TODO check datalattekg if wallet does'nt exist
        query_get_relation = `relation == 'owns' & entity_1 == '${(Object.values(get_owner_kg_user.entity_1)[0])}'`
        get_relation_owns = JSON.parse(await runScript(query_get_relation, "./pythonapp/datalattekg.csv"));
        if (Object.values(get_relation_owns.entity_2)[0] == 'survey_owner_KG') {
            console.log(Object.values(get_relation_owns.entity_2)[0]);
        }else {
            fs.appendFile("./pythonapp/uploaded/toplevelkg/datalattekg.csv", 'data to append', function (err) {
                if (err) throw err;
                console.log('Saved!');
              });
        }

        converter.json2csv(questions, (err, csv) => {
            if (err) {
                throw err;
            }
            fs.writeFileSync("./pythonapp/uploaded/questions/questions.csv", csv);
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
