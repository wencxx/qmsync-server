const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if(!token) return res.status(201).send('Access denied.')

    try {
        const userData = jwt.verify(token, process.env.SECRET)

        req.user = userData
        next()
    } catch (error) {
        console.log(error)
        res.send('Server error')
    }
}

module.exports = authenticateToken