const User = require('../models/User');
const Food = require('../models/FoodModel');  // Import Food model
const Invoice = require('../models/Invoice');  // Import Invoice model
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { toWords } = require('number-to-words');
const JWT_SECTRET = 'dhruvdhruvdhruv';

// Create a User
const createUser = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry, a user with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            contact: req.body.contact,
        });

        const data = {
            user: {
                id: user.id,
            }
        };

        const authtoken = jwt.sign(data, JWT_SECTRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

// Authenticate a User
const loginUser = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }
        const data = { user: { id: user.id, role: user.role } };
        const authtoken = jwt.sign(data, JWT_SECTRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

// Get User Details
const getUser = async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

// Fetch all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude passwords
        res.json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
};

// Add this route to fetch user details by ID
const getUserId = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  };
  

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 60000);
        const formattedExpiry = expiryDate.toTimeString().slice(0, 5);

        user.otp = otp;
        user.otpExpiry = formattedExpiry;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tastyflow01@gmail.com',
                pass: 'npgughkbjtivvxrc'
            }
        });

        const mailOptions = {
            from: 'tastyflow01@gmail.com',
            to: email,
            subject: 'Reset Password from TastyFlow',
            text: `Your OTP is ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                res.status(200).json({ message: 'OTP sent successfully' });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const now = new Date();
        if (user.otpExpiry < now) {
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const addFoodToUser = async (req, res) => {
    const { userId } = req.params;  // User ID from params
    const { foods } = req.body;     // Array of food items and their quantities

    try {

        const user = await User.findById(userId);  // Fetch user by userId
        if (!user) {
            console.error("User not found with ID:", userId);
            return res.status(404).json({ message: "User not found" }); // Ensure proper JSON response
        }

        // Loop through the foods array and update the selectedFoods for the user
        for (const food of foods) {
            // Fetch the full food data from the Food model using the foodId
            const foodItem = await Food.findById(food.foodId);
            if (!foodItem) {
                console.error("Food item not found:", food.foodId);
                return res.status(404).json({ message: `Food item with ID ${food.foodId} not found` }); // Proper JSON response
            }

            // Check if the food already exists in the user's selectedFoods
            const existingFood = user.selectedFoods.find((f) => f.food.toString() === food.foodId);

            if (existingFood) {
                // If the food item already exists, update the quantity
                existingFood.quantity += food.quantity;  // Add the new quantity to the existing one
            } else {
                // If the food doesn't exist, add the food item to the selectedFoods array
                user.selectedFoods.push({
                    food: food.foodId,   // Store foodId
                    quantity: food.quantity,  // Store the quantity
                    price: foodItem.price,  // Store the price from the Food model
                    name: foodItem.name    // Store the name from the Food model
                });
            }
        }

        // Save the user document after updating the selectedFoods
        await user.save();

        // Send a success message
        res.json({ message: "Foods added to user successfully" });  // Return success as JSON
    } catch (error) {
        console.error("Error adding food to user:", error.message); // Log error details
        res.status(500).json({ message: "Server error" });  // Return error as JSON
    }
};

  // Send Invoice via email as a PDF
  const sendInvoice = async (req, res) => {
    try {
        const { userId } = req.body;
        const { invoiceId } = req.params;

        // Fetch user and invoice details
        const user = await User.findById(userId);
        const invoice = await Invoice.findById(invoiceId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Create a professional email template
        const emailHTML = `
        <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              background-color: #f8f9fa;
              padding: 20px;
            }
            .invoice-container {
              max-width: 700px;
              margin: auto;
              background: #fff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .invoice-header {
              text-align: center;
              border-bottom: 2px solid #007bff;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .invoice-header h2 {
              margin: 0;
              color: #007bff;
              font-size: 28px;
            }
            .invoice-header p {
              margin: 5px 0;
              font-size: 14px;
              color: #555;
            }
            .company-info {
              text-align: center;
              font-size: 14px;
              margin-bottom: 25px;
              color: #555;
            }
            .company-info h3 {
              margin: 0 0 10px 0;
              color: #007bff;
              font-size: 20px;
            }
            .user-details, .order-summary, .tax-summary, .final-total, .reserved-table-info {
              margin-bottom: 25px;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
              background-color: #f9f9f9;
            }
            h3 {
              color: #333;
              margin-bottom: 15px;
              border-bottom: 1px solid #007bff;
              padding-bottom: 8px;
              font-size: 18px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #007bff;
              color: white;
              font-weight: bold;
            }
            .tax-summary .total {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .final-total {
              font-size: 16px;
              font-weight: bold;
              border-top: 2px solid #007bff;
              text-align: right;
              padding-top: 15px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 25px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <h2>Invoice</h2>
              <p>Invoice No: <strong>${invoice.invoiceNumber}</strong></p>
              <p>Invoice Date: <strong>${new Date(invoice.invoiceDate).toLocaleDateString()}</strong></p>
            </div>

            <div class="company-info">
              <h3>TastyFlow</h3>
              <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
              <p>Phone: (909) 91-49101 | Email: tastyflow@gmail.com</p>
              <p>GSTIN: 12ABCDE1234F1GH</p>
            </div>

            <div class="user-details">
              <h3>Bill To:</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Contact:</strong> ${user.contact}</p>
              <p><strong>Customer ID:</strong> ${user._id}</p>
            </div>

            <div class="order-summary">
              <h3>Order Summary</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit Price (₹)</th>
                    <th>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.foods
                    .map(
                      (food, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${food.name}</td>
                      <td>${food.quantity}</td>
                      <td>${food.price.toFixed(2)}</td>
                      <td>${(food.quantity * food.price).toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>

            <div class="tax-summary">
              <h3>Tax Summary</h3>
              <div class="total">
                <div class="label">CGST (2.5%):</div>
                <div class="value">₹${invoice.cgst.toFixed(2)}</div>
              </div>
              <div class="total">
                <div class="label">SGST (2.5%):</div>
                <div class="value">₹${invoice.sgst.toFixed(2)}</div>
              </div>
              <div class="total">
                <div class="label">Round-off:</div>
                <div class="value">₹${invoice.roundOff.toFixed(2)}</div>
              </div>
            </div>

            <div class="final-total">
              <p><strong>Total Payable:</strong> ₹${invoice.totalAmount.toFixed(2)}</p>
              <p><strong>Amount in Words:</strong> ${toWords(invoice.totalAmount)} Only</p>
            </div>

            ${
              invoice.reservedTableInfo == null // Check if reservedTableInfo exists
                ? `
              <div class="reserved-table-info">
                <h3>Reservation Details</h3>
                <p><strong>Table No:</strong> ${invoice.reservedTableInfo.tableNumber}</p>
                <p><strong>Reservation Slot:</strong> ${invoice.reservedTableInfo.slotTime}</p>
                <p><strong>Reservation Fee Deduction:</strong> ₹100 (included in total)</p>
              </div>
            `
                : "" // If reservedTableInfo is undefined, render nothing
            }

            <div class="footer">
              <p>Thank you for choosing TastyFlow. We appreciate your business!</p>
              <p><strong>TastyFlow</strong> - All Rights Reserved</p>
            </div>
          </div>
        </body>
        </html>
      `;

        const mailOptions = {
            from: 'tastyflow01@gmail.com',
            to: user.email,
            subject: `TastyFlow Invoice of ${user.name}`,
            html: emailHTML,
        };

        // Send the email using a nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tastyflow01@gmail.com',
                pass: 'npgughkbjtivvxrc', // Use a secure app password
            },
        });

        // Send the email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Invoice sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
  
  

module.exports = {
    createUser,
    loginUser,
    getUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getAllUsers,
    getUserId,
    addFoodToUser,
    sendInvoice,
};
