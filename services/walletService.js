const User = require('../models/userModel');

const updateWalletBalance = async (email, amount) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  user.balance += amount;
  await user.save();
};

module.exports = {
  updateWalletBalance,
};
