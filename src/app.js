const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', require('./routes/auth'));
app.use('/controlled-forms', require('./routes/controlled-forms'));
app.use('/quality-records', require('./routes/quality-records'));
app.use('/departments', require('./routes/department'));
app.use('/faculties', require('./routes/faculty'));
app.use('/news', require('./routes/news'));

module.exports = app