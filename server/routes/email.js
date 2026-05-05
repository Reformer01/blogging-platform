import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure email service (update with your SMTP settings)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email notification
export const sendEmailNotification = async (email, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@bloghub.com',
      to: email,
      subject,
      html,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Email error:', error);
  }
};

// Subscribe to newsletter
router.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    await sendEmailNotification(
      email,
      'Welcome to BlogHub Newsletter',
      `<h1>Welcome!</h1><p>Thank you for subscribing to our newsletter.</p>`
    );

    res.json({ message: 'Subscription successful. Check your email!' });
  } catch (error) {
    next(error);
  }
});

export default router;
