const express = require('express');
const {
    signUpUser, verifyEmail, updateProfile, resetPassword, loginUser,CurrentUser
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const limiter = require('../middlewares/rateLimiter')

const router = express.Router();

// Current User 
router.get('/user', protect, CurrentUser)

// User Sign-Up
router.post('/signup', signUpUser); 


// User Sign-Up
router.post('/verify', protect, verifyEmail); 

// User Login
router.post('/login', limiter, loginUser);

// User Profile Update (Protected Route)
router.put('/profile', protect, updateProfile);


// Password Reset
router.post('/reset-password', resetPassword);

module.exports = router;
