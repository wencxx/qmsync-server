const expres = require('express')
const router = expres.Router() 
const multer = require("multer");
const controlledFormsController = require('../controllers/controlledFormsController')

const upload = multer({ storage: multer.memoryStorage() });

router.post('/add', upload.single('file'), controlledFormsController.addForsms)
router.get('/get', controlledFormsController.getForms)
router.get('/pending/:id', controlledFormsController.getPending)


module.exports = router