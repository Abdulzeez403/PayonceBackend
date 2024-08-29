const User = require('../models/userModel'); // Ensure User model is imported
const crypto = require('crypto');
require('dotenv').config();

// Middleware to verify Paystack's webhook signature
const verifyPaystackSignature = (req, res, next) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    next();
  } else {
    res.status(400).send('Invalid signature');
  }
};

const handlePaystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.event === 'charge.success') {
      const { amount, customer } = event.data;
      const email = customer.email;

      // Find user by email
      const user = await User.findOne({ email });
      if (user) {
        // Update user's balance
        user.balance += amount / 100; // Convert kobo to Naira
        await user.save();

        res.status(200).send('User balance updated via webhook');
      } else {
        res.status(404).send('User not found');
      }
    } else {
      res.status(400).send('Unhandled event');
    }
  } catch (error) {
    console.error('Error handling Paystack webhook:', error);
    res.status(500).send('Internal server error');
  }
};

module.exports = { handlePaystackWebhook, verifyPaystackSignature };
