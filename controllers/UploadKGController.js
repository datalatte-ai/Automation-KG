const { json } = require("body-parser")
const { asyncCsvParser } = require("../utils/readFile.js")

async function UploadFile(req, res) {
    try {
        const file_upload = await req.files.file
        // console.log(file_upload);
        const questions_user = await asyncCsvParser(file_upload)
        console.log(questions_user);
        res.send({
            "message":"ok",
            "status code":200        
        })
    } catch(err) {
        console.log(err);
    }
}
module.exports = {
    UploadFile
}