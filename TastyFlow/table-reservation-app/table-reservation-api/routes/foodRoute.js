const express = require('express');
const { addFood, listfood, removeFood } = require('../controllers/foodController');
const multer = require('multer');

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

foodRouter.post("/admin/add", upload.single("image"), addFood);
foodRouter.get("/list", listfood);
foodRouter.post("/admin/remove", removeFood);

module.exports = foodRouter;
