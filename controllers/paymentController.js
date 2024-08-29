const Payment = require('../models/paymentModel');
const { initializePayment, verifyPayment } = require('../services/paystackService');
const { updateWalletBalance } = require('../services/walletService');

const initializePayStackPayment = async (req, res) => {
  const { email, amount } = req.body;

  try {
    const payment = await initializePayment(email, amount);

    // Save payment details to the database
    const newPayment = new Payment({
      email,
      amount,
      reference: payment.data.reference,
      paymentType: "paystack"
    });
    await newPayment.save();

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyPayStackPayment = async (req, res) => {
  const { reference } = req.body;

  try {
    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const verification = await verifyPayment(reference);

    payment.status = verification.data.status;
    await payment.save();

    if (verification.data.status === 'success') {
      // Update user's wallet balance
      await updateWalletBalance(payment.email, payment.amount);
      res.json({ message: 'Payment verified and wallet updated successfully' });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  initializePayStackPayment,
  verifyPayStackPayment,
};
