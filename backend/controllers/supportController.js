const nodemailer = require('nodemailer');
const User = require('../models/User'); // Import User Model

exports.sendFeedback = async (req, res) => {
  const { type, subject, message } = req.body;
  
  try {
    // Fetch real user details
    const user = await User.findById(req.user.userId);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // IMPROVED HTML EMAIL UI
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2563EB;">New ${type.toUpperCase()}</h2>
        <p><strong>From:</strong> ${user.name} (${user.email})</p>
        <p><strong>User ID:</strong> ${user._id}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <h3 style="color: #333;">${subject}</h3>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; color: #555;">${message}</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `[AXIONYX Support] ${subject}`,
      html: htmlContent // Use HTML instead of text
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Feedback sent successfully' });

  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ msg: 'Failed to send email' });
  }
};