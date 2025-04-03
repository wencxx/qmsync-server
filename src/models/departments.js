const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
    depAbbr: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('department', departmentSchema)