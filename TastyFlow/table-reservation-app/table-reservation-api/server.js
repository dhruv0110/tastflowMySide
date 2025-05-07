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
  },
  pingTimeout: 60000, // Increase ping timeout
  pingInterval: 25000 // Increase ping interval
});

// Enhanced socket.io connection handling with error events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Room joining handlers
  socket.on('joinRoom', (room) => {
    try {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  socket.on('joinFoodRoom', () => {
    try {
      socket.join('foodUpdates');
      console.log(`Socket ${socket.id} joined foodUpdates room`);
    } catch (error) {
      console.error('Error joining food room:', error);
    }
  });

  socket.on('joinAdminMessageRoom', () => {
    try {
      socket.join('adminMessages');
      console.log(`Socket ${socket.id} joined adminMessages room`);
    } catch (error) {
      console.error('Error joining admin message room:', error);
    }
  });

  socket.on('joinSlotRoom', (slotNumber) => {
    try {
      socket.join(`slot_${slotNumber}`);
      console.log(`Socket ${socket.id} joined slot room ${slotNumber}`);
    } catch (error) {
      console.error('Error joining slot room:', error);
    }
  });

  socket.on('joinUserRoom', (userId) => {
    try {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined user room ${userId}`);
    } catch (error) {
      console.error('Error joining user room:', error);
    }
  });

  // New event for table changes
  socket.on('tableChangeRequest', (data) => {
    try {
      console.log('Table change request received:', data);
      // You can add additional validation or processing here
    } catch (error) {
      console.error('Error handling table change request:', error);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  // Heartbeat monitoring
  let heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('ping');
    } else {
      clearInterval(heartbeatInterval);
    }
  }, 15000);

  socket.on('pong', () => {
    // Connection is alive
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO server initialized');
});