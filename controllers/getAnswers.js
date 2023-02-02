const { get_query, update_object } = require("../utils/getQuery");
const converter = require("json-2-csv");
const fs = require('fs');


async function getAnswers(req, res) {
    const wallet_address = req.body.wallet_address;
    const query_get_user = ['' , `has` ,`wallet_id_${wallet_address}`];
    get_owner_kg_user = await get_query(query_get_user, "./uploaded/toplevelkg/datalattekg.csv");
    let user_id;
    if (get_owner_kg_user[0]) {
        user_id = get_owner_kg_user[0].entity_1.split('_')[1]
    } else {
        user_id = await increaseIdentifier("user_identifier");
        fs.appendFileSync(
            "./uploaded/toplevelkg/datalattekg.csv",
            `User_${user_id} has 'wallet_id_${wallet_address}'\n`,
            function (err) {
                if (err) throw err;
                console.log("Saved!");
            }
        );
    }

    const results = req.body.results;
    const survey_id = req.body.survey_id;
    const change_point_reverce = {
        "Slightly Disagree":4,
        "Strongly Agree":1,
        "Moderately Disagree":5,
        "Moderately Agree":2,
        "Strongly Disagree":6,
        "Slightly Agree":3
    }

    const change_point = {
        "Slightly Disagree":3,
        "Strongly Agree":6,
        "Moderately Disagree":2,
        "Moderately Agree":5,
        "Strongly Disagree":1,
        "Slightly Agree":4
    }

    const rv = [0,4,5,9,12,13,18,22,23,26,27,28]
    for (let item of Object.keys(results)) {
        if (rv.includes(parseInt(item))) {
            Object.keys(change_point_reverce).forEach((key) => {
                if (key == results[item].answer) {
                    results[item].answer = change_point_reverce[key]
                }
            });
        } else {
            Object.keys(change_point).forEach((key) => {
                if (key == results[item].answer) {
                    results[item].answer = change_point[key]
                }
            });
        }
    }
    converter.json2csv(results, (err, csv) => {
        if (err) {
            throw err;
        }
        fs.writeFileSync(
            `./uploaded/resultskg/result_${survey_id}_${user_id}.csv`,
            csv
        );
    });


    //API to upload result-kg on Ip-fs or File-coin
 
    res.send({
        message:"ok",
        status:200
    })
}

module.exports = {
    getAnswers
}