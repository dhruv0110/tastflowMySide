const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foods: [
      {
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    invoiceDate: { type: Date, default: Date.now },
    invoiceNumber: { type: Number, required: true },
    cgst: { type: Number, required: true },
    sgst: { type: Number, required: true },
    roundOff: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number },
    status: { 
      type: String, 
      enum: ['unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled'], 
      default: 'unpaid' 
    },
    payments: [{
      amount: { type: Number, required: true },
      paymentDate: { type: Date, default: Date.now },
      paymentMethod: { 
        type: String, 
        enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
        required: true 
      },
      reference: { type: String },
      receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    dueDate: { type: Date },
    notes: { type: String },
    reservedTableInfo: {
      tableNumber: { type: Number },
      slotTime: { type: String },
      date: { type: Date },
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;