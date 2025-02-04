const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
let documentSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    documentName: {
        type: String,
    },
    documentHtml: {
        type: String,
    },
    workspaceId: {
        type: String,
    },
    workspaceName: {
        type: String,
    },
    editCount: {
        type: Number,
    },
    created_by: {
        type: String,
    },
    created_dt: {
        type: String,
    },
    modified_by: {
        type: String,
    },
    modified_dt: {
        type: String,
    },
    merge_status: {
        type: String,
    },
}, {
    collection: 'documents'
})

module.exports = mongoose.model('Document', documentSchema)