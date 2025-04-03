const mongoose = require('mongoose')

const qualityRecords = new mongoose.Schema({
    formId: { 
        type: String,
        required: true
    },
    formName: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    placeholders: [{ 
        type: String,
        required: true
    }],
    fileUrl: {
        type: String,
        required: true
    },
    filledOut: [{
        type: String,
        required: false
    }],
    roles: [{
        type: String,
        required: false
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('qualityRecords', qualityRecords)