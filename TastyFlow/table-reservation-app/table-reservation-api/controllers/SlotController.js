const Slot1 = require('../models/Slot1');
const Slot2 = require('../models/Slot2');
const Slot3 = require('../models/Slot3');
const User = require('../models/User');
const nodemailer = require('nodemailer');

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
  

// Create one transporter for emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tastyflow01@gmail.com',
    pass: 'npgughkbjtivvxrc' // Replace with actual password or use environment variables
  }
});

// Utility function to get the correct model based on slot number
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

// Get all slots (based on the slot number)
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

// Reserve slot
// Modify mailOptions in the reserveSlot function
const reserveSlot = async (req, res) => {
    try {
      const { number } = req.body;
      const userId = req.user.id;
      const slotNumber = parseInt(req.params.slotNumber);
      const Slot = getSlotModel(slotNumber); // Dynamically get Slot model
      const slot = await Slot.findOne({ number });
  
      if (!slot.reserved) {
        slot.reserved = true;
        slot.reservedBy = userId;
        await slot.save();
  
        const populatedSlot = await Slot.findById(slot._id).populate('reservedBy');
        const user = await User.findById(userId);
  
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        const slotTime = getSlotTime(slotNumber); // Get time based on slot number
        const mailOptions = {
          from: 'tastyflow01@gmail.com',
          to: user.email,
          subject: 'Slot Reserved',
          text: `Thank you for reserving a slot. Your Table ${slot.number} of slot timing ${slotTime} is reserved successfully.`,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error sending email' });
          } else {
            res.status(200).json({ message: 'Slot reserved and email sent successfully', slot: populatedSlot });
          }
        });
      } else {
        res.status(400).json({ message: 'Slot is already reserved' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// Modify mailOptions in the unreserveSlot function
const unreserveSlot = async (req, res) => {
    try {
      const { number } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
      const slotNumber = parseInt(req.params.slotNumber);
      const Slot = getSlotModel(slotNumber); // Dynamically get Slot model
      const slot = await Slot.findOne({ number });
  
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
  
      if (userRole === 'admin' || (slot.reserved && String(slot.reservedBy) === String(userId))) {
        const reservedByUser = await User.findById(slot.reservedBy);
        slot.reserved = false;
        slot.reservedBy = null;
        await slot.save();
  
        const slotTime = getSlotTime(slotNumber); // Get time based on slot number
        const mailOptions = {
          from: 'tastyflow01@gmail.com',
          to: reservedByUser.email,
          subject: 'Slot Unreserved',
          text: `Your reservation for Table ${slot.number} has been canceled. The slot was for ${slotTime}. Please book again if needed.`,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error sending email' });
          } else {
            res.status(200).json({ message: 'Slot unreserved and email sent successfully', slot });
          }
        });
      } else {
        res.status(400).json({ message: 'You do not have permission to unreserve this slot' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  // Modify mailOptions in the adminUnreserveSlot function
  const adminUnreserveSlot = async (req, res) => {
    try {
      const { number } = req.body;
      const userRole = req.user.role;
      const slotNumber = parseInt(req.params.slotNumber);
      const Slot = getSlotModel(slotNumber); // Dynamically get Slot model
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
  
      const slotTime = getSlotTime(slotNumber); // Get time based on slot number
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
      res.status(500).json({ message: error.message });
    }
  };

// Add a new slot
const addSlot = async (req, res) => {
    const { number, capacity } = req.body;
    try {
      const Slot = getSlotModel(parseInt(req.params.slotNumber)); // Dynamically get Slot model
      const newSlot = new Slot({ number, capacity });
      await newSlot.save();
      res.status(201).json(newSlot);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  const deleteSlot = async (req, res) => {
    try {
      const { number } = req.body; // Table number to delete
      const slotNumber = parseInt(req.params.slotNumber); // Slot number (1 or 2) from the URL parameter
      const Slot = getSlotModel(slotNumber); // Dynamically get Slot model based on slotNumber
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
  deleteSlot
};
