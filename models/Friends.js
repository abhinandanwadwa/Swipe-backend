const mongoose = require('mongoose');
const { Schema } = mongoose;

const FriendsSchema = new Schema({
    whoSent: {
        type: String,
        required: true
    },
    toWhom: {
        type: String,
        required: true
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});




module.exports = mongoose.model('friends', FriendsSchema);