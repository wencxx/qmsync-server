const department = require('../models/departments')

exports.addDepartment = async (req, res) => {
    try {
        if (!req.body) return res.send('Please enter a department')

        const response = await department.create(req.body)

        if (!response) return res.send('Failed to add department')

        res.status(200).send('Added department successfully')
    } catch (error) {
        console.log(error)

        if(error.code === 11000){
            res.send('Department already added')
        }else{
            res.status(500).send('Server error')
        }
    }
}


exports.getDepartments = async (req, res) => {
    try {
        const departments = await department.find()

        if(!departments.length) return res.send('No departments found')

        res.status(200).send(departments)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}