const mongoose = require('mongoose')

const newsSchema = new mongoose.Schema({
    title: {
        type: String
    },
    descriptiop: {
        type: String,
        default: null 
    },
    createdAt: {
        type: Date,
        value: Date.now
    }
})

module.exports = mongoose.model('news', newsSchema)