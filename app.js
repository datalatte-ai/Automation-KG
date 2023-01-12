const express = require('express')
const app = express()

const port = 3000

const fileUpload = require('express-fileupload');

app.use(express.json());
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})