const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
let documentAnalyticsSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    documentName: {
        type: String,
    },
    document_id: {
        type: String,
    },
    workspaceId: {
        type: String,
    },
    created_dt: {
        type: String,
    },
    modified_dt: {
        type: String,
    },
    document_action_status: {
        type: String,
    },
    w_name: {
        type: String,
    },
}, {
    collection: 'documentAnalytics'
})

module.exports = mongoose.model('DocumentAnalytics', documentAnalyticsSchema)