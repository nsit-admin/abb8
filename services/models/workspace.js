const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
let workspaceSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    w_name: {
        type: String,
    },
    w_version: {
        type: String
    },
    w_desc: {
        type: String,
    },
    w_owner: {
        type: String,
    },
    owner_name: {
        type: String,
    },
    w_tags: {
        type: Array,
    },
    w_contribtors: {
        type: Array,
    },
    w_documents: {
        type: Array,
    },
    w_version: {
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
    },
    status: {
        type: String,
    },
    w_master_id: {
        type: String,
    },
    w_merge_status: {
      type: String,
    },
}, {
    collection: 'workspaces'
})

module.exports = mongoose.model('workspaces', workspaceSchema)