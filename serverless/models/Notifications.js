const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
let notificationSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    n_sender: {
        type: String,
    },
    n_desc: {
        type: String
    },
    n_receiver: {
        type: Array,
    },
    n_type: {
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
    collection: 'notifications'
})

module.exports = mongoose.model('notifications', notificationSchema)
