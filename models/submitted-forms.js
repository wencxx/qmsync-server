const mongoose = require('mongoose')

const submittedSchema = new mongoose.Schema({
    formId: {
        type:  mongoose.Schema.Types.ObjectId, 
        ref: 'controlledForms'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    strict: false
})

module.exports = mongoose.model('submittedForms', submittedSchema)