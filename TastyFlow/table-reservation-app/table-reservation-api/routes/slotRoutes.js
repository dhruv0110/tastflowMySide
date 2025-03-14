const express = require('express');
const SlotController = require('../controllers/SlotController');
const fetchUser = require('../middleware/fetchUser');
const Slot1 = require('../models/Slot1'); // Import the Slot1 model
const User = require('../models/User'); // Import the User model
const router = express.Router();

router.get('/:slotNumber', SlotController.getAllSlots);
// router.post('/:slotNumber/reserve', fetchUser, SlotController.reserveSlot);
router.post('/:slotNumber/reserve', fetchUser, SlotController.reserveSlot);
router.post('/:slotNumber/unreserve', fetchUser, SlotController.unreserveSlot);
router.post('/:slotNumber/admin/unreserve', fetchUser, SlotController.adminUnreserveSlot);
router.post('/:slotNumber/add', SlotController.addSlot);
router.delete('/:slotNumber/delete', SlotController.deleteSlot);
router.post('/:slotNumber/create-payment-intent', fetchUser, SlotController.createPaymentIntent); // New route for Stripe payment

module.exports = router;