const express = require('express')
const router = express.Router()
const departmentController = require('../controllers/departmentController')



router.post('/add', departmentController.addDepartment)
router.get('/get', departmentController.getDepartments)


module.exports = router