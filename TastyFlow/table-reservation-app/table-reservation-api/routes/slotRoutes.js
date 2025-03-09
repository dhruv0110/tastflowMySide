const express = require('express');
const SlotController = require('../controllers/SlotController');
const fetchUser = require('../middleware/fetchUser');

const router = express.Router();

// Route for getting all slots
router.get('/:slotNumber', SlotController.getAllSlots);

// Route for reserving a slot
router.post('/:slotNumber/reserve', fetchUser, SlotController.reserveSlot);

// Route for unreserving a slot
router.post('/:slotNumber/unreserve', fetchUser, SlotController.unreserveSlot);

// Admin route for unreserving a slot
router.post('/:slotNumber/admin/unreserve', fetchUser, SlotController.adminUnreserveSlot);

// Route for adding a new slot
router.post('/:slotNumber/add', SlotController.addSlot);

// Route for deleting a slot
router.delete('/:slotNumber/delete', SlotController.deleteSlot);
// Route for deleting a slot
// router.delete('/:slotNumber/delete', SlotController.deleteSlot);



module.exports = router;
