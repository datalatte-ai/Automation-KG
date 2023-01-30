const { get_query, update_object } = require("../utils/getQuery");
const converter = require("json-2-csv");

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

}

module.exports = {
    getAnswers
}