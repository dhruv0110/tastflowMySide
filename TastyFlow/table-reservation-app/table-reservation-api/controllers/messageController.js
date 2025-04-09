const Message = require('../models/Message');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tastyflow01@gmail.com',
    pass: 'npgughkbjtivvxrc',
  },
});

const storeMessage = async (req, res) => {
  const { firstName, lastName, email, contact, message } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newMessage = new Message({
      userId: user._id,
      firstName,
      lastName,
      email,
      contact,
      message,
      status: 'pending'
    });

    await newMessage.save();

    const io = req.app.get('io');
    io.to('adminMessages').emit('newMessage', newMessage);

    res.status(200).json({ message: 'Message saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendReply = async (req, res) => {
  const { messageId, replyContent } = req.body;
  const adminId = req.user.id;

  try {
    if (!messageId || !replyContent) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ 
        success: false,
        message: 'Original message not found' 
      });
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    const formattedDate = new Date(originalMessage.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: '"TastyFlow" <tastyflow01@gmail.com>',
      to: originalMessage.email,
      subject: `Re: Your Message (Ref: ${messageId.slice(-6)})`,
      html:  `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Response to Your Message</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  border-bottom: 1px solid #eaeaea;
                  padding-bottom: 20px;
                  margin-bottom: 20px;
              }
              .logo {
                  text-align: center;
                  margin-bottom: 20px;
              }
              .logo img {
                  max-height: 50px;
              }
              .content-block {
                  background-color: #f9f9f9;
                  border-left: 4px solid #4a90e2;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 0 4px 4px 0;
              }
              .response-block {
                  background-color: #f0f7ff;
                  border-left: 4px solid #4a90e2;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 0 4px 4px 0;
              }
              .meta {
                  font-size: 0.9em;
                  color: #666;
                  margin-bottom: 5px;
              }
              .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #eaeaea;
                  font-size: 0.8em;
                  color: #999;
                  text-align: center;
              }
              .signature {
                  margin-top: 20px;
                  color: #555;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #4a90e2;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  margin-top: 15px;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="logo">
                  <!-- Replace with your logo or company name -->
                  <h2 style="color: #4a90e2; margin: 0;">Tastyflow</h2>
              </div>
              <h1 style="margin: 0; font-size: 1.5em;">Response to Your Message</h1>
          </div>
      
          <p>Dear ${originalMessage.firstName} ${originalMessage.lastName},</p>
      
          <p>Thank you for contacting us. We appreciate you taking the time to share your feedback with us.</p>
      
          <div class="content-block">
              <div class="meta">
                  <strong>Your message:</strong>
                  <span style="float: right;">${formattedDate}</span>
              </div>
              <p>${originalMessage.message}</p>
          </div>
      
          <div class="response-block">
              <div class="meta">
                  <strong>Our response:</strong>
              </div>
              <p>${replyContent}</p>
          </div>
      
          <p>If you have any further questions or need additional assistance, please don't hesitate to reply to this email.</p>
      
          <div class="signature">
              <p>Best regards,</p>
              <p><strong>Customer Support Team of Tastyflow</strong></p>
              <p>Tastyflow</p>
          </div>
      
          <div class="footer">
              <p>Reference ID: ${messageId}</p>
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p>
                  <a href="https://yourcompany.com" style="color: #4a90e2; text-decoration: none;">Website</a> | 
                  <a href="https://yourcompany.com/contact" style="color: #4a90e2; text-decoration: none;">Contact Us</a>
              </p>
          </div>
      </body>
      </html>
            `
    };

    const newReply = {
      content: replyContent,
      adminId: adminId,
      adminName: `${adminUser.firstName} ${adminUser.lastName}`,
      date: new Date(),
      emailDetails: {
        sent: true,
        to: originalMessage.email,
        subject: mailOptions.subject
      }
    };

    await transporter.sendMail(mailOptions);
    
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        $push: { replies: newReply },
        $set: { 
          status: 'replied',
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    const io = req.app.get('io');
    io.to('adminMessages').emit('messageUpdated', updatedMessage);

    return res.status(200).json({
      success: true,
      message: 'Reply sent and stored successfully',
      data: updatedMessage
    });

  } catch (err) {
    console.error('Error sending reply:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: err.message
    });
  }
};

const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserReviews = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({ userId }).sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  storeMessage,
  sendReply,
  getUserMessages,
  getUserReviews
};