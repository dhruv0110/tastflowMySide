const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  password: {
    type: String,
    required: true
  },
  role: { 
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  otp: {
    type: String,
    required: false
  },
  otpExpiry: {
    type: String, // Change to Date type for accurate comparison
    required: false
  },
  contact: { 
    type: String,
    required: false
  },
  // Add the selectedFoods field to store food items the user has selected
  selectedFoods: [
    {
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: {
        type: Number
      },
      name: {
        type: String
      },
      date : {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
