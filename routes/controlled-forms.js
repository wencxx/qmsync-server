const expres = require('express')
const router = expres.Router() 
const multer = require("multer");
const controlledFormsController = require('../controllers/controlledFormsController')

const upload = multer({ storage: multer.memoryStorage() });

router.post('/add', upload.single('file'), controlledFormsController.addForms)
router.get('/get', controlledFormsController.getForms)
router.delete('/delete/:id', controlledFormsController.deleteForm)
router.get('/get-faculty-forms/:role', controlledFormsController.getFacultyForms)
router.get('/pending/:id/:role', controlledFormsController.getPending)
router.post('/submit', controlledFormsController.submitForm)
router.get('/completed/:id', controlledFormsController.getCompleted)
router.get('/generateDocs/:id', controlledFormsController.generateDocs)
    

module.exports = router