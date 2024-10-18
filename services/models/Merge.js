const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
let mergeSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    document_name: {
        type: String,
    },
    document_html: {
        type: String,
    },
    document_id: {
        type: String,
    },
    master_document_id: {
        type: String,
    },
    workspace_id: {
        type: String,
    },
    master_workspace_id: {
        type: String,
    },
    status: {
        type: String,
    },
    document_status: {
        type: String,
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
    }
}, {
    collection: 'merges'
})

module.exports = mongoose.model('Merge', mergeSchema)