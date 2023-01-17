const { asyncCsvParser } = require("../utils/readFile.js");
const converter = require("json-2-csv");
const csv = require("csvtojson");
const fs = require("fs");
const {runScript} = require('../utils/runScript')
const {increaseIdentifier, findIdentifier} = require('../utils/identifier')

async function getQuestions(req, res) {
    try {
        const title = req.body.title;
        const questions = req.body.questions;
        if (!questions) {
            return res.send({
                message:"please add some Questions!",
                "status code":200
            })
        }
        const wallet_address = req.body.wallet_address;
        //TODO : get DataLatte-KG from lotus for can query on it
        console.log(wallet_address);
        query_get_user = `relation == 'has' & entity_2 == 'wallet_id_${wallet_address}'`
        get_owner_kg_user = JSON.parse(await runScript(query_get_user, "./pythonapp/datalattekg.csv"))
        let user_id;
        console.log((get_owner_kg_user.entity_1)[0]);
        if (typeof(Object.keys(get_owner_kg_user.entity_1)[0]) !== 'undefined') {
            query_get_relation = `relation == 'owns' & entity_1 == '${(Object.values(get_owner_kg_user.entity_1)[0])}'`
            get_relation_owns = JSON.parse(await runScript(query_get_relation, "./pythonapp/datalattekg.csv"));
            if (Object.values(get_relation_owns.entity_2)[0].includes('survey_owner_KG_')) {
                user_id = parseInt((Object.values(get_owner_kg_user.entity_1)[0]).split('_')[1])
            }
        } else {
            user_id = await increaseIdentifier('user_identifier')
            fs.appendFileSync("./pythonapp/uploaded/toplevelkg/datalattekg.csv", `User_${user_id} has 'wallet_id_${wallet_address}'\n`, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
        }

        survey_id = await increaseIdentifier('survey_identifier');
        converter.json2csv(questions, (err, csv) => {
            if (err) {
                throw err;
            }
            fs.writeFileSync(`./pythonapp/uploaded/questions/survey_${survey_id}.csv`, csv);
        });
        //TODO: Create an API for the Lotus storage for return CID of survey
        const CID = 'Null'
        const ready_file_datalatte_kg = [`Survey_${survey_id} is associated with ${title} KG`,
                            `Survey_${survey_id} owns survey_KG_${survey_id}`,
                            `Survey_KG_${survey_id} is stored with ${CID}\n`
                            ]
        fs.appendFileSync("./pythonapp/uploaded/toplevelkg/datalattekg.csv",
        ready_file_datalatte_kg.join('\n'),
        function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
        
        const survey_owner_id = await increaseIdentifier('survey_owner_identifier');
        //when you not survey owner before
        query_get_relation = `relation == 'owns' & entity_1 == '${(Object.values(get_owner_kg_user.entity_1)[0])}'`
        get_relation_owns = JSON.parse(await runScript(query_get_relation, "./pythonapp/datalattekg.csv"));
        console.log("test1");
        if (typeof(Object.keys(get_owner_kg_user.entity_1)[0]) !== 'undefined') {
            const ready_file = ['"sentence"',
                                `Wallet_id_${wallet_address} has user_${user_id}`,
                                `User_${user_id} creates survey_${survey_id}`,
                                `Survey_${survey_id} is stored with Null`,
                                `Survey_${survey_id} is associated with ${title} KG`,
                                `User_${user_id} owns survey_owner_KG_${survey_owner_id}`,
                                `Survey_owner_KG_${survey_owner_id} links to Null\n`
                            ]
            fs.writeFileSync(`./pythonapp/uploaded/surveyownerkg/survey_owner_kg_${survey_owner_id}.csv`,
                ready_file.join('\n'),
                function (err) {
                    if (err) throw err;
                    console.log("saved!");
                }
            )
        } else {
            const ready_file = [`User_${user_id} creates survey_${survey_id}`,
                                `Survey_${survey_id} is stored with Null`,
                                `Survey_${survey_id} is associated with ${title} KG`,
                                `User_${user_id} owns survey_owner_KG_${survey_owner_id}`,
                                `Survey_owner_KG_${survey_owner_id} links to Null\n`
                            ]
            fs.appendFileSync(`./pythonapp/uploaded/surveyownerkg/survey_owner_kg_${survey_owner_id}.csv`,
                ready_file.join('\n'),
                function (err) {
                    if (err) throw err;
                    console.log("saved!");
                }
            )
        }
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
