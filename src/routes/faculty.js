const express = require('express')
const router = express.Router()
const authenticateToken = require('../middlewares/authMiddleware')
const facultyContoller = require('../controllers/facultyController')
 
router.get('/get/:depId', authenticateToken, facultyContoller.getByDepartment)

module.exports = router