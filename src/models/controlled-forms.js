const mongoose = require('mongoose')

const controlledFormSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        value: new Date()
    }
})

module.exports = mongoose.model('controlledForms', controlledFormSchema)