const Slot1 = require('../models/Slot1');
const Slot2 = require('../models/Slot2');
const Slot3 = require('../models/Slot3');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_51PM6qtRwUTaEqzUvt4NK6m6IIecqXl8tkrlrxEiZ7cu2GVfpyteslhlryQALGUJEYjTNz3jdMaTbJ7VrxBIGles300dRauynNO'); // Replace with your Stripe Secret Key

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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tastyflow01@gmail.com',
    pass: 'npgughkbjtivvxrc', // Replace with your email password
  },
});

const getSlotModel = (slotNumber) => {
  if (slotNumber === 1) {
    return Slot1;
  } else if (slotNumber === 2) {
    return Slot2;
  } else if (slotNumber === 3) {
    return Slot3;
  }
  throw new Error('Invalid slot number');
};

// Get all slots
const getAllSlots = async (req, res) => {
  try {
    const slotNumber = parseInt(req.params.slotNumber); // Get the slot number from URL
    const Slot = getSlotModel(slotNumber); // Dynamically get Slot model
    const slots = await Slot.find().populate('reservedBy', 'name contact');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in rupees
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to paise
      currency: 'inr',
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reserve slot
const reserveSlot = async (req, res) => {
  try {
    const { number, paymentIntentId } = req.body;
    const userId = req.user.id;
    const slotNumber = parseInt(req.params.slotNumber);
    const Slot = getSlotModel(slotNumber);
    const slot = await Slot.findOne({ number });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.reserved) {
      return res.status(400).json({ message: "Slot is already reserved" });
    }

    // Reserve the slot
    slot.reserved = true;
    slot.reservedBy = userId;
    await slot.save();

    // Record the payment in the user's payments array
    const user = await User.findById(userId);
    if (user) {
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
    }

    // Send email confirmation to the user asynchronously
    const slotTime = getSlotTime(slotNumber);
    const mailOptions = {
      from: "tastyflow01@gmail.com",
      to: user.email,
      subject: "Slot Reservation Confirmation",
      text: `Your reservation for Table ${slot.number} has been confirmed. The slot is for ${slotTime}. Thank you for choosing our service!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // Respond to the client immediately
    res.status(200).json({ message: "Slot reserved successfully", slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unreserve slot
const unreserveSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const slotNumber = parseInt(req.params.slotNumber);
    const Slot = getSlotModel(slotNumber);
    const slot = await Slot.findOne({ number });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (userRole === "admin" || (slot.reserved && String(slot.reservedBy) === String(userId))) {
      const reservedByUser = await User.findById(slot.reservedBy);

      if (reservedByUser) {
        // Remove the payment associated with this reservation
        reservedByUser.payments = reservedByUser.payments.filter(
          (payment) => String(payment.reservationId) !== String(slot._id)
        );

        await reservedByUser.save();
      }

      // Unreserve the slot
      slot.reserved = false;
      slot.reservedBy = null;
      await slot.save();

      // Send email confirmation to the user asynchronously
      const slotTime = getSlotTime(slotNumber);
      const mailOptions = {
        from: "tastyflow01@gmail.com",
        to: reservedByUser.email,
        subject: "Slot Unreserved",
        text: `Your reservation for Table ${slot.number} has been canceled. The slot was for ${slotTime}. Please book again if needed.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      // Respond to the client immediately
      res.status(200).json({ message: "Slot unreserved successfully", slot });
    } else {
      res.status(400).json({ message: "You do not have permission to unreserve this slot" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Admin unreserve slot
const adminUnreserveSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const userRole = req.user.role;
    const slotNumber = parseInt(req.params.slotNumber);
    const Slot = getSlotModel(slotNumber);
    const slot = await Slot.findOne({ number });

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const reservedByUser = await User.findById(slot.reservedBy);
    slot.reserved = false;
    slot.reservedBy = null;
    await slot.save();

    const slotTime = getSlotTime(slotNumber);
    const mailOptions = {
      from: 'tastyflow01@gmail.com',
      to: reservedByUser.email,
      subject: 'Slot Unreserved',
      text: `Your reservation for Table ${slot.number} has been canceled by the admin. The slot was for ${slotTime}. Please book again if needed.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        res.status(200).json({ message: 'Slot unreserved by admin and email sent successfully', slot });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add slot
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

// Delete slot
const deleteSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);
    const Slot = getSlotModel(slotNumber);
    const slot = await Slot.findOneAndDelete({ number });

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

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