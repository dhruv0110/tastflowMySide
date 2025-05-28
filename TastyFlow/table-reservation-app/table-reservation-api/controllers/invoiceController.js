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
    // console.log("Request body:", req.body);

    const { userId, foods, totalAmount, cgst, sgst, roundOff, reservationId } = req.body;

    if (!userId || !foods || !totalAmount) {
      // console.log("Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      // console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    let finalTotalAmount = totalAmount;
    let reservedTableInfo = null;
    let slotToUnreserve = null;

    if (reservationId) {
      // console.log("Reservation ID found:", reservationId);

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
            // console.log("Slot found in database:", slotToUnreserve);

            slotToUnreserve.reserved = false;
            slotToUnreserve.reservedBy = null;
            await slotToUnreserve.save();
          }
        }
      }
    }

    // Calculate subtotal from food items
    const subtotal = foods.reduce((sum, food) => sum + (food.price * food.quantity), 0);

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
      cgst: cgst || 0,
      sgst: sgst || 0,
      subtotal,
      roundOff: roundOff || 0,
      status: 'unpaid', // Default status
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
      .populate("foods.foodId", "name price")
      .sort({ invoiceDate: -1 });

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
      .populate("foods.foodId", "name price")
      .populate("payments.receivedBy", "name");

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

    // First find the invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Check if invoice is cancelled
    if (invoice.status === 'cancelled') {
      return res.status(400).json({ 
        message: "Cannot edit a cancelled invoice",
        currentStatus: invoice.status
      });
    }

    // Validate required fields
    if (!subtotal || !foods) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate food items
    const hasInvalidFood = foods.some((food) => !food.foodId);
    if (hasInvalidFood) {
      return res.status(400).json({ message: "FoodId is missing for some food items" });
    }

    // Calculate current total paid amount
    const currentTotalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Store previous final amount for comparison
    const previousFinalAmount = invoice.finalAmount || invoice.totalAmount;
    
    // Update invoice fields
    invoice.totalAmount = subtotal;
    invoice.cgst = cgst || 0;
    invoice.sgst = sgst || 0;
    invoice.roundOff = roundOff || 0;
    invoice.discount = discount || 0;
    invoice.foods = foods;
    invoice.finalAmount = finalAmount;

    // Determine new status based on payments and new amount
    if (currentTotalPaid > 0) {
      if (finalAmount > currentTotalPaid) {
        invoice.status = 'partially_paid';
      } else if (finalAmount <= currentTotalPaid) {
        invoice.status = 'paid';
      }
    } else {
      invoice.status = 'unpaid';
    }

    // Save the updated invoice
    await invoice.save();

    res.status(200).json({ 
      message: "Invoice updated successfully",
      invoice,
      changes: {
        amountChanged: finalAmount !== previousFinalAmount,
        newStatus: invoice.status,
        amountDue: Math.max(0, finalAmount - currentTotalPaid)
      }
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ 
      message: "Failed to update invoice",
      error: error.message 
    });
  }
};

// Get all invoices by userId
const getInvoicesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const invoices = await Invoice.find({ userId })
      .populate("userId", "name email")
      .populate("foods.foodId", "name price")
      .sort({ invoiceDate: -1 });

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

// Update invoice status - improved version
const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    if (!['unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status value",
        validStatuses: ['unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled']
      });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (invoice.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ 
        message: "Cannot change status from cancelled",
        currentStatus: invoice.status
      });
    }

    invoice.status = status;
    await invoice.save();

    res.status(200).json({ 
      message: "Invoice status updated successfully",
      invoice 
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({ 
      message: "Failed to update invoice status",
      error: error.message 
    });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    let { amount, paymentMethod, reference, receivedBy } = req.body;

    // Validate input
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Valid payment amount is required" });
    }
    
    amount = parseFloat(amount);
    if (amount <= 0) {
      return res.status(400).json({ message: "Payment amount must be positive" });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Check if invoice is cancellable
    if (invoice.status === 'cancelled') {
      return res.status(400).json({ 
        message: "Cannot record payment for cancelled invoice",
        currentStatus: invoice.status
      });
    }

    // Record payment
    invoice.payments.push({
      amount,
      paymentMethod,
      reference: reference || '',
      receivedBy,
      paymentDate: new Date()
    });

    // Calculate new status
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceAmount = invoice.finalAmount || invoice.totalAmount || 0;

    if (totalPaid >= invoiceAmount) {
      invoice.status = 'paid';
    } else if (totalPaid > 0) {
      invoice.status = 'partially_paid';
    } else {
      invoice.status = 'unpaid';
    }

    await invoice.save();

    res.status(200).json({ 
      message: "Payment recorded successfully",
      invoice,
      paymentSummary: {
        totalPaid,
        amountDue: Math.max(0, invoiceAmount - totalPaid),
        newStatus: invoice.status
      }
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ 
      message: "Failed to record payment",
      error: error.message 
    });
  }
};


// Get invoices by status
const getInvoicesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const invoices = await Invoice.find({ status })
      .populate("userId", "name email")
      .populate("foods.foodId", "name price")
      .sort({ invoiceDate: -1 });

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices by status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get overdue invoices
const getOverdueInvoices = async (req, res) => {
  try {
    const today = new Date();
    const invoices = await Invoice.find({
      status: { $in: ['unpaid', 'partially_paid'] },
      dueDate: { $lt: today }
    })
    .populate("userId", "name email")
    .sort({ dueDate: 1 });

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching overdue invoices:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const cancelInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { cancellationReason, userId } = req.body; // Get userId from request body

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({ 
        message: "Invoice is already cancelled",
        currentStatus: invoice.status
      });
    }

    const invoiceAgeDays = (new Date() - invoice.invoiceDate) / (1000 * 60 * 60 * 24);
    if (invoiceAgeDays > 30) {
      return res.status(400).json({ 
        message: "Cannot cancel invoices older than 30 days",
        invoiceAgeDays: Math.floor(invoiceAgeDays)
      });
    }

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const requiresRefund = totalPaid > 0;

    invoice.status = 'cancelled';
    invoice.cancellationDate = new Date();
    invoice.cancellationReason = cancellationReason || 'Cancelled by admin';
    invoice.cancelledBy = userId || req.user?._id; // Use either from body or auth
    
    await invoice.save();

    res.status(200).json({ 
      message: "Invoice cancelled successfully",
      invoice,
      requiresRefund,
      refundAmount: totalPaid
    });
  } catch (error) {
    console.error("Error cancelling invoice:", error);
    res.status(500).json({ 
      message: "Failed to cancel invoice",
      error: error.message 
    });
  }
};

module.exports = {
   createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  getInvoicesByUser,
  getUserWithPayments,
  updateInvoiceStatus,
  recordPayment,
  getInvoicesByStatus,
  getOverdueInvoices,
  cancelInvoice
};