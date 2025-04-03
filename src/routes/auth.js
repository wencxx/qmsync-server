const express = require('express')
const router = express.Router()
const authController =  require('../controllers/authController')
const authenticateToken = require('../middlewares/authMiddleware')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/get-current-user', authenticateToken, authController.getCurrentUser)
router.get('/get-specific-user/:id', authenticateToken, authController.getUser)

module.exports = router