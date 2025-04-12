const commonDetails = require('../models/common-details')

exports.add = async (req, res) => {
    const userId = req.params.id

    try {
        if (!userId) {
            return res.status(404).send('User ID not found')
        }

        const data = {
            ...req.body,
            userId
        }

        const updatedUser = await commonDetails.findOneAndUpdate(
            { userId: userId },
            { $set: data },
            { upsert: true, new: true }
        );

        if (updatedUser) {
            res.status(200).send('Updated common details successfully')
        } else {
            throw new Error('Failed to update commond details')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}

exports.get = async (req, res) => {
    const userId = req.params.id

    try {
        if (!userId) {
            return res.status(404).send('User ID not found')
        }

        const userData = await commonDetails.findOne(
            { userId: userId },
        );

        if (userData) {
            res.status(200).send(userData)
        } else {
            res.status(404).send('No details found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}