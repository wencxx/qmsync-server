const mongoose = require('mongoose')

const submittedSchema = new mongoose.Schema({
    formId: {
        type:  mongoose.Schema.Types.ObjectId, 
        ref: 'controlledForms'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    strict: false
})

module.exports = mongoose.model('submittedForms', submittedSchema)