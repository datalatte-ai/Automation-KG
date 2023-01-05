const fs = require('fs');
const { parse } = require("csv-parse");


async function readFile(fileAddress) {
    try {
        let file = await fs.readFileSync(fileAddress, 'utf8');
        return file;
    }
    catch (error) {
        // console.log({ error })
        return false;
    }
}

async function asyncCsvParser(path) {
    const myPromise = new Promise((resolve, reject) => {
        const data = fs.readFileSync(path, "utf8");
        parse(
            data,
            { relax_quotes: true, skip_records_with_empty_values: true, trim: true },
            (err, records) => {
                resolve(records);
            }
        );
    });
    return await myPromise;
}


module.exports = {
    readFile,
    asyncCsvParser
}
