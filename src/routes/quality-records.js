const expres = require('express')
const router = expres.Router() 
const multer = require("multer");
const qualityRecordsController = require('../controllers/qualityRecordsController')

const upload = multer({ storage: multer.memoryStorage() });

router.post('/add', upload.single('file'), qualityRecordsController.addForms)
router.get('/get', qualityRecordsController.getForms)
router.delete('/delete/:id', qualityRecordsController.deleteForm)
router.get('/get-faculty-records/:role', qualityRecordsController.getFacultyRecords)
router.get('/pending/:id/:role', qualityRecordsController.getPending)
router.post('/submit', qualityRecordsController.submitForm)
router.get('/completed/:id', qualityRecordsController.getCompleted)
router.get('/generateDocs/:id', qualityRecordsController.generateDocs)

    

module.exports = router