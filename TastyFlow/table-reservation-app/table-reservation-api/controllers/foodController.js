const Food = require('../models/FoodModel');
const fs = require('fs');

const addFood = async (req, res) => {
    try {
        // Validate required fields
        if (!req.file || !req.body.name || !req.body.description || !req.body.price || !req.body.mealType || !req.body.category) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        let image_filename = `${req.file.filename}`;

        // Parse JSON fields with error handling
        const ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
        const preparationSteps = req.body.preparationSteps ? JSON.parse(req.body.preparationSteps) : [];
        const nutritionalInfo = req.body.nutritionalInfo ? JSON.parse(req.body.nutritionalInfo) : {};
        const reviews = req.body.reviews ? JSON.parse(req.body.reviews) : [];
        const similarDishes = req.body.similarDishes ? JSON.parse(req.body.similarDishes) : [];

        const food = new Food({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            mealType: req.body.mealType,
            category: req.body.category,
            image: image_filename,
            ingredients,
            preparationSteps,
            nutritionalInfo,
            reviews,
            similarDishes,
        });

        await food.save();
        
        // Emit socket event for real-time updates
        const io = req.app.get('io');
        io.to('foodUpdates').emit('foodAdded', food);
        
        res.json({ success: true, message: "Food Added Successfully", data: food });
    } catch (error) {
        console.error("Error adding food:", error);
        
        // Delete uploaded file if error occurred
        if (req.file) {
            fs.unlink(`uploads/${req.file.filename}`, (err) => {
                if (err) console.error("Error deleting uploaded file:", err);
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error adding food item",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const listfood = async (req, res) => {
    try {
        // Optional filtering by mealType or category
        const { mealType, category } = req.query;
        const filter = {};
        
        if (mealType) filter.mealType = mealType;
        if (category) filter.category = category;

        const foods = await Food.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("Error listing food:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching food list",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const removeFood = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).json({ success: false, message: "Food ID is required" });
        }

        const food = await Food.findById(req.body.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        // Delete associated image
        fs.unlink(`uploads/${food.image}`, (err) => {
            if (err) console.error("Error deleting food image:", err);
        });

        await Food.findByIdAndDelete(req.body.id);
        
        // Emit socket event for real-time updates
        const io = req.app.get('io');
        io.to('foodUpdates').emit('foodRemoved', req.body.id);
        
        res.json({ success: true, message: "Food Removed Successfully" });
    } catch (error) {
        console.error("Error removing food:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error removing food item",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getFoodById = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ success: false, message: "Food ID is required" });
        }

        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        res.json({ success: true, data: food });
    } catch (error) {
        console.error("Error fetching food by ID:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching food details",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { addFood, listfood, removeFood, getFoodById };