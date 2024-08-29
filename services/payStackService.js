const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

const initializePayment = async (email, amount) => {
  const payment = await paystack.transaction.initialize({
    email,
    amount: amount * 100, // Paystack requires amount in kobo
    callback_url: process.env.PAYSTACK_CALLBACK_URL || "http://localhost:5000",
  });
  return payment;
};

const verifyPayment = async (reference) => {
  const verification = await paystack.transaction.verify({ reference });
  return verification;
};

module.exports = {
  initializePayment,
  verifyPayment,
};
