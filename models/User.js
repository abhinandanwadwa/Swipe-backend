const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pfpuri: {
        type: String,
        required: false,
        default: "https://avatars.dicebear.com/api/bottts/.svg"
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});




module.exports = mongoose.model('user', UserSchema);