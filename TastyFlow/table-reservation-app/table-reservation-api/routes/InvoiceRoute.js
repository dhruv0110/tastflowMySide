const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const Slot1 = require("../models/Slot1");
const Slot2 = require("../models/Slot2");
const Slot3 = require("../models/Slot3");

// Helper function to get slot time
const getSlotTime = (slotNumber) => {
  const slotTimes = {
    1: "5:00 PM to 7:00 PM",
    2: "7:00 PM to 9:00 PM",
    3: "9:00 PM to 11:00 PM",
  };
  return slotTimes[slotNumber] || "Unknown time range";
};
const getSlotModel = (slotNumber) => {
  if (slotNumber === 1) {
    return Slot1;
  } else if (slotNumber === 2) {
    return Slot2;
  } else if (slotNumber === 3) {
    return Slot3;
  }
  throw new Error("Invalid slot number");
};

// Helper function to find the correct reserved slot
const findReservedSlot = async (reservationId) => {
  const slot1 = await Slot1.findOne({ _id: reservationId });
  const slot2 = await Slot2.findOne({ _id: reservationId });
  const slot3 = await Slot3.findOne({ _id: reservationId });

  if (slot1) return { slotNumber: 1, tableNumber: slot1.number, date:slot1.reserveDate };
  if (slot2) return { slotNumber: 2, tableNumber: slot2.number, date:slot2.reserveDate };
  if (slot3) return { slotNumber: 3, tableNumber: slot3.number, date:slot3.reserveDate };

  return null;
};

// Create an invoice
router.post("/create", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debugging

    const { userId, foods, totalAmount, cgst, sgst, roundOff, reservationId } = req.body;

    if (!userId || !foods || !totalAmount) {
      console.log("Missing required fields"); // Debugging
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found"); // Debugging
      return res.status(404).json({ message: "User not found" });
    }

    let finalTotalAmount = totalAmount;
    let reservedTableInfo = null;

    if (reservationId) {
      console.log("Reservation ID found:", reservationId); // Debugging

      const payment = user.payments.find(
        (p) =>
          p.reservationId.toString() === reservationId &&
          p.status === "succeeded" &&
          !p.deducted
      );

      if (payment && totalAmount >= 100) {
        finalTotalAmount -= 100;
        payment.deducted = true;
        await user.save();

        const reservedSlot = await findReservedSlot(reservationId);
        if (reservedSlot) {
          reservedTableInfo = {
            tableNumber: reservedSlot.tableNumber,
            slotTime: getSlotTime(reservedSlot.slotNumber),
            date: reservedSlot.date,
          };

          // Unreserve the table after invoice creation
          const Slot = getSlotModel(reservedSlot.slotNumber);
          const slot = await Slot.findOne({ number: reservedSlot.tableNumber });

          if (slot) {
            console.log("Slot found in database:", slot); // Debugging

            slot.reserved = false;
            slot.reservedBy = null;
            await slot.save();
          }
        }
      }
    }

    // Generate invoice number
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

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
      reservedTableInfo,
    });

    await invoice.save();

    console.log("Invoice created successfully:", invoice); // Debugging

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error); // Debugging
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all invoices
router.get("/admin/all-invoice", async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("userId", "name email")
      .populate("foods.foodId", "name price");

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
      .populate("userId", "name email contact")
      .populate("foods.foodId", "name price");

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
    const { totalAmount, cgst, sgst, roundOff, discount, foods } = req.body;

    if (!totalAmount || !foods) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hasInvalidFood = foods.some((food) => !food.foodId);
    if (hasInvalidFood) {
      return res.status(400).json({ message: "FoodId is missing for some food items" });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.totalAmount = totalAmount;
    invoice.cgst = cgst;
    invoice.sgst = sgst;
    invoice.roundOff = roundOff;
    invoice.discount = discount || 0;
    invoice.foods = foods;

    await invoice.save();

    res.status(200).json({ message: "Invoice updated successfully", invoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all invoices by userId
router.get("/admin/invoices/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const invoices = await Invoice.find({ userId })
      .populate("userId", "name email")
      .populate("foods.foodId", "name price");

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found for this user" });
    }

    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices by userId:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get user data with payment details
router.get("/admin/getuser/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("payments");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const paymentsWithTableInfo = await Promise.all(
      user.payments.map(async (payment) => {
        const reservedSlot = await findReservedSlot(payment.reservationId);
        return {
          ...payment.toObject(),
          tableNumber: reservedSlot ? reservedSlot.tableNumber : null,
          slotTime: reservedSlot ? getSlotTime(reservedSlot.slotNumber) : null,
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
