const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  getInvoicesByUser,
  getUserWithPayments,
  updateInvoiceStatus,
  recordPayment,
  getInvoicesByStatus,
  getOverdueInvoices
} = require("../controllers/invoiceController");

// Create an invoice
router.post("/create", createInvoice);

// Get all invoices
router.get("/admin/all-invoice", getAllInvoices);

// Get an invoice by ID
router.get("/admin/:invoiceId", getInvoiceById);

// Edit an invoice by ID
router.put("/admin/update/:invoiceId", updateInvoice);

// Get all invoices by userId
router.get("/admin/invoices/:userId", getInvoicesByUser);

// Get user data with payment details
router.get("/admin/getuser/:userId", getUserWithPayments);

// Update invoice status
router.patch("/admin/:invoiceId/status", updateInvoiceStatus);

// Record a payment for an invoice
router.post("/admin/:invoiceId/record-payment", recordPayment);

// Get invoices by status
router.get("/admin/status/:status", getInvoicesByStatus);

// Get overdue invoices
router.get("/admin/overdue", getOverdueInvoices);
// router.patch("/admin/:invoiceId/status", updateInvoiceStatus);

module.exports = router;