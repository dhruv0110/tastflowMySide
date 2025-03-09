const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const slotRoutes = require('./routes/slotRoutes');
const userRoutes = require('./routes/userRoute');
const foodRoute = require("./routes/foodRoute");
const messageRoutes = require("./routes/messageRoutes");
const invoiceRoutes = require("./routes/InvoiceRoute");
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's origin
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT'] // Make sure DELETE is allowed
}));
app.use(express.json());

const mongoUrl = "mongodb://127.0.0.1:27017/register?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1";

const connectToMongo = () => {
    main()
    .then(() => {
      console.log("connected to mongo successfully");
    })
    .catch((err) => console.log(err));
  async function main() {
    await mongoose.connect(mongoUrl);
  }
}
connectToMongo();

app.use('/api/slot', slotRoutes); // Use the unified route for slots
app.use('/api/users', userRoutes);
app.use("/api/food", foodRoute);
app.use('/api/message', messageRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/uploads", express.static('uploads'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));