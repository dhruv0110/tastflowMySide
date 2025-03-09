const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);
