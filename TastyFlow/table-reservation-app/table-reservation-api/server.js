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
const http = require('http');
const socketIo = require('socket.io');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT']
}));
app.use(express.json());

const mongoUrl = "mongodb://127.0.0.1:27017/register?directConnection=true&serverSelectionTimeoutMS=5000&appName=mongosh+2.0.1";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

connectToMongo();

app.use('/api/slot', slotRoutes);
app.use('/api/users', userRoutes);
app.use("/api/food", foodRoute);
app.use('/api/message', messageRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/uploads", express.static('uploads'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Enhanced socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Room joining handlers
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('joinFoodRoom', () => {
    socket.join('foodUpdates');
    console.log(`Socket ${socket.id} joined foodUpdates room`);
  });

  socket.on('joinAdminMessageRoom', () => {
    socket.join('adminMessages');
    console.log(`Socket ${socket.id} joined adminMessages room`);
  });

  socket.on('joinSlotRoom', (slotNumber) => {
    socket.join(`slot_${slotNumber}`);
    console.log(`Socket ${socket.id} joined slot room ${slotNumber}`);
  });

  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));