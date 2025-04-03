const express = require('express')
const router = express.Router()
const authenticateToken = require('../middlewares/authMiddleware')

// router.post('/add', authenticateToken, require('../controllers/newsController'))

module.exports = router