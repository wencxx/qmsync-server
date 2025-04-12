const mongoose = require('mongoose')

const notificationsSchema = new mongoose.Schema({
    title: {
        type: String
    },
    content: {
        type: String
    },
    for: [
        {
            type: String
        }
    ],
    read: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: false
        }
    ],
    formType: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('notifications', notificationsSchema)