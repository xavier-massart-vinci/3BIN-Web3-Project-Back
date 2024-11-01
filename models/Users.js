const mongoose = require('mongoose');
const connect = require('../utils/mongo');

connect();

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends: { type: [String], default: [] }
});

module.exports = mongoose.model('User', userSchema);
