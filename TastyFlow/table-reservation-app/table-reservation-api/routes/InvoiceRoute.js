const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const Slot1 = require("../models/Slot1"); // Import Slot1 model
const Slot2 = require("../models/Slot2"); // Import Slot2 model
const Slot3 = require("../models/Slot3"); // Import Slot3 model

// Create an invoice
router.post("/create", async (req, res) => {
  try {
    const { userId, foods, totalAmount, cgst, sgst, roundOff, reservationId } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the payment corresponding to the current reservation
    const payment = user.payments.find(
      (p) =>
        p.reservationId.toString() === reservationId &&
        p.status === "succeeded" &&
        !p.deducted // Only deduct if not already deducted
    );

    let finalTotalAmount = totalAmount;
    let reservedTableInfo = null;

    if (payment && totalAmount >= 100) {
      finalTotalAmount -= 100; // Deduct ₹100 if payment is succeeded and totalAmount >= 100
      payment.deducted = true; // Mark the payment as deducted
      await user.save(); // Save the updated user document

      // Dynamically find the reserved slot information from Slot1, Slot2, or Slot3
      const slot1 = await Slot1.findOne({ _id: reservationId });
      const slot2 = await Slot2.findOne({ _id: reservationId });
      const slot3 = await Slot3.findOne({ _id: reservationId });

      const reservedSlot = slot1 || slot2 || slot3; // Use the first found slot
      if (reservedSlot) {
        reservedTableInfo = {
          tableNumber: reservedSlot.number,
          slotTime: getSlotTime(reservedSlot.alwaysOne),
        };
      }
    }

    // Get the last invoice number and increment it
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

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
      totalAmount: finalTotalAmount,
      invoiceNumber,
      cgst,
      sgst,
      roundOff,
      reservedTableInfo, // Include reserved table information
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

// Helper function to get slot time
const getSlotTime = (slotNumber) => {
  if (slotNumber === 1) {
    return '5:00 PM to 7:00 PM';
  } else if (slotNumber === 2) {
    return '7:00 PM to 9:00 PM';
  } else if (slotNumber === 3) {
    return '9:00 PM to 11:00 PM';
  }
  return 'Unknown time range';
};

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

// Backend logic to fetch user data
router.get("/admin/getuser/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("payments");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add tableNumber and slotTime to each payment
    const paymentsWithTableInfo = await Promise.all(
      user.payments.map(async (payment) => {
        // Dynamically find the reserved slot information from Slot1, Slot2, or Slot3
        const slot1 = await Slot1.findOne({ _id: payment.reservationId });
        const slot2 = await Slot2.findOne({ _id: payment.reservationId });
        const slot3 = await Slot3.findOne({ _id: payment.reservationId });

        const reservedSlot = slot1 || slot2 || slot3; // Use the first found slot
        return {
          ...payment.toObject(),
          tableNumber: reservedSlot ? reservedSlot.number : null,
          slotTime: reservedSlot ? getSlotTime(reservedSlot.alwaysOne) : null,
        };
      })
    );

    res.json({ ...user.toObject(), payments: paymentsWithTableInfo });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;