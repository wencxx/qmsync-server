const mongoose = require('mongoose')
const user = require('../models/user')


exports.getByDepartment = async (req, res) => {
    const { depId } = req.params

    try {
        if(!depId){
            res.status(400).send('Invalid department id')
            return
        }

        const faculties = await user.find({ department: depId }) 

        if(faculties.length){
            res.status(200).send(faculties)
        }else{
            res.status(404).send('No faculties found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error', error)
    }
}