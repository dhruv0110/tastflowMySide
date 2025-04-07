const Food = require('../models/FoodModel');
const fs = require('fs');

const addFood = async (req, res) => {
    let image_filename = `${req.file.filename}`;

    const ingredients = JSON.parse(req.body.ingredients);
    const preparationSteps = JSON.parse(req.body.preparationSteps);
    const nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
    const reviews = JSON.parse(req.body.reviews);
    const similarDishes = JSON.parse(req.body.similarDishes);

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
        await food.save();
        
        const io = req.app.get('io');
        io.to('foodUpdates').emit('foodAdded', food);
        
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const listfood = async (req, res) => {
    try {
        const foods = await Food.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const removeFood = async (req, res) => {
    try {
        const food = await Food.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => {});

        await Food.findByIdAndDelete(req.body.id);
        
        const io = req.app.get('io');
        io.to('foodUpdates').emit('foodRemoved', req.body.id);
        
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