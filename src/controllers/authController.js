const bcrypt = require('bcrypt'); 
const user = require('../models/user');

exports.register = async (req, res) => {
    try {
        const { password, ...otherData } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { ...otherData, password: hashedPassword };

        const newUser = await user.create(userData)

        if(newUser){
            res.status(200).send('success');
        }else{
            res.status(400).send('failed');
        }
    } catch (error) {
        console.log(error);
        if(error.code === 11000){
            res.send('Username must be unique'); 
        }else{
            res.status(500).send('Server error'); 
        }
    }
};


exports.login = async (req, res) => {
    const { username, password } = req.body
    
    try {
        const userFound = await user.findOne({
            username
        }) 

        if (!userFound) {
            return res.send('Invalid credentials');
        }

        const match = await bcrypt.compare(password, userFound.password)

        if(match){
            res.send('Login')
        }else{
            res.send('Password do not match')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}