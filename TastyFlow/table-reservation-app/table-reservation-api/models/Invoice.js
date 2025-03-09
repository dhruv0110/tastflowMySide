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
    invoiceDate: { type: Date, default: Date.now },
    invoiceNumber: { type: Number, required: true }, // Add invoiceNumber field
    cgst : {type: Number, required: true},
    sgst : {type: Number, required: true},
    roundOff : {type: Number, required: true}
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
