const express = require('express');
const SlotController = require('../controllers/SlotController');
const fetchUser = require('../middleware/fetchUser');
const router = express.Router();

router.get('/:slotNumber', SlotController.getAllSlots);
router.get('/:slotNumber/available-tables', SlotController.getAvailableTables);
router.post('/:slotNumber/reserve', fetchUser, SlotController.reserveSlot);
router.post('/:slotNumber/unreserve', fetchUser, SlotController.unreserveSlot);
router.post('/:slotNumber/admin/unreserve', fetchUser, SlotController.adminUnreserveSlot);
router.post('/:slotNumber/add', SlotController.addSlot);
router.delete('/:slotNumber/delete', SlotController.deleteSlot);
router.post('/:slotNumber/create-payment-intent', fetchUser, SlotController.createPaymentIntent);
router.post('/:slotNumber/toggle-status', fetchUser, SlotController.toggleTableStatus);
router.post('/:slotNumber/change-table', fetchUser, SlotController.changeTable);

module.exports = router;