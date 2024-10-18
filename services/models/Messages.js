var mongoose = require('mongoose');

var messageSchema = mongoose.Schema( {
    Name: {
        type: String,
    },
    email: {
        type: String,
    },
    message: {
        type: String,
    },
    w_name: {
        type: String,
    },
    doc_name:{
        type: String,
    },
    date: {
        type: String,
    }, 
    time: {
        type: String
    }
});

const messages = mongoose.model('messages', messageSchema);

module.exports = messages;
