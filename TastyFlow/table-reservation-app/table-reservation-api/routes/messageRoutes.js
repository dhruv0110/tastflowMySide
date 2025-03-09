const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const { storeMessage, getUserMessages,getUserReviews } = require('../controllers/messageController');

// Store a message
router.post('/store-message', fetchUser, storeMessage);

// Get all messages for the logged-in user
router.get('/admin/all-reviews', fetchUser, getUserMessages);

// Updated route to fetch reviews by userId
router.get('/admin/all-reviews/:userId', getUserReviews);


module.exports = router;
