const User = require('../models/User');
const Food = require('../models/FoodModel');  // Import Food model
const Invoice = require('../models/Invoice');  // Import Invoice model
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const PDFDocument = require('pdfkit');
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
  
      // Fetch the user and invoice details
      const user = await User.findById(userId);
      const invoice = await Invoice.findById(invoiceId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
  
      // Create the email HTML content
      const emailHTML = `
      <html>
  <head>
    <title>Invoice - ${invoice.invoiceNumber}</title>
    <style>
      @page {
        size: A4;
        margin: 20mm;
      }
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
        background-color: #f4f4f4;
      }
      .invoice-container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #f4f4f4;
        padding-bottom: 20px;
        margin-bottom: 20px;
        width: 100%;
      }

      .company-info {
      width: 40%;
        flex: 1;
        text-align: right;
      }
      .company-info h3 {
        margin-bottom: 5px;
        font-size: 18px;
        color: #333;
      }
      .company-info p {
        font-size: 12px;
        color: #555;
        margin: 5px 0;
      }
      .extra-info{
        width: 15%;
      }
      .invoice-info {
      width: 45%;
        text-align: left;
        flex: 1;
      }
      .invoice-info h4 {
        font-size: 20px;
        margin: 0;
        color: #333;
      }
      .invoice-info p {
        font-size: 12px;
        color: #555;
        margin: 5px 0;
      }

      .user-details {
        margin: 20px 0;
        border-top: 2px solid #f4f4f4;
        padding-top: 10px;
      }
      .user-details h5 {
        font-size: 16px;
        color: #333;
        margin-bottom: 10px;
      }
      .food-details {
        margin: 20px 0;
      }
      .food-details table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 14px;
      }
      .food-details th,
      .food-details td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      .food-details th {
        background-color: #f9f9f9;
        color: #333;
      }
      .food-details td {
        color: #555;
      }
      .total-summary {
        margin-top: 20px;
        font-size: 14px;
        color: #333;
      }
      .total-summary .total {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
      }
      .final-total {
        display: flex;
        
        justify-content: space-between;
        font-size: 18px;
        font-weight: bold;
        margin-top: 20px;
        border-top: 2px solid #f4f4f4;
        padding-top: 10px;
      }
        .final-total div {
        width: 50%;
        }
      .invoice-footer {
        text-align: center;
        font-size: 14px;
        color: #888;
        margin-top: 30px;
      }
      .invoice-footer p {
        margin: 5px 0;
      }
      /* New styles to align text */
      .total-summary .total div {
        width: 50%;
      }
      .total-summary .total div:first-child {
        text-align: left;
        font-weight: normal;
      }
      .total-summary .total div:last-child {
        text-align: right;
        font-weight: normal;
      }
      .final-total div {
        font-size: 1.5rem;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <div class="invoice-header">
      <!-- Invoice Information -->
        <div class="invoice-info">
          <h4>Invoice No. ${invoice.invoiceNumber}</h4>
          <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          <p><strong>Invoice ID:</strong> ${invoice._id}</p>
        </div>
            <div class="extra-info">
            </div>
        <!-- Company Information -->
        <div class="company-info">
          <h3 style= "margin-top:0">TastyFlow</h3>
          <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
          <p>Phone: (909)991-49101</p>
          <p>Email: tastyflow@gmail.com</p>
        </div>

        
      </div>

      <!-- User Details -->
      <div class="user-details">
        <h5>Bill To:</h5>
        ${user ? ` 
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Contact:</strong> ${user.contact}</p>
          <p><strong>Id:</strong> ${user._id}</p>
        ` : '<p>No user data available</p>'}
      </div>

      <!-- Items Purchased Table -->
      <div class="food-details">
        <h5>Items Purchased</h5>
        <table>
          <thead>
            <tr>
              <th style="text-align: center;">SI Number</th>
              <th style="text-align: center;">Description</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: center;">Unit Price</th>
              <th style="text-align: center;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.foods.map((food, index) => `
              <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${food.name}</td>
                <td style="text-align: center;">${food.quantity}</td>
                <td style="text-align: center;">${(food.price).toFixed(2)}</td>
                <td style="text-align: right;">${(food.quantity * food.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Total and Summary -->
      <div class="total-summary">
        <div class="total">
          <div>CGST (2.5%)</div>
          <div style="text-align: right; margin-right : 9px;">${invoice.cgst.toFixed(2)}</div>
        </div>
        <div class="total">
          <div>SGST (2.5%)</div>
          <div style="text-align: right; margin-right : 9px;">${invoice.sgst.toFixed(2)}</div>
        </div>
        <div class="total">
          <div>Round-off</div>
          <div style="text-align: right; margin-right : 9px;">${invoice.roundOff.toFixed(2)}</div>
        </div>
      </div>

      <!-- Final Total -->
      <div class="final-total">
        <div>Total</div>
        <div style="text-align: right; margin-right : 9px;">${invoice.totalAmount.toFixed(2)}</div>
      </div>

      <hr/>

      <!-- Footer -->
      <div class="invoice-footer">
        <p>Thank you for your business!</p>
        <p>TastyFlow - All Rights Reserved</p>
      </div>
    </div>
  </body>
</html>



      `;
  
      // Set up email options with HTML content
      const mailOptions = {
        from: 'tastyflow01@gmail.com',
        pass: 'npgughkbjtivvxrc',
        to: user.email,
        subject: `TastyFlow Invoice of ${user.name}`,
        html: emailHTML,
      };
  
      // Create the email transport
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'tastyflow01@gmail.com',
          pass: 'npgughkbjtivvxrc', // Use a secure app password
        },
      });
  
      // Send the email
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Invoice sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error sending invoice' });
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
