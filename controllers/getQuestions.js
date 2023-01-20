const { asyncCsvParser } = require("../utils/readFile.js");
const converter = require("json-2-csv");
const csv = require("csvtojson");
const fs = require("fs");
const { runScript } = require("../utils/runScript");
const { increaseIdentifier, findIdentifier } = require("../utils/identifier");

async function getQuestions(req, res) {
    try {
        const title = req.body.title;
        const questions = req.body.questions;

        if (!questions) {
            return res.send({
                message: "please add some Questions!",
                "status code": 200,
            });
        }
        const wallet_address = req.body.wallet_address;
        //TODO : get DataLatte-KG from lotus for can query on it

        //query for find user in datalattekg
        query_get_user = `relation == 'has' & entity_2 == 'wallet_id_${wallet_address}'`;
        get_owner_kg_user = JSON.parse(
            await runScript(
                "./pythonapp/uploaded/toplevelkg/datalattekg.csv",
                query_get_user,
                'query'
            )
        );
        let user_id;
        let get_relation_owns;

        //check if user not find
        if (typeof Object.keys(get_owner_kg_user.entity_1)[0] !== "undefined") {
            query_get_relation = `relation == 'owns' & entity_1 == '${
                Object.values(get_owner_kg_user.entity_1)[0]
            }'`;
            get_relation_owns = JSON.parse(
                await runScript(
                    "./pythonapp/uploaded/toplevelkg/datalattekg.csv",
                    query_get_relation,
                    'query'
                )
            );

            if (
                Object.values(get_relation_owns?.entity_2)[0]?.includes(
                    "survey_owner_KG_"
                )
            ) {
                user_id = parseInt(
                    Object.values(get_owner_kg_user.entity_1)[0].split("_")[1]
                );
            }
        } else {
            user_id = await increaseIdentifier("user_identifier");
            console.log(user_id);
            fs.appendFileSync(
                "./pythonapp/uploaded/toplevelkg/datalattekg.csv",
                `User_${user_id} has 'wallet_id_${wallet_address}'\n`,
                function (err) {
                    if (err) throw err;
                    console.log("Saved!");
                }
            );
        }

        //write questions in survey file
        survey_id = await increaseIdentifier("survey_identifier");
        converter.json2csv(questions, (err, csv) => {
            if (err) {
                throw err;
            }
            fs.writeFileSync(
                `./pythonapp/uploaded/questions/survey_${survey_id}.csv`,
                csv
            );
        });
        //TODO: Create an API for the Lotus storage for return CID of survey

        //add information of survey in datalattekg
        const CID = "Null";
        const ready_file_datalatte_kg = [
            `Survey_${survey_id} is associated with ${title} KG`,
            `Survey_${survey_id} owns survey_KG_${survey_id}`,
            `Survey_KG_${survey_id} is stored with ${CID}`,
            `Sms_KG_1 relates to Null\n`
        ];

        fs.appendFileSync(
            "./pythonapp/uploaded/toplevelkg/datalattekg.csv",
            ready_file_datalatte_kg.join("\n"),
            function (err) {
                if (err) throw err;
                console.log("Saved!");
            }
        );
        const survey_owner_id = await increaseIdentifier(
            "survey_owner_identifier"
        );
        console.log(get_relation_owns?.entity_2);
        console.log(get_relation_owns?.entity_2.match('/survey_owner_KG_\d/g'));
        //check you have not survey before
        if (typeof(Object.keys(get_owner_kg_user?.entity_1)[0] !== "undefined")) {
            if (
                Object.values(get_relation_owns?.entity_2)[0]?.includes(
                    "survey_owner_KG_"
                )
            ) {
                const ready_file = [
                    `User_${user_id} creates survey_${survey_id}`,
                    `Survey_${survey_id} is stored with Null`,
                    `Survey_${survey_id} is associated with ${title} KG`,
                    `User_${user_id} owns survey_owner_KG_${survey_owner_id}`,
                    `Survey_owner_KG_${survey_owner_id} relates to Null\n`,
                ];
                fs.appendFileSync(
                    `./pythonapp/uploaded/surveyownerkg/survey_owner_kg_${survey_owner_id}.csv`,
                    ready_file.join("\n"),
                    function (err) {
                        if (err) throw err;
                        console.log("saved!");
                    }
                );
            } else {
                //create survey_owner_kg
                // Ceyed :D
                const ready_file = [
                    '"sentence"',
                    `Wallet_id_${wallet_address} has user_${user_id}`,
                    `User_${user_id} creates survey_${survey_id}`,
                    `Survey_${survey_id} is stored with Null`,
                    `Survey_${survey_id} is associated with ${title} KG`,
                    `User_${user_id} owns survey_owner_KG_${survey_owner_id}`,
                    `Survey_owner_KG_${survey_owner_id} relates to Null\n`,
                ];
                fs.writeFileSync(
                    `./pythonapp/uploaded/surveyownerkg/survey_owner_KG_${survey_owner_id}.csv`,
                    ready_file.join("\n"),
                    function (err) {
                        if (err) throw err;
                        console.log("saved!");
                    }
                );
            }
        }else {
            res.send({
                message: "ok",
                "status code": 200,
                error:"Your not my user!"
            });
        }

        //TODO upload survey owner kg on filecoin and get CID

        //update datalattekg file
        result_of_update = await runScript('./toplevelkg/datalattekg.csv', "relation == 'relates to' & entity_1 == 'Sms_KG_1'", 'update', 'entity_2', 'CID')
        result_of_update = await runScript(`./toplevelkg/survey_owner_KG_${survey_owner_id}.csv`, "relation == 'relates to' & entity_1 == 'Sms_KG_1'", 'update', 'entity_2', 'CID')
        
        
        
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
