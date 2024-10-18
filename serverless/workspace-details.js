// 'use strict';
const serverless = require('serverless-http');
const connectToDatabase = require('./db');
// const connectToDocDatabase = require('./db-doc');
const Document = require('./models/Document');
const Workspace = require('./models/workspace');
let express = require('express'),
    mongoose = require('mongoose'),
    // app = express.Router(),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ strict: false }));

app.get("/list-documents", (req, res, next) => {
    connectToDatabase();
    Document.find({ workspaceId: req.query.id }).then(data => {
        res.status(200).json({
            data: data,
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

app.post('/upload-document', (req, res) => {
    connectToDatabase();
    const doc = new Document({
        _id: new mongoose.Types.ObjectId(),
        documentName: req.body.documentName,
        documentHtml: req.body.document,
        workspaceId: req.body.workspaceId,
        workspaceName: req.body.workspaceName,
        editCount: 0,
        created_by: req.body.created_by,
        created_dt: req.body.created_dt,
        modified_by: req.body.created_by,
        modified_dt: req.body.created_dt,
    });
    doc.save().then(result => {
        res.status(200).json({
            message: "Document uploaded successfully.",
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


app.put("/editDocument", (req, res, next) => {
    connectToDatabase();
    if (req.query.id) {
        let updated = {
            documentHtml: req.body.documentHtml,
            editCount: (req.body.editCount) + 1,
            modified_by: req.body.modified_by,
            modified_dt: req.body.modified_dt,
        };
        Document.findOneAndUpdate({ _id: req.query.id }, updated)
            .then(() => res.status(200).json({ status: 200, message: "Docuement Edited Successfully!" }))
            .catch(err => res.status(500).json(err))
    }
});

app.get("/list-workspaces", (req, res, next) => {
    connectToDatabase();
    Workspace.find().sort({ created_dt: 1 }).then(data => {
        if (data && data.length > 0) {
            const last30DaysWorkspaces = data.filter(w => (w.created_dt && new Date(w.created_dt).getTime() >= new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)));
            let distict_dates = [...new Set(last30DaysWorkspaces.map((res) => {
                if (res.created_dt) {
                    return res.created_dt.substring(0, 10);
                }

            }))];
            //count each date frequency
            let chartData = distict_dates.map(a => {
                return {
                    value: last30DaysWorkspaces.filter((a1) => {
                        if (a1.created_dt) {
                            return a1.created_dt.startsWith(a);
                        }
                    }).length,
                    name: a
                }

            })
            const totalWorkspaces = data.length;
            const openWorkspaces = data.filter(w => (w.status && w.status.toUpperCase() === 'ACTIVE')).length;
            res.status(200).json({
                data: data,
                chartData: [{ name: 'Work Space', series: chartData }],
                totalWorkspaces: totalWorkspaces,
                openWorkspaces: openWorkspaces
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
module.exports.handler = serverless(app);