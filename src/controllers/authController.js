const bcrypt = require('bcrypt');
const user = require('../models/user');
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    try {
        const { password, ...otherData } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { ...otherData, password: hashedPassword };

        const newUser = await user.create(userData)

        if (newUser) {
            res.status(200).send('success');
        } else {
            res.status(400).send('failed');
        }
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            res.send('Username must be unique');
        } else {
            res.status(500).send('Server error');
        }
    }
};


exports.login = async (req, res) => {
    const { username, password } = req.body

    try {
        const userFound = await user.findOne({
            username
        }).populate('department').lean()

        if (!userFound) {
            return res.send('Invalid credentials');
        }

        const match = await bcrypt.compare(password, userFound.password)

        if (match) {
            const token = jwt.sign({ id: userFound._id }, process.env.SECRET)

            const userData = {
                ...userFound,
                token
            }

            res.status(200).send({ message: 'Login', userData })
        } else {
            res.send('Password do not match')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}


exports.getCurrentUser = async (req, res) => {
    const userId = req.user.id

    try {
        const userData = await user.findById(userId).populate('department').lean()

        if (userData) {
            res.status(200).send(userData)
        } else {
            res.send('User not found')
        }
    } catch (error) {
        res.send(error)
    }
}

exports.getUser = async (req, res) => {
    const { id } = req.params

    try {
        if(!id) return res.status(404).send('No user id receive')
        
        const userData = await user.findById(id)

        if(!userData) return res.status(404).send("User doesn't exists.")

        res.status(200).send(userData)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}