const Invoice = require("../models/Invoice");
const User = require("../models/User");
const Slot = require("../models/Slot");

// Helper function to get slot time
const getSlotTime = (slotNumber) => {
  const slotTimes = {
    1: "5:00 PM to 7:00 PM",
    2: "7:00 PM to 9:00 PM",
    3: "9:00 PM to 11:00 PM",
  };
  return slotTimes[slotNumber] || "Unknown time range";
};

// Helper function to find the reserved slot
const findReservedSlot = async (reservationId) => {
  const slot = await Slot.findById(reservationId);
  if (!slot) return null;
  
  return {
    slotNumber: slot.slotNumber,
    tableNumber: slot.number,
    date: slot.reserveDate
  };
};

// Create an invoice
const createInvoice = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { userId, foods, totalAmount, cgst, sgst, roundOff, reservationId } = req.body;

    if (!userId || !foods || !totalAmount) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    let finalTotalAmount = totalAmount;
    let reservedTableInfo = null; // Initialize as null
    let slotToUnreserve = null;

    if (reservationId) {
      console.log("Reservation ID found:", reservationId);

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

          // Find and unreserve the slot
          slotToUnreserve = await Slot.findOne({ 
            slotNumber: reservedSlot.slotNumber,
            number: reservedSlot.tableNumber 
          });

          if (slotToUnreserve) {
            console.log("Slot found in database:", slotToUnreserve);

            slotToUnreserve.reserved = false;
            slotToUnreserve.reservedBy = null;
            await slotToUnreserve.save();
          }
        }
      }
    }

    // Generate invoice number
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    // Create invoice data object
    const invoiceData = {
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
      // Only include reservedTableInfo if it's not null
      ...(reservedTableInfo && { reservedTableInfo })
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    console.log("Invoice created successfully:", invoice);

    // Emit socket events after successful invoice creation
    if (slotToUnreserve) {
      const io = req.app.get('io');
      
      // Emit to slot room
      io.to(`slot_${slotToUnreserve.slotNumber}`).emit('slotUpdated', {
        action: 'unreserved',
        slotNumber: slotToUnreserve.slotNumber,
        tableNumber: slotToUnreserve.number,
        slot: slotToUnreserve
      });

      // Emit to user room to update reservations
      io.to(`user_${userId}`).emit('reservationRemoved', {
        reservationId: reservationId
      });
    }

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all invoices
const getAllInvoices = async (req, res) => {
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
};

// Get an invoice by ID
const getInvoiceById = async (req, res) => {
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
};

// Edit an invoice by ID
const updateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { subtotal, cgst, sgst, roundOff, discount, foods, finalAmount } = req.body;

    if (!subtotal || !foods) {
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

    invoice.totalAmount = subtotal;
    invoice.cgst = cgst;
    invoice.sgst = sgst;
    invoice.roundOff = roundOff;
    invoice.discount = discount || 0;
    invoice.foods = foods;
    invoice.finalAmount = finalAmount;

    await invoice.save();

    res.status(200).json({ message: "Invoice updated successfully", invoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all invoices by userId
const getInvoicesByUser = async (req, res) => {
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
};

// Get user data with payment details
const getUserWithPayments = async (req, res) => {
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
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  getInvoicesByUser,
  getUserWithPayments,
};
