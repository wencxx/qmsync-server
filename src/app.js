const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/controlled-forms', require('./routes/controlled-forms'));

app.use('/auth', require('./routes/auth'));

module.exports = app