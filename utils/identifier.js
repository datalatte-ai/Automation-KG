const fs = require('fs');

async function increaseIdentifier(obj){
    try {
        const identifiers = JSON.parse(fs.readFileSync("./utils/identifier.json").toString())
        identifiers[obj] = identifiers[obj] + 1;
        fs.writeFileSync("./utils/identifier.json", JSON.stringify(identifiers))
        return identifiers[obj]
    } catch (err) {
        console.log(err);
    }
}

async function findIdentifier(obj){
    try {
        const identifiers = JSON.parse(fs.readFileSync("./utils/identifier.json").toString())
        return identifiers[obj]
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    increaseIdentifier,
    findIdentifier
}