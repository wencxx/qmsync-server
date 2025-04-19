const PizZip = require('pizzip')
const Docxtemplater = require('docxtemplater')
const admin = require("firebase-admin");
const controlledForms = require('../models/controlled-forms')
const submittedForms = require('../models/submitted-forms')
const axios = require('axios')
const notifications = require('../models/notifications')
const moment = require('moment')

const serviceAccount = require("../config/firebase.json");

admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "nopsscea-client",
        "private_key_id": "47aea8afac69ad4affcc972a23ada95ba74f9341",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCQdNX4qe5BMtSw\nLVsvtuU7AGmZJe+z4bN4akvte3OelafuRvXfWi17r+UR1EfFkfAWsidlC/7nBpay\nNJT8lWohlcCU/659B3uhZnfJ1bpFLsihemxrDsm25jMxbjys7nKBFcSevS09kM4/\nViLym02DKJJ5hN36hnetgpfcqehRqY7ligaKREjNbASzOY6EdPZ29UWc37F3bs4s\nBoLhlj9nirlGto94YaKR2aW2wyTVo5kUV6EHzK4FPpZjiFr7UUKAXKA0EBruhN2d\n/3VrVo/Z+wlNiFE3CJgPXObJ7E8NdpURAn/2Mju3GSz3zJqpUa5+4reZs7M0T3Jz\nZBPAw/gpAgMBAAECggEACRdrWIw0WCLfdyuRmbwKawdUfgygzIrLyWwyNWLvxMcx\nM5pAcvNJWceZFIFOV5E+4aTKfS3vN+HGpfZQeqGaNX0n6tC5LfoEtkSdTSUABUbj\nnmMWs/mxKQtNpUKle7JBn11r+5wXHvDwRBTzG975lsO8zTxXHqNsII3PqjYAzrPT\nl1YRAZdVb80lTwprGYM3C7AfWAH/d2PMU2yvxQyaoxJi90c0E8SMqE8PM1aFdfeW\niNWk9c9j2DE9Z/j3nob3rl1rGm4sUPZevfibf8iTSOOkYR0OExatkFs3iLocI+HD\ndEBq3oJXqA68wIOFZXRFPo4q19Y8MjZ4QkS7GeKu4QKBgQDHYsBpPTEkcacAUR0Q\ne2lSozJ75jQcaDR8jY05DDQ2h0w8tL6POrgMT0eSUzD9pjxlvyrMkkgdcDjmiS0V\niJVVKUZXopzg/Lb4uwsDNYsKEkkgKblOdlP5cKxfYAlNuJCis8svLtTpPS2CbTP1\n5IZjJJEfSujKXrXkJkUVEgTQyQKBgQC5eUwSbQKRkDvWDAbeeZ02dPupdEza8f5j\nYx9FxOGTtwnULJqjleO3dXGXWx26sa9WP/HzFXTSRi1lPHPMGetvA8W/KbJs7mr4\nmDyHuQ2ApXJajNIwD1nghjvKBZ4WwLSdP0D5kJH3pAgG2W86TanCLIbugoEkSBQX\nh8wu7JP8YQKBgGgfwR30b+J5W95FfekqmeEnCuk7WgFvxeE5xwOAxQ+o7n5RYabI\n4m7DRDw9J7t/AdGc2MwGpJSDE6QJBTtWna3gpTSE3mp8b01L2L9vSdITpI6gW36H\nOulsFwijzZgCB76AKF7WlSfM5CRVxSnnkurZoNP3ucRdW53vAmqzg0JJAoGACeB9\nvpVzh5DovtNRIlPTnWzJYhLBbP9qDpzes3ZylM0whs4BRijbQY/NhsPhZ2nC7pLl\nLY68892s2TFI8VuIABdxVmbAC7D+nVJuFsQyBeHJnyzUnJ6UqLI9SNrXulp0w9L0\ngNXEEC36B3NYywALxD1eyiDFA8ua1k3y/6S1lMECgYAZJFhvEyDdq6mGz+Xq4IAu\nFzxbWgICJoJgJIcwmihBpXj2CWfzQ+pXPxoJ9vljiYSMlOGEjgYRmLvPu/O+GkHE\nQLo3Y89ZenXlpQJLhBFFAXz5/zytArPfPPWnlQ3UzaCGcqOHJO/CNdeKIsFiMZwh\nUykIdR289/ayOmAONbQ6vQ==\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-56gkb@nopsscea-client.iam.gserviceaccount.com",
        "client_id": "107568636995586717679",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-56gkb%40nopsscea-client.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    }),
    storageBucket: "gs://nopsscea-client.appspot.com"
});

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

            const createdForm = await controlledForms.create({
                ...req.body,
                roles: parseRoles,
                fileUrl: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
                placeholders,
            })

            if (createdForm) {
                await notifications.create({
                    title: `New form added: ${createdForm.formName}`,
                    content: `A new controlled form is now available for submission. Deadline - ${moment(createdForm.dueDate).format('lll')}`,
                    formType: "form",
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

exports.deleteForm = async (req, res) => {
    const formId = req.params.id

    try {
        if (!formId) {
            res.status(404).send("Form not found")
            return
        }

        const deletedForm = await controlledForms.findByIdAndDelete(formId)

        if (deletedForm) {
            await submittedForms.deleteMany({
                formId: deletedForm._id
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

    console.log(role)
    try {
        const pendingForms = await controlledForms.find({
            filledOut: { $nin: [id] },
            roles: { $in: [role] },
        })

        if (pendingForms.length) {
            res.status(200).send(pendingForms)
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
        }).populate('formId').lean()

        const formattedData = completedForms.map(form => ({
            ...form.formId,
            submittedFormId: form._id,
            completedDate: form.createdAt
        }));

        if (completedForms.length) {
            res.status(200).send(formattedData)
        } else {
            res.send('No forms found')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}

exports.getFacultyForms = async (req, res) => {
    const role = req.params.role
    try {

        console.log(role)
        const forms = await controlledForms.find({
            roles: { $in: [role] }
        }).lean()

        let data = []

        for (const form of forms) {
            if (form.filledOut.length) {
                for (const user of form.filledOut) {
                    const submittedForm = await submittedForms.findOne({
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
            return res.status(404).send("Form not found");
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

        res.status(200).send(buffer);
    } catch (error) {
        console.error("Error generating document:", error);
        res.status(500).send({ message: "Server error", error });
    }
};
