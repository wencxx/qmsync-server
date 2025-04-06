const mongoose = require('mongoose')

const newsSchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String,
        default: null 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('news', newsSchema) 