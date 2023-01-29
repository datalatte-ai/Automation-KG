const express = require('express')
const app = express()
const {getQuestions, sendQuestions} = require('./controllers')
const port = 3000

const fileUpload = require('express-fileupload');

app.use(express.json());
app.use(fileUpload());

app.get("/", async (req, res) => {
  res.send({"message":"Hello"})
})

app.post("/api/v1/upload_survey", async (req, res) => {
  await getQuestions(req, res);
});
app.get("/api/v1/send_questions", async (req, res) => {
  await sendQuestions(req, res);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})