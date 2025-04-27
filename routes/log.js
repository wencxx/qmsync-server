const express = require('express')
const router = express.Router()
const authenticateToken = require('../middlewares/authMiddleware')
const logController = require('../controllers/logController')

router.post('/add', authenticateToken, logController.add)
router.get('/get', authenticateToken, logController.get)

module.exports = router 