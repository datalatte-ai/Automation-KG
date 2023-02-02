const express = require('express')
const app = express()
const {getQuestions, sendQuestions, getAnswers} = require('./controllers')
const port = 3000

const fileUpload = require('express-fileupload');

app.use(express.json());
// app.use(express.urlencoded())
app.use(fileUpload());

app.post("/api/v1/upload_survey", async (req, res) => {
  await getQuestions(req, res);
});
app.get("/api/v1/send_questions", async (req, res) => {
  await sendQuestions(req, res);
});
app.post("/api/v1/send_answers", async (req, res) => {
  await getAnswers(req, res);
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})