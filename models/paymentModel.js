const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  reference: { type: String, required: true },
  status: { type: String, default: 'pending' },
  paymentType: { type: String, required: true },

});

module.exports = mongoose.model('Payment', paymentSchema);
