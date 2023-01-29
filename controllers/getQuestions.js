const { asyncCsvParser } = require("../utils/readFile.js");
const converter = require("json-2-csv");
const csv = require("csvtojson");
const fs = require("fs");
const { get_query, update_object } = require("../utils/getQuery");
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
        
        //query for find user in datalattekg'
        let query_get_user;
        query_get_user = [`has` ,`wallet_id_${wallet_address}`];
        try {
            get_owner_kg_user = (
                await get_query(
                    query_get_user,
                    "./uploaded/toplevelkg/datalattekg.csv"
                )
            );
        } catch (err) {
            console.log(err);
        }
        let user_id;
        let get_relation_owns;
        //check if user not find
        
        if (get_owner_kg_user[0]) {
            get_relation_owns = await get_query([get_owner_kg_user[0].entity_1, "", ""], "./uploaded/toplevelkg/datalattekg.csv")
            if (get_relation_owns[0].entity_2 && get_relation_owns[0]?.entity_2.includes("survey_owner_KG_")) {
                user_id = parseInt(get_owner_kg_user[0].entity_1.split("_")[1]);
            }
        } else {
            user_id = await increaseIdentifier("user_identifier");
            console.log(user_id);
            fs.appendFileSync(
                "./uploaded/toplevelkg/datalattekg.csv",
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
                `./uploaded/questions/survey_${survey_id}.csv`,
                csv
            );
        });
        //TODO: Create an API for the Lotus storage for return CID of survey

        const survey_owner_id = await increaseIdentifier("survey_owner_identifier");

        //add information of survey in datalattekg
        const CID = "Null";
        const ready_file_datalatte_kg = [
            `User_${user_id} owns survey_owner_KG_${survey_owner_id}`,
            `Survey_${survey_id} is associated with ${title} KG`,
            `Survey_${survey_id} owns survey_KG_${survey_id}`,
            `Survey_KG_${survey_id} is stored with ${CID}`,
            `Sms_KG_1 relates to Null\n`,
        ];

        fs.appendFileSync(
            "./uploaded/toplevelkg/datalattekg.csv",
            ready_file_datalatte_kg.join("\n"),
            function (err) {
                if (err) throw err;
                console.log("Saved!");
            }
        );


        query_get_user = ["", `has`,`wallet_id_${wallet_address}`];
        try {
            get_owner_kg_user = 
                await get_query(query_get_user, "./uploaded/toplevelkg/datalattekg.csv")
        } catch (err) {
            console.log(err);
        }
        //check you have not survey before
        if (
            get_owner_kg_user[0]?.entity_1
        ) {
            get_relation_owns = await get_query([get_owner_kg_user[0].entity_1, "", ""], "./uploaded/toplevelkg/datalattekg.csv")
            console.log(get_relation_owns)
            if (get_relation_owns.length > 0 && get_relation_owns[0]?.entity_2 && get_relation_owns[0]?.entity_2.includes("survey_owner_KG_")) {
                const ready_file = [
                    `User_${user_id} creates survey_${survey_id}`,
                    `Survey_${survey_id} is stored with Null`,
                    `Survey_${survey_id} is associated with ${title} KG`,
                    `User_${user_id} owns survey_owner_KG_${survey_owner_id}`,
                    `Survey_owner_KG_${survey_owner_id} relates to Null\n`,
                ];
                fs.appendFileSync(
                    `./uploaded/surveyownerkg/survey_owner_kg_${survey_owner_id}.csv`,
                    ready_file.join("\n"),
                    function (err) {
                        if (err) throw err;
                        console.log("saved!");
                    }
                );
            } else {
                //create survey_owner_kg
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
                    `./uploaded/surveyownerkg/survey_owner_KG_${survey_owner_id}.csv`,
                    ready_file.join("\n"),
                    function (err) {
                        if (err) throw err;
                        console.log("saved!");
                    }
                );
            }
        } else {
            res.send({
                message: "ok",
                "status code": 200,
                error: "Your not my user!",
            });
        }
        console.log("test100");
        //TODO upload survey owner kg on filecoin and get CID

        //update datalattekg file query[entity_1, relation, entity_2], path, field_update), value_update
        result_of_update = await update_object(
            ["Sms_KG_1", "relates to", "Null"],
            "./uploaded/toplevelkg/datalattekg.csv",
            "entity_2",
            "CID"
        );
        
        //create survey kg insert survey owner part
        const survey_kg = [
            '"sentence"',
            `Survey_${survey_id} belongs to user_${user_id}`,
            `Wallet_id_${wallet_address} has user_${user_id}`,
            `Survey_${survey_id} is associated with ${title} KG\n`,
        ];
        fs.writeFileSync(
            `./uploaded/surveykg/survey_KG_${survey_id}.csv`,
            survey_kg.join("\n"),
            function (err) {
                if (err) throw err;
                console.log("saved!");
            }
        );

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
