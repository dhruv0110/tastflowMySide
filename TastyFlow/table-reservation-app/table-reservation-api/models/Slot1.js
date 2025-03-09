const mongoose = require('mongoose');

const slot1Schema = new mongoose.Schema({
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
  alwaysOne: {
    type: Number,
    default: 1,
    immutable: true,
  },
});


module.exports = mongoose.model('Slot1', slot1Schema);
