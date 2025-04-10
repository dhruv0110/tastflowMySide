const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  number: {
    type: Number,
    required: true,
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
  reserveDate: { 
    type: Date, 
    default: Date.now 
  },
  disabled: {
    type: Boolean,
    default: false,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['slotNumber', 'number']
    }
  ]
});

module.exports = mongoose.model('Slot', slotSchema);