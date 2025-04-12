const mongoose = require('mongoose');

const detailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    strict: false,
})

module.exports = mongoose.model('commonDetails', detailsSchema)