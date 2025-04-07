const Slot1 = require('../models/Slot1');
const Slot2 = require('../models/Slot2');
const Slot3 = require('../models/Slot3');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_51PM6qtRwUTaEqzUvt4NK6m6IIecqXl8tkrlrxEiZ7cu2GVfpyteslhlryQALGUJEYjTNz3jdMaTbJ7VrxBIGles300dRauynNO');

const getSlotTime = (slotNumber) => {
  if (slotNumber === 1) return '5:00 PM to 7:00 PM';
  if (slotNumber === 2) return '7:00 PM to 9:00 PM';
  if (slotNumber === 3) return '9:00 PM to 11:00 PM';
  return 'Unknown time range';
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tastyflow01@gmail.com',
    pass: 'npgughkbjtivvxrc',
  },
});

const getSlotModel = (slotNumber) => {
  if (slotNumber === 1) return Slot1;
  if (slotNumber === 2) return Slot2;
  if (slotNumber === 3) return Slot3;
  throw new Error('Invalid slot number');
};

// Get all slots with populated user data
const getAllSlots = async (req, res) => {
  try {
    const slotNumber = parseInt(req.params.slotNumber);
    const Slot = getSlotModel(slotNumber);
    const slots = await Slot.find().populate({
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
    const Slot = getSlotModel(slotNumber);
    
    const slot = await Slot.findOne({ number });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.reserved) return res.status(400).json({ message: "Slot is already reserved" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    slot.reserved = true;
    slot.reservedBy = userId;
    await slot.save();

    user.payments.push({
      paymentIntentId,
      amount: 100,
      currency: "inr",
      status: "succeeded",
      tableNumber: number,
      slotTime: getSlotTime(slotNumber),
      reservationId: slot._id,
    });
    await user.save();

    // Send email
    const mailOptions = {
      from: "tastyflow01@gmail.com",
      to: user.email,
      subject: "Slot Reservation Confirmation",
      text: `Your reservation for Table ${slot.number} (${getSlotTime(slotNumber)}) has been confirmed. Thank you!`,
    };
    transporter.sendMail(mailOptions);

    // Get populated slot for response and socket emission
    const populatedSlot = await Slot.findById(slot._id).populate({
      path: 'reservedBy',
      select: 'name contact'
    });

    // Emit socket event
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
    const Slot = getSlotModel(slotNumber);
    const slot = await Slot.findOne({ number });

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (userRole !== "admin" && (!slot.reserved || String(slot.reservedBy) !== String(userId))) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const reservedByUser = await User.findById(slot.reservedBy);
    if (reservedByUser) {
      reservedByUser.payments = reservedByUser.payments.filter(
        payment => String(payment.reservationId) !== String(slot._id)
      );
      await reservedByUser.save();
    }

    slot.reserved = false;
    slot.reservedBy = null;
    await slot.save();

    // Send email
    if (reservedByUser) {
      const mailOptions = {
        from: "tastyflow01@gmail.com",
        to: reservedByUser.email,
        subject: "Slot Unreserved",
        text: `Your reservation for Table ${slot.number} (${getSlotTime(slotNumber)}) has been canceled.`,
      };
      transporter.sendMail(mailOptions);
    }

    // Emit socket event
    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: 'unreserved', 
      slotNumber, 
      tableNumber: number 
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
    const Slot = getSlotModel(slotNumber);

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const slot = await Slot.findOne({ number });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const reservedByUser = await User.findById(slot.reservedBy);
    slot.reserved = false;
    slot.reservedBy = null;
    await slot.save();

    // Send email
    if (reservedByUser) {
      const mailOptions = {
        from: 'tastyflow01@gmail.com',
        to: reservedByUser.email,
        subject: 'Slot Unreserved by Admin',
        text: `Your reservation for Table ${slot.number} (${getSlotTime(slotNumber)}) has been canceled by admin.`,
      };
      transporter.sendMail(mailOptions);
    }

    // Emit socket event
    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: 'adminUnreserved', 
      slotNumber, 
      tableNumber: number 
    });

    res.status(200).json({ message: 'Slot unreserved by admin successfully', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSlot = async (req, res) => {
  const { number, capacity } = req.body;
  try {
    const Slot = getSlotModel(parseInt(req.params.slotNumber));
    const newSlot = new Slot({ number, capacity });
    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);
    const Slot = getSlotModel(slotNumber);
    const slot = await Slot.findOneAndDelete({ number });

    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    res.json({ message: 'Slot deleted' });
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
};