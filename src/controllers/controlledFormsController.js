const PizZip = require('pizzip')
const admin = require("firebase-admin");
const controlledForms = require('../models/controlled-forms')

const serviceAccount = require("../config/firebase.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://nopsscea-client.appspot.com"
});

const bucket = admin.storage().bucket();

exports.addForsms = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const uploadedFile = req.file;

        if (uploadedFile.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return res.status(400).json({ error: "Invalid file type. Please upload a .docx file." });
        }

        try {
            const zip = new PizZip(uploadedFile.buffer);
            const xmlText = zip.files["word/document.xml"].asText();

            const cleanedText = xmlText.replace(/<[^>]+>/g, ""); 

            const placeholderRegex = /\{(.*?)\}/g;
            const placeholders = [];
            let match;
            while ((match = placeholderRegex.exec(cleanedText)) !== null) {
                placeholders.push(match[1].trim());
            }

            // Upload the file to Firebase Storage under the 'documents' folder
            const fileName = `qmsync/${Date.now()}_${uploadedFile.originalname}`;
            const file = bucket.file(fileName);

            await file.save(uploadedFile.buffer, {
                metadata: {
                    contentType: uploadedFile.mimetype,
                },
            });

            await file.makePublic();

            const createdForm = await controlledForms.create({
                ...req.body,
                fileUrl: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
                placeholders,
            })

            if(createdForm){
                res.send('success')
            }else{
                res.send('failed')
            }
        } catch (error) {
            console.error("Error processing .docx file:", error.message);
            return res.status(400).send({ error: "Error processing .docx file. Ensure it's a valid template." });
        }
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
}


exports.getForms = async (req, res) => {
    try {
        const forms = await controlledForms.find()

        if(forms.length){
            res.status(200).send(forms)
        }else{
            res.status(404).send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}

exports.getPending = async (req, res) => {
    const id = req.params.id
    const currentDate = new Date()
    try {
        const pendingForms = await controlledForms.find({
            filledOut: { $nin: [id] },
            dueDate: { $gt: currentDate }
        })

        if(pendingForms.length){
            res.status(200).send(pendingForms)
        }else{
            res.status(404).send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}