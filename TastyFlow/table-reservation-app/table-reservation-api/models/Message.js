const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReplySchema = new Schema({
  content: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  emailSent: { type: Boolean, default: true }
});

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
  replies: [ReplySchema],  // Array of replies
  status: { 
    type: String, 
    enum: ['pending', 'replied', 'closed'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Message', MessageSchema);