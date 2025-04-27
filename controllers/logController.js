const logs = require('../models/user-logs')

exports.add = async (req, res) => {
    try {
        const newLog = await logs.create(req.body)

        if(!newLog) return res.status(400).send('Failed to add log')

        res.status(200).send('Added log')
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}

exports.get = async (req, res) => {
    try {
        const logsData = await logs.find().populate('userId').lean().sort({createdAt: 'desc'})

        if(!logsData.length) return res.status(404).send("No logs found")

        res.status(200).send(logsData)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}