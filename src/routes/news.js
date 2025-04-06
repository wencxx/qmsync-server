const express = require('express')
const router = express.Router()
const authenticateToken = require('../middlewares/authMiddleware')
const newsController = require('../controllers/newsController')

router.post('/add', authenticateToken, newsController.addNews)
router.get('/get', authenticateToken, newsController.getNews)
router.get('/getNotif/:role', authenticateToken, newsController.getNotifications)
router.patch('/read-all/:id', authenticateToken, newsController.readAllNotifications)
router.delete('/delete/:id', authenticateToken, newsController.deleteNews)

module.exports = router