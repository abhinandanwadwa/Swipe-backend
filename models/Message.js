const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    sentBy: {
        type: String,
        required: true
    },
    sentTo: {
        type: String,
        required: true
    },
    msgcontent: {
        type: String,
        required: true
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});




module.exports = mongoose.model('message', MessageSchema);