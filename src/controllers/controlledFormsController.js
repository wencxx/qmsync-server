const PizZip = require('pizzip')
const Docxtemplater = require('docxtemplater')
const admin = require("firebase-admin");
const controlledForms = require('../models/controlled-forms')
const submittedForms = require('../models/submitted-forms')
const axios = require('axios')

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

            if (createdForm) {
                res.send('success')
            } else {
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

        if (forms.length) {
            res.status(200).send(forms)
        } else {
            res.status(404).send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}

exports.getPending = async (req, res) => {
    const id = req.params.id
    try {
        const pendingForms = await controlledForms.find({
            filledOut: { $nin: [id] }
        })

        if (pendingForms.length) {
            res.status(200).send(pendingForms)
        } else {
            res.status(404).send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}

exports.submitForm = async (req, res) => {
    try {
        const response = await submittedForms.create(req.body)

        if (response) {
            await controlledForms.findByIdAndUpdate(req.body.formId, {
                $push: {
                    filledOut: req.body.userId
                }
            })
            res.status(200).send('success')
        } else {
            res.status(400).send('failed')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}

exports.getCompleted = async (req, res) => {
    const id = req.params.id
    try {
        const completedForms = await submittedForms.find({
            userId: id
        }).populate('formId')

        const formattedData = completedForms.map(form => ({
            ...form.formId.toObject(),
            submittedFormId: form._id,
            completedDate: form.createdAt
        }));

        if (completedForms.length) {
            res.status(200).send(formattedData)
        } else {
            res.status(404).send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}

exports.generateDocs = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await submittedForms.findById(id).populate("formId");

        if (!data || !data.formId) {
            return res.status(404).send({ message: "Form not found" });
        }

        const { formId, ...restData } = data.toObject();
        const fileUrl = formId.fileUrl;

        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

        const zip = new PizZip(response.data);
        const doc = new Docxtemplater(zip);

        doc.setData(restData);
        doc.render();

        const buffer = doc.getZip().generate({ type: "nodebuffer" });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename=output.docx`);
        
        res.send(buffer);
    } catch (error) {
        console.error("Error generating document:", error);
        res.status(500).send({ message: "Server error", error });
    }
};
