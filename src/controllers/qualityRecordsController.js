const PizZip = require('pizzip')
const Docxtemplater = require('docxtemplater')
const admin = require("firebase-admin");
const qualityRecords = require('../models/quality-records')
const submittedQualityRecords = require('../models/submitted-quality-records')
const axios = require('axios')
const notifications = require('../models/notifications')
const moment = require('moment')

const bucket = admin.storage().bucket();

exports.addForms = async (req, res) => {
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

            const fileName = `qmsync/${Date.now()}_${uploadedFile.originalname}`;
            const file = bucket.file(fileName);

            await file.save(uploadedFile.buffer, {
                metadata: {
                    contentType: uploadedFile.mimetype,
                },
            });

            await file.makePublic();

            const parseRoles = JSON.parse(req.body.roles)

            const createdForm = await qualityRecords.create({
                ...req.body,
                roles: parseRoles,
                fileUrl: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
                placeholders,
            })

            if (createdForm) {
                await notifications.create({
                    title: `New record added: ${createdForm.formName}`,
                    content: `A new quality record form is now available for submission. Deadline - ${moment(createdForm.dueDate).format('lll')}`,
                    formType: "record",
                    for: parseRoles
                })
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
        const forms = await qualityRecords.find()

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

exports.deleteForm = async (req, res) => {
    const recordId = req.params.id

    try {
        if (!recordId) {
            res.status(404).send("Record not found")
            return
        }

        const deletedRecord = await qualityRecords.findByIdAndDelete(recordId)

        if (deletedRecord) {
            await submittedQualityRecords.deleteMany({
                formId: deletedRecord._id
            })
            res.status(200).send('Deleted successfully')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}

exports.getPending = async (req, res) => {
    const id = req.params.id
    const role = req.params.role

    try {
        const pendingQualityRecords = await qualityRecords.find({
            filledOut: { $nin: [id] },
            roles: { $in: [role] },
        })

        if (pendingQualityRecords.length) {
            res.status(200).send(pendingQualityRecords)
        } else {
            res.send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}

exports.submitForm = async (req, res) => {
    try {
        const response = await submittedQualityRecords.create(req.body)

        if (response) {
            await qualityRecords.findByIdAndUpdate(req.body.formId, {
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
        const completedQualityRecords = await submittedQualityRecords.find({
            userId: id
        }).populate('formId').lean()

        const formattedData = completedQualityRecords.map(form => ({
            ...form.formId,
            submittedFormId: form._id,
            completedDate: form.createdAt
        }));

        console.log(completedQualityRecords)
        if (completedQualityRecords.length) {
            res.status(200).send(formattedData)
        } else {
            res.send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}

exports.getFacultyRecords = async (req, res) => {
    const role = req.params.role
    try {

        const forms = await qualityRecords.find({
            roles: { $in: [role] }
        }).lean()

        let data = []

        for (const form of forms) {
            if (form.filledOut.length) {
                for (const user of form.filledOut) {
                    const submittedForm = await submittedQualityRecords.findOne({
                        userId: user,
                        formId: form._id
                    }).lean()


                    data.push({
                        ...form,
                        submittedForm: {
                            ...submittedForm
                        }
                    })
                }
            } else {
                data.push({
                    ...form,
                })
            }
        }

        if (data.length) {
            res.status(200).send(data)
        } else {
            res.status(400).send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}

exports.generateDocs = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await submittedQualityRecords.findById(id).populate("formId");

        if (!data || !data.formId) {
            return res.send("Record not found");
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

