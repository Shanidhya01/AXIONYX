const nodemailer = require('nodemailer');
const User = require('../models/User'); // Import User Model

exports.sendFeedback = async (req, res) => {
  const { type, subject, message } = req.body;

  try {
    if (!subject || !String(subject).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ msg: 'Subject and message are required' });
    }

    // Fetch real user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const safeType = String(type || 'feedback');

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // In development, don't hard-fail the form if email isn't configured.
    const isProd = process.env.NODE_ENV === 'production';
    if (!emailUser || !emailPass) {
      if (isProd) {
        return res.status(500).json({ msg: 'Email service not configured' });
      }
      console.warn('[support] EMAIL_USER/EMAIL_PASS not set; skipping email send.');
      return res.json({ msg: 'Feedback received (email delivery not configured in dev)' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // IMPROVED HTML EMAIL UI
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2563EB;">New ${safeType.toUpperCase()}</h2>
        <p><strong>From:</strong> ${user.name} (${user.email})</p>
        <p><strong>User ID:</strong> ${user._id}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <h3 style="color: #333;">${String(subject).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; color: #555; white-space: pre-wrap;">${String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      </div>
    `;

    const mailOptions = {
      from: emailUser,
      to: emailUser,
      subject: `[AXIONYX Support] ${subject}`,
      html: htmlContent // Use HTML instead of text
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({ msg: 'Feedback sent successfully' });
    } catch (mailErr) {
      console.error('Email Error:', mailErr);
      if (isProd) {
        return res.status(500).json({ msg: 'Failed to send email' });
      }
      return res.json({ msg: 'Feedback received (email delivery failed in dev; check server logs)' });
    }

  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ msg: 'Failed to send email' });
  }
};