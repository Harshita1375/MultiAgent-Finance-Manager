const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['warning', 'danger', 'success', 'info'], 
        default: 'info' 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);