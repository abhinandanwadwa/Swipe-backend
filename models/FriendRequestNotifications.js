const mongoose = require('mongoose');
const { Schema } = mongoose;

const FriendRequestNotificationsSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    isread: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});




module.exports = mongoose.model('frNotifications', FriendRequestNotificationsSchema);