const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatNotificationSchema = new Schema({
    whoSent: {
        type: String,
        required: true
    },
    toWhom: {
        type: String,
        required: true
    },
    isSeen: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});




module.exports = mongoose.model('chatnotifications', ChatNotificationSchema);