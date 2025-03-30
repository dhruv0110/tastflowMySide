const Message = require('../models/Message');
const User = require('../models/User');

const storeMessage = async (req, res) => {
    const { firstName, lastName, email, contact, message } = req.body;
    const userId = req.user.id;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Ensure all required fields are passed to the Message model
      const newMessage = new Message({
        userId: user._id,
        firstName,
        lastName,
        email,
        contact,
        message
      });
  
      await newMessage.save();
      res.status(200).json({ message: 'Message saved successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Get all reviews
const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserReviews = async (req, res) => {
  const { userId } = req.params; // Use req.params to get the userId
  try {
    const messages = await Message.find({ userId }); // Fetch messages only for this userId
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  storeMessage,
  getUserMessages,
  getUserReviews
};
