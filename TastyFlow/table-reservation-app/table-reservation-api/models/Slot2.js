const mongoose = require('mongoose');

const slot2Schema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: false
  },
  capacity: {
    type: Number,
    required: true,
  },
  reserved: {
    type: Boolean,
    default: false,
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reservationExpiry: {
    type: Date,
    default: null,
  },
  alwaysTwo: {
    type: Number,
    default: 2,
    immutable: true,
  },
});


module.exports = mongoose.model('Slot2', slot2Schema);
