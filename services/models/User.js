const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
let userSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  fname: {
    type: String,
  },
  lname: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  mobileno: {
    type: String,
  },
  ctname: {
    type: String,
  },
  status: {
    type: String,
  },
}, {
  collection: 'users'
})

module.exports = mongoose.model('User', userSchema)
