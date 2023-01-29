const { asyncCsvParser} = require('./readFile')
const nlp = require('compromise')
const fs = require('fs')

async function tokenize(path) {
    try {
        const fl = await asyncCsvParser(path)
        let query_object;
        let doc;
        let list_of_query_objects = []
        for (let lf in fl) {
            doc = nlp(fl[lf][0])
            let verb = '';
            let entity = '';
            let entity_2 = '';
            let flag = true;
            for (let line of doc.docs[0]) {
                if (line.tags.has('Noun') && line.tags.has('Singular') && flag || line.tags.has('Noun') && line.tags.has('Uncountable') && flag) {
                    entity = entity + " " + line.text;
                    flag = false
                }
                else if (line.tags.has('Verb') || line.tags.has('Preposition') || line.tags.has('Conjunction') || line.tags.has('Determiner') || line.text.includes('membership')){
                    verb = verb + " " + line.text
                } else {
                    entity_2 = entity_2 + " " + line.text
                }
            }
            query_object = {
                entity_1:entity.trimStart(),
                relation:verb.trimStart(),
                entity_2:entity_2.trimStart()
            }
            list_of_query_objects.push(query_object)
        }
        return list_of_query_objects;
    } catch (err) {
        console.log(err);
    }
}

async function get_query(query, path) {
    try {
        data_object = await tokenize(path)
        let result;
        if (query[0] && query[1] && query[2]) {
            result = data_object.filter(({ entity_1, relation, entity_2 }) => entity_1 === query[0] && relation === query[1] && entity_2 === query[2]);
        } else if (query[0] && query[1]) {
            result = data_object.filter(({ entity_1, relation }) => entity_1 === query[0] && relation === query[1]);
        } else if (query[1] && query[2]) {
            result = data_object.filter(({ relation, entity_2 }) => relation === query[1] && entity_2 === query[2]);
        } else {
            result = data_object.filter(({ entity_1, relation, entity_2 }) => entity_1 === query[0] || relation === query[0] || entity_2 === query[0]);
        }
        return result;
    } catch (err) {
        console.log(err);
    }
}

async function update_object(query, path, field_update, value_update) {
    data_object = await tokenize(path);
    for (let item of Object.keys(data_object)) {
        if (
            data_object[item].entity_1 == query[0] &&
            data_object[item].relation == query[1] &&
            data_object[item].entity_2 == query[2]
        ) {
            if (field_update == "entity_1") {
                data_object[item].entity_1 = value_update;
            } else if (field_update == "entity_2") {
                data_object[item].entity_2 = value_update;
            } else if (field_update == "relation") {
                data_object[item].relation = value_update;
            }
        }
    }
    let writeStream = fs.createWriteStream(path);
    data_object.forEach((someObject, index) => {
        if (index == 0) {
            writeStream.write("\"" + someObject.relation + "\"" + "\n");
        } else {
            writeStream.write(
                someObject.entity_1 +
                    " " +
                    someObject.relation +
                    " " +
                    someObject.entity_2 +
                    "\n"
            );
        }
    });

    writeStream.end();

    writeStream
        .on("finish", () => {
            console.log("update Successfully!");
        })
        .on("error", (err) => {
            console.log(err);
        });
}

module.exports = {
    get_query,
    update_object
}