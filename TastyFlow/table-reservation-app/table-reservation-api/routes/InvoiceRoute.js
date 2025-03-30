const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  getInvoicesByUser,
  getUserWithPayments,
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

module.exports = router;