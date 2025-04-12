const express = require("express")
const router = express.Router()
const authenticateToken = require('../middlewares/authMiddleware')
const commonDetailsController = require('../controllers/commomDetailsController')

router.post('/add/:id', authenticateToken, commonDetailsController.add)
router.get('/get/:id', authenticateToken, commonDetailsController.get)

module.exports = router