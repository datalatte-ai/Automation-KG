const { spawn } = require("child_process");

async function runScript(path, query, type_query, column_of_update, value_of_update){
    try {
        return new Promise((resolve, reject) =>{
            const process = spawn("python", [
                "./pythonapp/getquery.py",
                path,
                query,
                type_query,
                column_of_update,
                value_of_update
            ]);
            const out = []
            try {
                process.stdout?.on("data", data =>{
                    out.push(data.toString()); // <------------ by default converts to utf-8
                })
            } catch (err) {
                console.log(err);
            }
            const err = []
            process.stderr?.on("data", data => {
                err.push(data.toString())
            })
            process.on('exit', (code, signal) => {
                if (code === 0) {
                    resolve(out)
                } else {
                    reject(new Error(err.join('\n')))
                }
            })
        })
    } catch (err) {
        console.log(err);
    }
}
module.exports = {
    runScript
}