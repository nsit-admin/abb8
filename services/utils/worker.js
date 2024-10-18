let workspace = require('../models/workspace');
let Document = require('../models/Document');
let Merge = require('../models/Merge');
let mongoose = require('mongoose');
const dbConfig = require('../database/db');
let htmldiff = require('../models/diff');

mongoose.connect(dbConfig.db).then(() => {
        console.log('Database sucessfully connected')
    },
    error => {
        console.log('Database could not be connected: ' + error)
    }
)

// receive message from master process
process.on('message', async(message) => {
    const res = await mergeWithMaster(message.data);

    // send response to master process
    process.send({ res });
});

async function mergeWithMaster(editDoc) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getMasterWorkspaceData(editDoc));
        }, 1000);
    });
}

async function getMasterWorkspaceData(editDoc) {
    await workspace.findOne({ w_name: editDoc.w_name, w_version: 'Master' }).then(data => {
        if (data) {
            getMasterDocument(editDoc, data);
        }
    }).catch(err => {

    });
}

async function getMasterDocument(editDoc, masterWorkspace) {
    await Document.findOne({ workspaceId: masterWorkspace._id, documentName: editDoc.documentName }).then(data => {
        if (data) {
            const merged = htmldiff(data.documentHtml, editDoc.documentHtml);
            saveMergeVersion(editDoc, data, merged)
        }
    }).catch(err => {

    });
}

async function saveMergeVersion(editDoc, masterDoc, merged) {
    const req = {
        document_name: editDoc.documentName,
        document_html: merged,
        document_id: editDoc._id,
        master_document_id: masterDoc._id,
        workspace_id: editDoc.workspaceId,
        master_workspace_id: masterDoc.workspaceId
    }
    await Merge.updateOne({ document_id: editDoc._id }, req, { upsert: true }).then(data => {
        setCompleteMergeStatus(editDoc._id);
    }).catch(err => {

    });
}

async function setCompleteMergeStatus(docuemnt_id) {
    await Document.findOneAndUpdate({ _id: docuemnt_id }, { merge_status: 'Completed' }).then(data => {

    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });

}