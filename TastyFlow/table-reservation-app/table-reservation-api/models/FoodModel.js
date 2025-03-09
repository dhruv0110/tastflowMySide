const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  date: {
    type: Date,
    default: () => {
      // Create a new date object and adjust it to the local time zone
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust the time to local timezone
      return now;
    },
  },
});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
