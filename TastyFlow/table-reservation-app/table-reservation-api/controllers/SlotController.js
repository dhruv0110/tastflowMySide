const Slot = require('../models/Slot');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_51PM6qtRwUTaEqzUvt4NK6m6IIecqXl8tkrlrxEiZ7cu2GVfpyteslhlryQALGUJEYjTNz3jdMaTbJ7VrxBIGles300dRauynNO');

const getSlotTime = (slotNumber) => {
  const slotTimes = {
    1: '5:00 PM to 7:00 PM',
    2: '7:00 PM to 9:00 PM',
    3: '9:00 PM to 11:00 PM'
  };
  return slotTimes[slotNumber] || 'Unknown time range';
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tastyflow01@gmail.com',
    pass: 'npgughkbjtivvxrc',
  },
});

// Get all slots for a specific slot number
const getAllSlots = async (req, res) => {
  try {
    const slotNumber = parseInt(req.params.slotNumber);
    const slots = await Slot.find({ slotNumber }).populate({
      path: 'reservedBy',
      select: 'name contact email'
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reserveSlot = async (req, res) => {
  try {
    const { number, paymentIntentId } = req.body;
    const userId = req.user.id;
    const slotNumber = parseInt(req.params.slotNumber);
    
    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.reserved) return res.status(400).json({ message: "Slot is already reserved" });
    if (slot.disabled) return res.status(400).json({ message: "Slot is currently disabled" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    slot.reserved = true;
    slot.reservedBy = userId;
    await slot.save();

    const paymentData = {
      paymentIntentId,
      amount: 100,
      currency: "inr",
      status: "succeeded",
      tableNumber: number,
      slotTime: getSlotTime(slotNumber),
      reservationId: slot._id,
      deducted: false
    };

    user.payments.push(paymentData);
    await user.save();

    // Send email
    const mailOptions = {
      from: "tastyflow01@gmail.com",
      to: user.email,
      subject: "Slot Reservation Confirmation",
      text: `Your reservation for Table ${slot.number} (${getSlotTime(slotNumber)}) has been confirmed. Thank you!`,
    };
    transporter.sendMail(mailOptions);

    const populatedSlot = await Slot.findById(slot._id).populate({
      path: 'reservedBy',
      select: 'name contact'
    });

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: 'reserved', 
      slotNumber, 
      tableNumber: number,
      reservedBy: {
        _id: user._id,
        name: user.name,
        contact: user.contact
      },
      slot: populatedSlot
    });

    // Emit new reservation to user's room
    io.to(`user_${userId}`).emit('newReservation', {
      reservation: {
        reservationId: slot._id,
        tableNumber: number,
        slotTime: getSlotTime(slotNumber)
      }
    });

    res.status(200).json({ 
      message: "Slot reserved successfully", 
      slot: populatedSlot 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unreserveSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const slotNumber = parseInt(req.params.slotNumber);
    
    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (userRole !== "admin" && (!slot.reserved || String(slot.reservedBy) !== String(userId))) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const reservedByUser = await User.findById(slot.reservedBy);
    if (reservedByUser) {
      // Update the payment record to mark as deducted
      reservedByUser.payments = reservedByUser.payments.map(payment => {
        if (String(payment.reservationId) === String(slot._id)) {
          return { ...payment, deducted: true };
        }
        return payment;
      });
      await reservedByUser.save();
    }

    slot.reserved = false;
    slot.reservedBy = null;
    await slot.save();

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: 'unreserved', 
      slotNumber, 
      tableNumber: number,
      slot: slot
    });

    // Emit event to update reservations dropdown
    io.to(`user_${userId}`).emit('reservationRemoved', {
      reservationId: slot._id
    });

    res.status(200).json({ message: "Slot unreserved successfully", slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminUnreserveSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const userRole = req.user.role;
    const slotNumber = parseInt(req.params.slotNumber);

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const reservedByUser = await User.findById(slot.reservedBy);
    if (reservedByUser) {
      // Update the payment record to mark as deducted
      reservedByUser.payments = reservedByUser.payments.map(payment => {
        if (String(payment.reservationId) === String(slot._id)) {
          return { ...payment, deducted: true };
        }
        return payment;
      });
      await reservedByUser.save();
    }

    slot.reserved = false;
    slot.reservedBy = null;
    await slot.save();

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: 'adminUnreserved', 
      slotNumber, 
      tableNumber: number,
      slot: slot
    });

    // Emit event to update reservations dropdown
    if (reservedByUser) {
      io.to(`user_${reservedByUser._id}`).emit('reservationRemoved', {
        reservationId: slot._id
      });
    }

    res.status(200).json({ message: 'Slot unreserved by admin successfully', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSlot = async (req, res) => {
  try {
    const { number, capacity } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);
    
    const newSlot = new Slot({ 
      slotNumber,
      number, 
      capacity 
    });
    
    await newSlot.save();

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('tableAdded', {
      slotNumber,
      table: newSlot
    });

    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);
    const slot = await Slot.findOneAndDelete({ slotNumber, number });

    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('tableDeleted', {
      slotNumber,
      tableNumber: number
    });

    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleTableStatus = async (req, res) => {
  try {
    const { number } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can toggle table status' });
    }

    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.disabled = !slot.disabled;
    await slot.save();

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: slot.disabled ? 'tableDisabled' : 'tableEnabled',
      slotNumber,
      tableNumber: number,
      slot: slot
    });

    // Emit to foodUpdates room for user interface
    io.to('foodUpdates').emit('tableStatusChanged', {
      slotNumber,
      tableNumber: number,
      disabled: slot.disabled
    });

    res.status(200).json({ 
      message: `Table ${slot.disabled ? 'disabled' : 'enabled'} successfully`,
      slot
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSlots,
  reserveSlot,
  unreserveSlot,
  adminUnreserveSlot,
  addSlot,
  deleteSlot,
  createPaymentIntent,
  toggleTableStatus
};