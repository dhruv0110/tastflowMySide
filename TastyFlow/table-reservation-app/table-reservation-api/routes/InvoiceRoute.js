// routes/invoice.js

const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const User = require("../models/User");

// Create an invoice
router.post("/create", async (req, res) => {
  try {
    const { userId, foods, totalAmount, cgst, sgst, roundOff } = req.body;


    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the last invoice number and increment it
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 }); // Find the latest invoice
    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1; // Increment the last invoice number or start at 1

    // Prepare invoice data
    const invoice = new Invoice({
      userId,
      foods: foods.map((food) => ({
        foodId: food.foodId,
        name: food.name,
        price: food.price,
        quantity: food.quantity,
        total: food.quantity * food.price,
      })),
      totalAmount,
      invoiceNumber, // Set the generated invoice number
      cgst,
      sgst,
      roundOff
    });

    // Save the invoice to the database
    await invoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all invoices
router.get("/admin/all-invoice", async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("userId") // Populate the user details
      .populate("foods.foodId"); // Populate food details

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Get an invoice by ID
router.get("/admin/:invoiceId", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate("userId") // Populate the user details
      .populate("foods.foodId"); // Populate food details

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Edit an invoice by ID
router.put("/admin/update/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { totalAmount, cgst, sgst, roundOffAmount, foods } = req.body;

    // Check if any food item is missing foodId
    const hasInvalidFood = foods.some(food => !food.foodId);
    if (hasInvalidFood) {
      return res.status(400).json({ message: "FoodId is missing for some food items" });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Update invoice fields
    invoice.totalAmount = totalAmount;
    invoice.cgst = cgst;
    invoice.sgst = sgst;
    invoice.roundOff = roundOffAmount;
    invoice.foods = foods; // Assign the validated foods array

    await invoice.save();

    res.status(200).json({ message: "Invoice updated successfully", invoice });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all invoices by userId
router.get("/admin/invoices/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find invoices by userId
    const invoices = await Invoice.find({ userId })
      .populate("userId") // Populate the user details
      .populate("foods.foodId"); // Populate food details

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found for this user" });
    }

    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices by userId:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





module.exports = router;
