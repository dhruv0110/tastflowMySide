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
            /* Print-specific styles */
            @page {
              size: auto; /* Auto size for thermal paper */
              margin: 0; /* No margin to maximize space */
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10px; /* Smaller font size for compact layout */
              line-height: 1.2; /* Tight line spacing */
              margin: 0;
              padding: 0;
              color: #000; /* Black text for thermal printers */
              background: #fff; /* White background */
            }
            .invoice-container {
              width: 100%;
              max-width: 80mm; /* Adjust for 58mm or 80mm paper */
              margin: 0 auto;
              padding: 5px; /* Minimal padding */
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 5px;
            }
            .invoice-header h2 {
              font-size: 14px; /* Slightly larger for headings */
              margin: 0;
              color: #000;
            }
            .invoice-header p {
              font-size: 10px;
              margin: 3px 0;
              color: #000;
            }
            .company-info {
              text-align: center;
              margin-bottom: 5px;
            }
            .company-info h3 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .company-info p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .user-details {
              margin-bottom: 5px;
              padding: 5px 0;
              border-top: 1px dashed #000; /* Dashed border for separation */
              border-bottom: 1px dashed #000;
            }
            .user-details h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .user-details p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .food-details {
              margin-bottom: 5px;
            }
            .food-details h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .food-details table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 5px;
            }
            .food-details th,
            .food-details td {
              padding: 3px;
              text-align: left;
              border-bottom: 1px dashed #000; /* Dashed border for table rows */
            }
            .food-details th {
              font-weight: bold;
              background-color: #f0f0f0; /* Light gray background for headers */
            }
            .tax-summary {
              margin-bottom: 5px;
            }
            .tax-summary .total {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin-bottom: 3px;
            }
            .final-total {
              font-size: 12px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 2px solid #000; /* Solid border for emphasis */
            }
            .reservation-details {
              margin-bottom: 5px;
              padding: 5px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
            }
            .reservation-details h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .reservation-details p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              color: #000;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <h2>TastyFlow</h2>
              <p>Invoice No: ${invoice.invoiceNumber}</p>
              <p>Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>

            <div class="company-info">
              <h3>Restaurant Details</h3>
              <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
              <p>Phone: (909) 91-49101</p>
            </div>

            <div class="user-details">
              <h5>Bill To:</h5>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Contact:</strong> ${user.contact}</p>
            </div>

            <div class="food-details">
              <h5>Items Purchased</h5>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.foods.map((food, index) => `
                    <tr>
                      <td>${food.name}</td>
                      <td>${food.quantity}</td>
                      <td>${food.price.toFixed(2)}</td>
                      <td>${(food.quantity * food.price).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="tax-summary">
              <div class="total"><span>CGST (2.5%):</span> <span>₹${invoice.cgst.toFixed(2)}</span></div>
              <div class="total"><span>SGST (2.5%):</span> <span>₹${invoice.sgst.toFixed(2)}</span></div>
              <div class="total"><span>Round-off:</span> <span>₹${invoice.roundOff.toFixed(2)}</span></div>
              ${
                invoice.discount > 0
                ?
                `<div class="total"><span>Discount:</span> <span>₹${invoice.discount.toFixed(2)}</span></div>`
                :
                ''
              }
            </div>

            <div class="final-total">
              <div>Total Payable:</div>
              ${
                invoice.discount > 0
                ?
                `<div>₹${invoice.finalAmount}</div>`
                :
                `<div>₹${invoice.totalAmount}</div>`
              }
            </div>

         
            ${invoice.reservedTableInfo && invoice.reservedTableInfo.tableNumber ? `
              <div class="reservation-details">
                <h5>Reservation Details</h5>
                <p><strong>Table No:</strong> ${invoice.reservedTableInfo.tableNumber}</p>
                <p><strong>Reservation Slot:</strong> ${invoice.reservedTableInfo.slotTime}</p>
                <p><strong>Reservation Fee:</strong> ₹100 (included in total)</p>
              </div>
            ` : ''}
         

            <div class="footer">
              <p>Thank you for dining with us!</p>
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
