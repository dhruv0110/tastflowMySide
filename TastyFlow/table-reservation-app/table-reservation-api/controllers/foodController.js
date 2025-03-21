const Food = require('../models/FoodModel'); // Ensure this is the correct path
const fs = require('fs');

// Add food item
const addFood = async (req, res) => {
    let image_filename = `${req.file.filename}`;

    // Parse JSON strings from the request body
    const ingredients = JSON.parse(req.body.ingredients);
    const preparationSteps = JSON.parse(req.body.preparationSteps);
    const nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
    const reviews = JSON.parse(req.body.reviews);
    const similarDishes = JSON.parse(req.body.similarDishes);

    // Create a new food item
    const food = new Food({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename,
        ingredients: ingredients,
        preparationSteps: preparationSteps,
        nutritionalInfo: nutritionalInfo,
        reviews: reviews,
        similarDishes: similarDishes,
    });

    try {
        await food.save(); // Save the food item to the database
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// All food list
const listfood = async (req, res) => {
    try {
        const foods = await Food.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Remove food item
const removeFood = async (req, res) => {
    try {
        const food = await Food.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => {});

        await Food.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getFoodById = async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);
      if (!food) {
        return res.status(404).json({ success: false, message: "Food not found" });
      }
      res.json({ success: true, data: food });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error fetching food" });
    }
  };


module.exports = { addFood, listfood, removeFood, getFoodById };

