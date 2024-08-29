const User = require('../models/userModel');
const crypto =require("crypto")
const sendEmail = require("../services/sendEmail")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');




const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit code
  };

  
//Register User
const signUpUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
      // Validate input data
      if (!email || !password || !firstName || !lastName || !phone) {
          return res.status(400).json({ msg: 'All fields are required' });
      }

      // Check if the email already exists
      const checkEmail = await User.findOne({ email });
      if (checkEmail) {
          return res.status(400).json({ msg: 'Email already exists!' });
      }

      // Check if the phone already exists
      const checkPhone = await User.findOne({ phone });
      if (checkPhone) {
          return res.status(400).json({ msg: 'Phone number already exists!' });
      }


      // Generate verification code and expiry
      const verificationCode = generateVerificationCode();
      const verificationCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

      // Create new user instance
      const user = new User({
          firstName,
          lastName,
          email,
          phone,
          password,
          verificationCode,
          verificationCodeExpiry,
          isVerified: false,
      });

      // Save user to the database
      await user.save();

      // Send verification email
      await sendEmail({
          email: user.email,
          subject: 'Email Verification Code',
          message: `Your verification code is ${verificationCode}`,
      });

      // Generate JWT token
      const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      // Send response
      res.status(201).json({
          msg: 'User registered. Please verify your email.',
          email: user.email,
          token: token,
      });
  } catch (error) {
      console.error('Sign up error:', error);
      res.status(500).json({ msg: 'Internal server error' });
  }
};



// Email Verification
const verifyEmail = async (req, res) => {
    const { email, verificationCode } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      if (user.verificationCode !== verificationCode || Date.now() > user.verificationCodeExpiry) {
        return res.status(400).send('Invalid or expired verification code');
      }

      user.isVerified = true;
      user.verificationCode = null; // Clear the code after successful verification
      user.verificationCodeExpiry = null; // Clear the expiry after successful verification
      await user.save();
  
      res.status(200).json({msg:'Email verified successfully'});
    } catch (error) {
      res.status(500).send(error.msg);
    }
}

// Update profile
const updateProfile = async (req, res) => {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user.id; // Assuming user ID is attached to req.user by auth middleware
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.phone = phone || user.phone;
      await user.save();
  
      res.status(200).json({msg:'Profile updated successfully'});
    } catch (error) {
      res.status(500).send(error.msg);
    }
  };

  //Current User 
  const CurrentUser = async (req, res) => {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId).select('-password'); 
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ err: 'Server error', error: error.message });
    }
  };
  
  // Reset password
  const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  

      await sendEmail({
        email: user.email,
        subject: 'Password Reset Confirmation',
        message: 'Your password has been reset successfully'
      });
  
      res.json({msg:'Password reset successfully!'});
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
 
  // Login User

  const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ msg: 'Email not verified' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            msg: 'Logged In Successfully',
            token 
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

  
  
  module.exports = { signUpUser, verifyEmail, updateProfile, resetPassword, loginUser ,CurrentUser};
