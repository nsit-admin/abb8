const serverless = require('serverless-http');
const connectToDatabase = require('./db');
const workspace = require('./models/workspace');
let express = require('express'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser'),
    htmldiff = require('./models/diff'),
    nodemailer = require('nodemailer');
const app = express();
let Document = require('./models/Document');
let User = require('./models/User');
let tags = require('./models/Tags');
let Message = require('./models/Messages');
let Merge = require('./models/Merge');
let Notification = require('./models/Notifications');
var email = process.env.MAILER_EMAIL_ID || 'abb8@mazosol.com';
var pass = process.env.MAILER_PASSWORD || 'Abb8@mazo';
var smtpTransport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: false,
    tls: {
        ciphers: 'SSLv3'
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
        user: email,
        pass: pass
    }
});

app.use(bodyParser.json({ strict: false }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/merge', (req, res) => {
    connectToDatabase();
    var reqCompleted = new Promise((resolve, reject) => {
        mergeWithMaster(req.body, function (result) {
            if (result == 'success') {
                resolve();
            } else {
                reject();
            }
        });
    });

    reqCompleted.then(() => {
        res.status(200).json({
            data: "Merge Completed successfully"
        })
    }).catch(err => {
        res.status(200).json({
            data: "Merge didnt start due to this error",
            error: err
        })
    })
});

async function mergeWithMaster(editDoc, result) {
    await Document.findOne({ _id: editDoc._id }).then(editDocHtml => {
        if (editDocHtml) {
            console.log('Fetching Edit document => Step 1', new Date());
            editDoc.documentHtml = editDocHtml.documentHtml;
            workspace.findOne({ w_name: editDoc.w_name, w_version: 'Master' }).then(masterWorkspace => {
                if (masterWorkspace) {
                    console.log('Fetching Master document => Step 2', new Date());
                    console.log('Merge Started => Step 3', new Date());
                    Document.findOne({ workspaceId: masterWorkspace._id, documentName: editDoc.documentName }).then(masterDoc => {
                        if (masterDoc) {
                            const merged = htmldiff(masterDoc.documentHtml, editDoc.documentHtml);
                            if (merged) {
                                console.log('Merge Completed => Step 4', new Date());
                                const req = {
                                    document_name: editDoc.documentName,
                                    document_html: merged,
                                    document_id: editDoc._id,
                                    master_document_id: masterDoc._id,
                                    workspace_id: editDoc.workspaceId,
                                    master_workspace_id: masterDoc.workspaceId,
                                    status: 'Active'
                                }
                                Merge.updateOne({ document_id: editDoc._id }, req, { upsert: true }).then(data => {
                                    // setCompleteMergeStatus(editDoc._id);
                                    Document.findByIdAndUpdate({ _id: editDoc._id }, { merge_status: 'Completed' }, { upsert: true }).then(data => {
                                        console.log('Document status updated => Step 4', new Date());
                                        result('success');
                                    }).catch(err => {
                                        result("error", err);
                                    });
                            
                                }).catch(err => {
                                    result("error", err);
                                });
                            }
                        } else {
                            Document.findByIdAndUpdate({ _id: editDoc._id }, { merge_status: 'Completed' }, { upsert: true }).then(data => {
                                result('success');
                            }).catch(err => {
                                result("error", err);
                            });
                        }
                    }).catch(err => {
                        result("error", err);
                    });
                }
            }).catch(err => {
                result("error", err);
            });
        }
    }).catch(err => {
        result("error", err);
    });
}

// async function getDocumentHtml(editDoc) {

// }

// async function getMasterWorkspaceData(editDoc) {

// }

// async function getMasterDocument(editDoc, masterWorkspace) {

// }

// async function saveMergeVersion(editDoc, masterDoc, merged) {

// }

module.exports.handler = serverless(app);