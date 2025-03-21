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
  // New fields for ingredients, preparation steps, nutritional info, reviews, and similar dishes
  ingredients: { type: [String], default: [] }, // Array of ingredients
  preparationSteps: { type: [String], default: [] }, // Array of preparation steps
  nutritionalInfo: {
    // Object for nutritional information
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
  },
  similarDishes: [
    {
      // Array of similar dishes
      name: { type: String, required: true },
      image: { type: String, required: true },
      category: { type: String, required: true },
    },
  ],
});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;